# CLAUDE.md — CARIP Project Guide

## Project Overview

**CARIP** (Central Asia Risk Intelligence Platform) is a compliance screening platform targeting Kazakhstan (Phase 1), competing with Refinitiv World-Check and Dow Jones. It enables rapid screening of individuals against:

- **Sanctions lists** (OFAC, EU, UK, UN)
- **PEP profiles** (Politically Exposed Persons)
- **Adverse media** (news, regulatory actions, corruption allegations)

The platform uses fuzzy matching with Cyrillic/Latin transliteration to handle name variants and regional naming conventions.

**Timeline:** 6-month MVP (March 2026 - August 2026)

---

## Tech Stack

**Backend:**
- Express.js (REST API on port 3000)
- PostgreSQL (local: `carip_dev`)
- Sequelize ORM
- fuzzball (fuzzy matching with token_sort_ratio)
- cyrillic-to-translit-js (Cyrillic ↔ Latin conversion)
- metaphone (phonetic matching)
- node-cron (daily sanctions refresh at 6am UTC)
- xml2js (OFAC XML parsing)

**Frontend:**
- React 19 (with Vite 5)
- React Router v6
- Tailwind CSS
- Axios (API client)

**Data Storage:**
- PostgreSQL 12+ with JSONB support
- Local development: `carip_dev` database

---

## Project Structure

```
Bloomberg-Compliance-App/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Route handlers (M2-M5)
│   │   ├── models/             # Sequelize models
│   │   │   ├── index.js        # DB connection init
│   │   │   ├── SanctionsList.js
│   │   │   ├── PepProfile.js
│   │   │   ├── AdverseMedia.js
│   │   │   ├── ScreeningRequest.js
│   │   │   └── CaseDecision.js
│   │   ├── services/           # Business logic
│   │   │   ├── matchingService.js      # Fuzzy match orchestration
│   │   │   └── screeningService.js     # DB queries
│   │   ├── utils/              # Helpers
│   │   │   ├── transliterate.js       # Cyrillic→Latin conversion
│   │   │   └── fuzzyMatch.js          # fuzzball integration
│   │   ├── routes/             # Express routes
│   │   │   └── api.js
│   │   ├── scripts/            # Data import & cron jobs
│   │   │   ├── import-sanctions-ofac.js
│   │   │   ├── import-sanctions-eu.js
│   │   │   └── import-pep-csv.js
│   │   └── server.js           # Express entry point
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── .env.example
│   ├── .env                    # GITIGNORED
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ScreeningForm.jsx
│   │   │   ├── ResultsTable.jsx
│   │   │   ├── AlertFeed.jsx
│   │   │   ├── CaseActions.jsx
│   │   │   └── ConfidenceBadge.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # Main screening interface
│   │   │   ├── Alerts.jsx             # Adverse media feed
│   │   │   ├── PepProfile.jsx         # Individual PEP detail
│   │   │   └── NotFound.jsx
│   │   ├── api/
│   │   │   └── client.js              # Axios instance
│   │   ├── App.jsx                    # React Router setup
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── package.json
│
├── data/                       # Sample data for import
│   ├── sanctions_ofac.csv
│   ├── pep_kz_initial.csv
│   └── adverse_media_sample.csv
│
├── docs/
│   ├── DATA_MODEL.md
│   ├── API.md
│   └── MATCHING_ALGORITHM.md
│
├── CLAUDE.md                   # This file
├── README.md
└── .gitignore
```

---

## Database Schema

Five tables (PostgreSQL):

### sanctions_list
```
id, name_latin, name_cyrillic, list_source, list_date,
dob, nationality, raw_data, created_at
Index: name_latin
```

### pep_profiles
```
id, pep_id (unique), name_latin, name_cyrillic, position,
organization, tier (1-4), start_date, end_date, is_active,
associates (JSONB), source_urls (JSONB), created_at
Index: name_latin, is_active
```

### adverse_media
```
id, alert_id (unique), date, source, headline, summary,
category, entities (JSONB), url, created_at
Index: date, category
```

### screening_requests
```
id, request_id (unique), input_name, input_dob,
input_nationality, match_count, response_ms, created_at
```

### case_decisions
```
id, match_id, match_type (PEP|SANCTIONS|ADVERSE_MEDIA),
decision (true_positive|false_positive|needs_review),
notes, request_id, created_at
Index: match_type, request_id
```

---

## Key Implementation Notes

### Fuzzy Matching (Critical)

Located in `backend/src/utils/fuzzyMatch.js`:

```
1. Standardize both input and candidate to Latin (handles Cyrillic input)
2. Apply fuzz.ratio() — basic Levenshtein distance
3. Apply fuzz.token_sort_ratio() — handles name order variants
4. Return max(both scores)
5. Score ≥ 85 → High Confidence (YELLOW badge)
   Score ≥ 70 → Medium (YELLOW)
   Score ≥ 50 → Low (GREEN, pass through)
   Score < 50 → Discard
```

Example: "Alimov Nurlan" (user input) vs "Nurlan Alimov" (DB) → token_sort_ratio catches it.

### Transliteration

`backend/src/utils/transliterate.js`:
- Detects Cyrillic text via regex: `/[\u0400-\u04FF]/`
- If present, converts to Latin using `cyrillic-to-translit-js`
- Result stored in Latin for consistent fuzzy matching

### Endpoint Specifications (M1 Complete)

**GET /api/v1/health**
```
Response: { status: "ok", db: "connected", timestamp: "..." }
```

---

## 6-Month Milestones

### M1 — Weeks 1-2: Foundation ✅
- [x] Express server on :3000
- [x] Sequelize + PostgreSQL models (5 tables)
- [x] GET /api/v1/health endpoint
- [x] React Router + Vite frontend on :5173
- [x] Dashboard page with health check
- [x] ScreeningForm, ResultsTable, ConfidenceBadge components
- [x] Axios client configured

