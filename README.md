# CARIP — Central Asia Risk Intelligence Platform

A compliance screening platform for identifying individuals against sanctions lists, PEP databases, and adverse media coverage.

**Status:** M1 Foundation Complete (March 2026)
**Target:** MVP launch by August 2026

---

## Quick Start (M1)

### Prerequisites

- Node.js 18+
- PostgreSQL 12+ (local)
- npm or yarn

### Backend Setup

1. **Create database:**
   ```bash
   createdb carip_dev
   psql carip_dev < backend/migrations/001_initial_schema.sql
   ```

2. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   ```

4. **Start server:**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3000`

5. **Test health endpoint:**
   ```bash
   curl http://localhost:3000/api/v1/health
   ```
   Expected response:
   ```json
   {"status":"ok","db":"connected","timestamp":"2026-03-27T..."}
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

3. **Open browser:**
   Navigate to `http://localhost:5173` — Dashboard should show "✓ Backend Connected"

---

## Project Structure

```
Bloomberg-Compliance-App/
├── backend/              # Express API + Sequelize models
├── frontend/             # React + Tailwind UI
├── data/                 # Sample CSV files for import
├── docs/                 # Architecture & API docs
├── migrations/           # PostgreSQL DDL
├── CLAUDE.md            # Developer guide
└── README.md            # This file
```

See **CLAUDE.md** for complete architecture, milestones, and implementation details.

---

## Available Scripts

### Backend
```bash
npm run dev              # Start dev server with nodemon
npm run start            # Start production server
npm run db:init          # Initialize database schema
npm run import:sanctions # Import OFAC sanctions (M2+)
npm run import:pep       # Import PEP CSV (M3+)
npm run import:adverse   # Import adverse media (M4+)
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## Current Features (M1)

✅ Express REST API with health check
✅ PostgreSQL database with 5 core tables
✅ React Dashboard with system status
✅ ScreeningForm component (placeholder)
✅ ResultsTable + ConfidenceBadge components
✅ Fuzzy matching utilities (transliterate.js, fuzzyMatch.js)
✅ Axios client with interceptors

---

## Coming Next (M2-M6)

| Milestone | Features | ETA |
|-----------|----------|-----|
| M2 | Sanctions screening engine, fuzzy matching | Weeks 3-4 |
| M3 | PEP database + detail pages | Weeks 5-6 |
| M4 | Adverse media alerts + filtering | Weeks 7-8 |
| M5 | Auth, case decisions, PDF export, deployment | Weeks 9-12 |
| M6 | Performance tuning, 2K+ PEP profiles | Month 6 |

---

## Environment Variables

**Backend (.env)**
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=carip_dev
DB_USER=postgres
DB_PASSWORD=your_password
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

**Frontend**
- No .env needed for M1
- API base URL hardcoded in `src/api/client.js`

---

## API Endpoints (M1)

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/health` | ✅ Live | Database connection check |
| POST | `/api/v1/screen` | 🚧 M2 | Screen person against sanctions/PEP |
| GET | `/api/v1/alerts` | 🚧 M4 | Fetch adverse media alerts |
| GET | `/api/v1/pep/:id` | 🚧 M3 | Get individual PEP profile |
| POST | `/api/v1/case` | 🚧 M5 | Record screening decision |

---

## Database

**Local Development:**
- Database: `carip_dev`
- Connection: `postgresql://postgres:password@localhost:5432/carip_dev`

**Tables (see CLAUDE.md for details):**
- `sanctions_list` — Sanctions entries (OFAC, EU, UK, UN)
- `pep_profiles` — Politically exposed persons
- `adverse_media` — News/regulatory alerts
- `screening_requests` — Audit log of screening queries
- `case_decisions` — True/false positive decisions

---

## Testing

### Unit Tests (M2+)
```bash
cd backend
npm test  # Runs fuzzyMatch, transliterate tests
```

### Manual API Testing
```bash
# Health check
curl http://localhost:3000/api/v1/health

# Screening (M2+)
curl -X POST http://localhost:3000/api/v1/screen \
  -H "Content-Type: application/json" \
  -d '{"name":"Alimov","dob":null,"nationality":"KZ"}'
```

### E2E Testing (M3+)
- Refer to `docs/TEST_CASES.md` for 100+ screening test names

---

## Deployment

**Production Stack (M5+):**
- Frontend: Vercel
- Backend: Railway (or DigitalOcean)
- Database: Railway managed PostgreSQL
- Cron: node-cron (built-in)

See **CLAUDE.md** for detailed deployment instructions.

---

## Documentation

- **CLAUDE.md** — Full developer guide, architecture, milestones
- **docs/DATA_MODEL.md** — Database schema + relationships (M2+)
- **docs/API.md** — Complete API endpoint specifications (M2+)
- **docs/MATCHING_ALGORITHM.md** — Fuzzy matching deep dive (M2+)

---

## License

MIT (Copyright 2026)

---

## Support

For issues or questions:
1. Check **CLAUDE.md** for architecture decisions
2. Review `backend/src/models/index.js` for DB connection
3. Check `frontend/src/api/client.js` for API client setup

---

**Last Updated:** March 27, 2026
**Maintainers:** Development Team
