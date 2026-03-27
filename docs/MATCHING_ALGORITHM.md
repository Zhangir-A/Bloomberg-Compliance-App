# CARIP Matching Algorithm

Deep dive into the fuzzy matching logic for compliance screening.

---

## Overview

CARIP uses a **three-stage fuzzy matching pipeline** to handle:

1. **Cyrillic ↔ Latin transliteration** (Kazakhstan context)
2. **Name order variants** (e.g., "Alimov Nurlan" vs "Nurlan Alimov")
3. **Typos and misspellings** (OCR errors, manual input mistakes)

---

## Stage 1: Transliteration

**File:** `backend/src/utils/transliterate.js`

### Problem
Users may input names in Cyrillic (e.g., "Нұрсұлтан Назарбаев"), but database may store Latin only. Conversely, DB may store both, but matching must be consistent.

### Solution
Convert **all inputs** to Latin before fuzzy matching.

```javascript
// Input: "Нұрсұлтан" (Cyrillic)
const toLatinChars = (text) => {
  const cyrillicToLatin = new CyrillicToTranslit({ preset: 'ru' });
  return cyrillicToLatin.transform(text).toLowerCase().trim();
};
// Output: "nursultan" (Latin)
```

### Normalization Rules

1. **Trim whitespace** — Remove leading/trailing spaces
2. **Lowercase** — Normalize case for consistent matching
3. **Remove punctuation** — Strip accents, special chars (but preserve Cyrillic)
4. **Collapse spaces** — Replace multiple spaces with single space

```javascript
const normalizeName = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\u0400-\u04FF]/g, '');
};
```

### Detection Logic

```javascript
const standardizeForMatching = (name) => {
  const normalized = normalizeName(name);
  const hasCyrillic = /[\u0400-\u04FF]/.test(normalized);

  if (hasCyrillic) {
    return toLatinChars(normalized);  // Convert to Latin
  }
  return normalized;  // Already Latin
};
```

### Examples

| Input | Output |
|-------|--------|
| "Нұрсұлтан Назарбаев" | "nursultan nazarbaev" |
| "Nursultan NAZARBAYEV" | "nursultan nazarbayev" |
| "Alimov, Nurlan" | "alimov nurlan" |
| "ВЛАДИМИР ПУТИН" | "vladimir putin" |

---

## Stage 2: Fuzzy Matching

**File:** `backend/src/utils/fuzzyMatch.js`

### Problem
Even after normalization, names may not match exactly due to:
- Typos: "Almov" instead of "Alimov"
- Transliteration variants: "Nazarbayev" vs "Nazarbayev" (different systems)
- Name order: "Alimov Nurlan" vs "Nurlan Alimov"

### Solution
Use **two algorithms** and take the maximum score:

#### Algorithm 1: Levenshtein Ratio (fuzz.ratio)

Measures character-by-character similarity. Good for typos.

```
Input A: "alimov"
Input B: "almov"
         ^^^^^^ (1 deletion = 5/6 similarity = 83%)
```

```javascript
const basicRatio = fuzz.ratio(input, candidate);
// Returns 0-100
```

#### Algorithm 2: Token Sort Ratio (fuzz.token_sort_ratio)

Splits into tokens (words), sorts both, then compares. Good for name order variants.

```
Input A: "alimov nurlan"
Input B: "nurlan alimov"

After tokenize & sort:
A: ["alimov", "nurlan"] → sorted → ["alimov", "nurlan"]
B: ["nurlan", "alimov"] → sorted → ["alimov", "nurlan"]

Result: 100% match
```

```javascript
const tokenSortRatio = fuzz.token_sort_ratio(input, candidate);
```

### Score Combination

```javascript
export const calculateMatchScore = (input, candidate) => {
  const standardizedInput = standardizeForMatching(input);
  const standardizedCandidate = standardizeForMatching(candidate);

  const basicRatio = fuzz.ratio(standardizedInput, standardizedCandidate);
  const tokenSortRatio = fuzz.token_sort_ratio(standardizedInput, standardizedCandidate);

  return Math.max(basicRatio, tokenSortRatio);
};
```

### Examples

| Input | DB Entry | ratio | token_sort | Max | Confidence |
|-------|----------|-------|------------|-----|------------|
| alimov nurlan | nurlan alimov | 67 | 100 | **100** | Exact |
| alimov | alimov | 100 | 100 | **100** | Exact |
| almov | alimov | 83 | 83 | **83** | High |
| nursultan | nurlan | 73 | 73 | **73** | Medium |
| vladimir | dmitry | 27 | 27 | **27** | No Match |

---

## Stage 3: Thresholding

**File:** `backend/src/utils/fuzzyMatch.js`

### Confidence Bands

Score interpreted as:

```javascript
export const scoreToConfidenceLevel = (score) => {
  if (score === 100) return { level: 'Exact Match', color: 'red' };
  if (score >= 85) return { level: 'High Confidence', color: 'yellow' };
  if (score >= 70) return { level: 'Medium Confidence', color: 'yellow' };
  if (score >= 50) return { level: 'Low Confidence', color: 'green' };
  return { level: 'No Match', color: 'green' };
};
```

### Threshold Logic

Default minimum threshold: **50%**

```javascript
export const meetsThreshold = (score, threshold = 50) => {
  return score >= threshold;
};
```

**Rationale:**
- **100-85 (Exact/High):** Red badge — Alert analyst immediately
- **85-70 (High/Medium):** Yellow badge — Review recommended
- **70-50 (Medium/Low):** Green badge — Review if high-risk entity
- **<50:** Discard — Likely false positive