**Completion criterion:** Both servers run, health endpoint returns 200 with `db: connected`.

**Setup:**
1. Backend: Create `.env` with DB creds, run `npm install` in `backend/`
2. Run PostgreSQL locally, create `carip_dev` database
3. Run `psql carip_dev < backend/migrations/001_initial_schema.sql`
4. Start backend: `cd backend && npm run dev`
5. Start frontend: `cd frontend && npm run dev`
6. Visit `http://localhost:5173` → Dashboard → "Connected" status

---

### M2 — Weeks 3-4: Sanctions Screening Engine
- [ ] `import-sanctions-ofac.js` script (fetch XML, parse, upsert DB)
- [ ] `transliterate.js` + `fuzzyMatch.js` with unit tests
- [ ] `screeningService.js`: query DB + fuzzy matching
- [ ] `matchingService.js`: orchestrate queries across tables
- [ ] **POST /api/v1/screen** endpoint
- [ ] ScreeningForm → POST → ResultsTable with scores
- [ ] Test 100 names (include Cyrillic variants)

**Completion criterion:** POST `{ name: "Alimov" }` returns ranked matches in <2s.

---

### M3 — Weeks 5-6: PEP Database
- [ ] `import-pep-csv.js` script
- [ ] Manually compile 500+ Tier 1-2 Kazakhstan PEP profiles (CSV)
- [ ] Extend `/api/v1/screen` to include PEP matches
- [ ] **GET /api/v1/pep/:id** endpoint
- [ ] PepProfile.jsx detail page

**Completion criterion:** Screen "Nursultan Nazarbayev" → 100% confidence Tier 1 PEP hit.

---

### M4 — Weeks 7-8: Adverse Media
- [ ] `import-adverse-media.js` script
- [ ] **GET /api/v1/alerts** with filters (date_from, date_to, category, entity)
- [ ] AlertFeed.jsx with filter UI
- [ ] Manual curation workflow: Google Sheet → weekly CSV export

**Completion criterion:** `/api/v1/alerts?category=Corruption` returns filtered results.

---

### M5 — Weeks 9-12: Polish + Beta Launch
- [ ] JWT authentication (email/password, local DB)
- [ ] CaseActions.jsx: True/False Positive + notes
- [ ] **POST /api/v1/case** endpoint + `case_decisions` table writes
- [ ] PDF export (jspdf)
- [ ] EU + UK sanctions import, node-cron daily refresh (6am UTC)
- [ ] Deploy: Railway (backend + PG), Vercel (frontend)
- [ ] Onboard 3 beta customers

**Completion criterion:** Full workflow deployed; PDF export works.

---

### M6 — Month 6: Stabilization
- [ ] DB indexes tuned for <2s query time at scale
- [ ] False positive rate measured, thresholds adjusted
- [ ] PEP database expanded to 2,000+ profiles
- [ ] UN + UK sanctions lists added
- [ ] All documentation complete

**Completion criterion:** Production-ready, 2,000+ PEP records, <2s response time.

---

## Common Development Workflows

### Adding a New Endpoint

1. Create controller in `backend/src/controllers/` (or add to existing)
2. Define route in `backend/src/routes/api.js`
3. Call models via Sequelize ORM
4. Frontend: use `client.post('/screen')` etc. in React component

### Importing Data

1. Add script in `backend/src/scripts/import-*.js`
2. Use Sequelize `bulkCreate()` or `upsert()`
3. Run: `npm run import:sanctions`

### Testing the API

```bash
# Backend health check
curl http://localhost:3000/api/v1/health

# Screening (once M2 complete)
curl -X POST http://localhost:3000/api/v1/screen \
  -H "Content-Type: application/json" \
  -d '{"name": "Alimov", "dob": null, "nationality": "KZ"}'
```

---

## Environment Configuration

**Backend `.env` template (backend/.env.example):**
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=carip_dev
DB_USER=postgres
DB_PASSWORD=your_password_here
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

**Frontend CORS:** Configured in `server.js` to accept `http://localhost:5173`.

---

## Deployment Plan (M5-M6)

**MVP Hosting (~$30/month):**
- Frontend: Vercel (free tier)
- Backend: Railway ($20-30/month for 0.5GB RAM, 1GB storage)
- PostgreSQL: Railway managed add-on ($15/month)
- Cron jobs: node-cron inside backend process

**Commands:**
```bash
# Frontend
cd frontend && vercel --prod

# Backend
cd backend && railway up
```

---

## Key Design Decisions

1. **No external auth yet:** JWT placeholder for M5; local DB for passwords
2. **No caching layer yet:** Sequelize + PostgreSQL indexes only (M2 sufficient)
3. **Fuzzy matching only:** No ML/NLP; fuzzball + token_sort_ratio proven in compliance
4. **Cyrillic first:** Transliteration to Latin for matching; both stored in DB
5. **Manual PEP curation:** Faster than scraping; more reliable for Kazakhstan

---

## Testing & QA

- Unit tests for `fuzzyMatch.js` and `transliterate.js` (M2)
- E2E test: screen 100 known PEP/sanctions names, verify top-5 matches correct
- Performance: <2s response time for 50,000-row DB (verified with PostgreSQL EXPLAIN ANALYZE)

---

## Contact & Support

For questions about architecture, DB schema, or implementation details, refer to:
- `docs/DATA_MODEL.md` — detailed schema + relationships
- `docs/API.md` — all endpoint specifications (added in M2+)
- `docs/MATCHING_ALGORITHM.md` — fuzzy matching deep dive

