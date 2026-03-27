# CARIP Data Model

Complete database schema, relationships, and entity definitions for the CARIP platform.

---

## Overview

CARIP uses PostgreSQL with JSONB support for flexible compliance data. Five core tables:

1. `sanctions_list` — Sanctions entries (OFAC, EU, UK, UN)
2. `pep_profiles` — Politically exposed persons
3. `adverse_media` — News/regulatory alerts
4. `screening_requests` — Audit log
5. `case_decisions` — Analyst decisions

---

## Table Details

### sanctions_list

**Purpose:** Store individuals/entities from official sanctions lists.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | SERIAL | PRIMARY KEY | |
| name_latin | VARCHAR(255) | NOT NULL, indexed | Latin characters only |
| name_cyrillic | VARCHAR(255) | | Cyrillic for reference |
| list_source | VARCHAR(50) | NOT NULL | OFAC, EU, UK, UN |
| list_date | DATE | NOT NULL | When entry added to list |
| dob | DATE | | Date of birth if available |
| nationality | VARCHAR(10) | | ISO 2-letter code (e.g., RU, KZ) |
| raw_data | JSONB | | Original parsed entry for audit |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | When record inserted |

**Indexes:**
- `idx_sanctions_name`: On `name_latin` (for fuzzy matching)
- `idx_sanctions_source`: On `list_source` (for filtering by list type)

**Example Row:**
```sql
INSERT INTO sanctions_list (name_latin, name_cyrillic, list_source, list_date, dob, nationality)
VALUES ('Vladimir Putin', 'Владимир Путин', 'OFAC', '2022-02-24', '1952-10-01', 'RU');
```

---

### pep_profiles

**Purpose:** Store politically exposed persons (government officials, decision-makers).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | SERIAL | PRIMARY KEY | |
| pep_id | VARCHAR(50) | UNIQUE, NOT NULL | Format: PEP-KZ-00001 |
| name_latin | VARCHAR(255) | NOT NULL, indexed | |
| name_cyrillic | VARCHAR(255) | | |
| position | VARCHAR(500) | | Job title |
| organization | VARCHAR(500) | | Entity/ministry |
| tier | INT | CHECK (1-4) | 1=Highest risk, 4=Lowest |
| start_date | DATE | | When person took office |
| end_date | DATE | | When person left office (NULL if current) |
| is_active | BOOLEAN | DEFAULT TRUE, indexed | Current officeholder? |
| associates | JSONB | | Connected PEPs (for complex screening) |
| source_urls | JSONB | | References (akorda.kz, parlam.kz, etc.) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_pep_name`: On `name_latin`
- `idx_pep_active`: On `is_active` (for active-only queries)

**Tier Definition:**
- **Tier 1:** President, Cabinet Ministers, Central Bank Governor
- **Tier 2:** Deputy Ministers, Regional Governors, Parliament Members
- **Tier 3:** Senior officials, Board members of SOEs
- **Tier 4:** Mid-level officials, Less sensitive positions

**associates JSONB Structure:**
```json
{
  "family": [
    {"name": "Spouse Name", "role": "spouse"},
    {"name": "Son Name", "role": "child"}
  ],
  "business": [
    {"name": "Associate Ltd", "role": "director"}
  ]
}
```

**Example Row:**
```sql
INSERT INTO pep_profiles (
  pep_id, name_latin, name_cyrillic, position, organization, tier, start_date, is_active, source_urls
) VALUES (
  'PEP-KZ-00001',
  'Nursultan Nazarbayev',
  'Нұрсұлтан Назарбаев',
  'First President',
  'Office of Former President',
  1,
  '1991-12-16',
  TRUE,
  '["https://akorda.kz", "https://en.wikipedia.org"]'::jsonb
);
```

---

### adverse_media

**Purpose:** Store news, regulatory actions, corruption allegations.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | SERIAL | PRIMARY KEY | |
| alert_id | VARCHAR(50) | UNIQUE, NOT NULL | ALERT-KZ-001, etc. |
| date | DATE | NOT NULL, indexed | Publication date |
| source | VARCHAR(255) | NOT NULL | Reuters, BBC, Eurasianet, etc. |
| headline | TEXT | NOT NULL | Full headline |
| summary | VARCHAR(500) | | Max 500 chars |
| category | VARCHAR(100) | indexed | Corruption, Sanctions, Fraud, Money Laundering, etc. |
| entities | JSONB | | Mentioned persons/organizations |
| url | TEXT | | Source URL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:**
- `idx_adverse_media_date`: On `date` (for reverse-chrono queries)
- `idx_adverse_media_category`: On `category` (for filtering)

**entities JSONB Structure:**
```json
{
  "persons": [
    {"name": "Official Name", "role": "defendant"}
  ],
  "organizations": [
    {"name": "Company Ltd", "type": "defendant"}
  ]
}
```

**Categories:**
- Corruption
- Bribery
- Embezzlement
- Money Laundering
- Sanctions Evasion
- Fraud
- Tax Evasion
- Human Rights Violations
- Organized Crime
- Regulatory Investigation

**Example Row:**
```sql
INSERT INTO adverse_media (alert_id, date, source, headline, summary, category, url)
VALUES (
  'ALERT-KZ-001',
  '2024-03-15',
  'Reuters',
  'Kazakhstan Corruption Case Filed Against Official',
  'High-ranking government official faces charges in connection with embezzlement scheme',
  'Corruption',
  'https://reuters.com/article'
);
```

---

### screening_requests

**Purpose:** Audit trail of all screening queries (compliance requirement).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | SERIAL | PRIMARY KEY | |
| request_id | VARCHAR(50) | UNIQUE, NOT NULL | UUID or timestamp-based |
| input_name | VARCHAR(255) | NOT NULL | Original user input |
| input_dob | DATE | | Date of birth (if provided) |
| input_nationality | VARCHAR(10) | | Nationality (if provided) |
| match_count | INT | DEFAULT 0 | How many hits returned |
| response_ms | INT | | Query execution time |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Purpose:** Enables:
- Compliance audit trail
- Performance monitoring (response_ms)
- Query analysis (what names screened most)
- Retro-active investigation if match was missed

**Example Row:**
```sql
INSERT INTO screening_requests (request_id, input_name, input_dob, input_nationality, match_count, response_ms)
VALUES (
  'REQ-20240327-001',
  'Alimov Nurlan',
  '1985-06-15',
  'KZ',
  3,
  1250
);
```

---

### case_decisions

**Purpose:** Record analyst decisions on screening matches (true positive / false positive).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | SERIAL | PRIMARY KEY | |
| match_id | VARCHAR(100) | NOT NULL | Composite key: request_id + list_type + record_id |
| match_type | VARCHAR(50) | NOT NULL | PEP, SANCTIONS, ADVERSE_MEDIA |
| decision | VARCHAR(50) | NOT NULL | true_positive, false_positive, needs_review |
| notes | TEXT | | Analyst notes / reasoning |
| request_id | VARCHAR(50) | indexed | FK to screening_requests |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Purpose:** Enables:
- False positive rate measurement (% marked false_positive)
- Feedback loop to tune fuzzy matching thresholds
- Audit trail of decisions
- Training data for ML (future)

**Example Row:**
```sql
INSERT INTO case_decisions (match_id, match_type, decision, notes, request_id)
VALUES (
  'REQ-20240327-001-PEP-KZ-00002',
  'PEP',
  'true_positive',
  'Confirmed: President of Kazakhstan',
  'REQ-20240327-001'
);
```

---

## Query Patterns

### M2: Screening Query

Find matches for a person screened:

```sql
SELECT
  s.id, s.name_latin, s.list_source, s.dob, 100 as score