### Tuning (M6)

After M5 deployment with case decisions, measure false positive rate:

```sql
SELECT
  decision,
  COUNT(*) as count
FROM case_decisions
GROUP BY decision;
```

If false positive rate > 10%, lower threshold or adjust scoring weights.

---

## Stage 4: Ranking

**File:** `backend/src/utils/fuzzyMatch.js`

After filtering by threshold, sort results by score descending:

```javascript
export const rankMatches = (matches) => {
  return matches.sort((a, b) => b.score - a.score);
};
```

**Output Order:**
1. 100% exact matches first
2. 85-99% high confidence
3. 70-84% medium confidence
4. 50-69% low confidence

---

## Integration: matchingService.js (M2)

**Orchestration flow:**

```javascript
// backend/src/services/matchingService.js (pseudocode)

export async function screenPerson(name, dob, nationality) {
  const standardized = standardizeForMatching(name);
  const startTime = Date.now();

  // Query all 3 data sources
  const sanctionResults = await queryAndScore('sanctions_list', standardized);
  const pepResults = await queryAndScore('pep_profiles', standardized);
  const mediaResults = await queryAndScore('adverse_media', standardized);

  // Combine and rank
  const allMatches = [
    ...sanctionResults,
    ...pepResults,
    ...mediaResults,
  ];

  const ranked = rankMatches(allMatches);
  const filtered = ranked.filter(m => meetsThreshold(m.score));

  return {
    request_id: generateRequestId(),
    results: filtered.slice(0, 10),  // Top 10
    response_ms: Date.now() - startTime,
  };
}

async function queryAndScore(table, input) {
  const candidates = await db[table].findAll();
  return candidates
    .map(c => ({
      ...c.toJSON(),
      score: calculateMatchScore(input, c.name_latin),
    }))
    .filter(m => meetsThreshold(m.score));
}
```

---

## Performance Analysis

### Time Complexity

For N-row database:

```
Time = O(N × M)
  where N = table size, M = avg string length

Levenshtein ratio: O(M²) naive, O(M) with optimization (fuzzball uses Wagner-Fischer)
Token sort: O(M log M) for sorting

Per match: ~1-10ms for typical names (M < 255 chars)
Full screening (50K DB): N × 1ms = ~50ms per table = 150ms total ✓
```

### Optimization Tips

1. **Index on name_latin:** Sequelize creates automatically for indexed fields
2. **Batch queries:** Don't iterate; fetch all then score (as above)
3. **Parallel table queries:** Use Promise.all() for async queries
4. **Cache:** Add Redis for exact-match cache (M6)

---

## Edge Cases & Gotchas

### Case 1: Middle Name Transposition
```
Input: "Vladimir Ivanovich Putin"
DB: "Vladimir Putin"

token_sort: ["ivanovich", "putin", "vladimir"] vs ["putin", "vladimir"]
Result: ~70% (medium confidence) ✓ — Correct, requires review
```

### Case 2: Cyrillic Variant
```
Input: "Владимир" (Cyrillic)
DB: "Vladimir" (Latin)

After standardization:
Input → "vladimir"
DB → "vladimir"

Result: 100% exact match ✓
```

### Case 3: Multiple Spaces
```
Input: "Alimov   Nurlan" (3 spaces)
Normalized: "alimov nurlan" (1 space)

DB: "alimov nurlan"
Result: 100% ✓
```

### Case 4: Abbreviations
```
Input: "V Putin"
DB: "Vladimir Putin"

fuzz.ratio: 27% (too low)
token_sort: 50% (borderline)
Result: Possible false negative ⚠️

Mitigation: User should enter full name; screening UI prompts for full name.
```

---

## Testing Strategy (M2)

**Unit Tests:** `backend/test/fuzzyMatch.test.js`

```javascript
describe('calculateMatchScore', () => {
  test('exact match returns 100', () => {
    expect(calculateMatchScore('alimov', 'alimov')).toBe(100);
  });

  test('name order variant returns 100', () => {
    expect(calculateMatchScore('alimov nurlan', 'nurlan alimov')).toBe(100);
  });

  test('cyrillic input converts correctly', () => {
    expect(calculateMatchScore('Алимов', 'alimov')).toBe(100);
  });

  test('typo returns high confidence', () => {
    const score = calculateMatchScore('almov', 'alimov');
    expect(score).toBeGreaterThanOrEqual(80);
  });

  test('unrelated names return low score', () => {
    expect(calculateMatchScore('vladimir', 'dmitry')).toBeLessThan(50);
  });
});
```

**E2E Tests:** 100 real Kazakhstan PEP/sanctions names

```javascript
const testCases = [
  { input: 'Nursultan Nazarbayev', expectedTier1Match: true },
  { input: 'Nazarbayev', expectedMatch: true },  // Partial
  { input: 'Nurs', expectedMatch: false },  // Too short
  // ... 97 more test cases
];

testCases.forEach(tc => {
  const results = await screenPerson(tc.input);
  // Verify top match is expected
});
```

---

## Future Improvements (Post-MVP)

1. **Phonetic Matching:** Use metaphone for Kazakh/Russian phoneme variants
2. **Machine Learning:** Train on false positive feedback to auto-tune thresholds
3. **Family Name Matching:** Include associates in scoring
4. **Soft Blocks:** Multi-token scoring (weight each token differently)
5. **Soundex:** For names with similar pronunciation