FROM sanctions_list s
WHERE s.name_latin ILIKE '%Alimov%'
UNION ALL
SELECT
  p.id, p.name_latin, 'PEP' as list_source, p.start_date, 95 as score
FROM pep_profiles p
WHERE p.name_latin ILIKE '%Alimov%' AND p.is_active = TRUE
ORDER BY score DESC;
```

**Note:** Exact score calculation done in application (fuzzyMatch.js), not in SQL.

### M4: Adverse Media Filtering

Get alerts for a date range + category:

```sql
SELECT * FROM adverse_media
WHERE date BETWEEN '2024-01-01' AND '2024-03-31'
  AND category IN ('Corruption', 'Sanctions Evasion')
ORDER BY date DESC
LIMIT 50;
```

### M6: Case Decision Statistics

False positive rate:

```sql
SELECT
  match_type,
  decision,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY match_type), 2) as pct
FROM case_decisions
GROUP BY match_type, decision
ORDER BY match_type, pct DESC;
```

---

## Relationships

**No foreign keys** (by design) — allows independent table updates.

**Soft relationships:**
- `screening_requests.request_id` → `case_decisions.request_id`
- `pep_profiles.associates` JSONB → may reference other PEP names
- `adverse_media.entities` JSONB → may reference PEP IDs or sanctions names

---

## Migration Path

**Initial (M1):** All 5 tables created (empty).

**M2:** Sanctions list populated via `import-sanctions-ofac.js`.

**M3:** PEP profiles populated via `import-pep-csv.js`.

**M4:** Adverse media populated via `import-adverse-media.js`.

**M5+:** Ongoing updates via cron jobs (daily at 6am UTC).

---

## Performance Considerations

**For 50,000-row DB (M2 target):**

| Query | Indexes | Estimated Time |
|-------|---------|-----------------|
| Single name search | idx_sanctions_name | <100ms |
| Active PEP search | idx_pep_name, idx_pep_active | <150ms |
| Full screening (all 3 tables) | All above | <2s |
| Adverse media date range | idx_adverse_media_date | <200ms |

**Optimization notes:**
- Do NOT use `LIKE` for fuzzy matching; use application-level (fuzzball) on indexed results
- Batch inserts for import scripts (500 rows per INSERT)
- Partition adverse_media by date if >1M rows (future)

