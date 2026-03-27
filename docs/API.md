# CARIP API Documentation

Complete REST API specification for the CARIP platform.

**Base URL:** `http://localhost:3000/api/v1` (development)

---

## Endpoints by Milestone

### M1 — Foundation ✅

#### GET /health

Check backend and database connection status.

**Status:** ✅ Live

**Request:**
```
GET /api/v1/health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "db": "connected",
  "timestamp": "2026-03-27T14:30:45.123Z"
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "error",
  "db": "disconnected",
  "error": "connect ECONNREFUSED 127.0.0.1:5432"
}
```

---

### M2 — Sanctions Screening (Weeks 3-4)

#### POST /screen

Screen a person against sanctions, PEP, and adverse media databases.

**Status:** 🚧 In Development

**Request:**
```json
POST /api/v1/screen
Content-Type: application/json

{
  "name": "Alimov Nurlan",
  "dob": "1985-06-15",
  "nationality": "KZ"
}
```

**Parameters:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | YES | Latin or Cyrillic; app handles transliteration |
| dob | string (YYYY-MM-DD) | NO | Date of birth for refinement |
| nationality | string (ISO 2-letter) | NO | e.g., KZ, RU, US |

**Response (200 OK):**
```json
{
  "request_id": "REQ-20260327-00123",
  "query": "Alimov Nurlan",
  "response_ms": 1250,
  "total_matches": 3,
  "results": [
    {
      "id": "S-001",
      "name": "Alimov Nurlan",
      "type": "SANCTIONS",
      "list_source": "OFAC",
      "score": 98,
      "confidence_level": "High Confidence",
      "dob": "1985-06-15",
      "nationality": "KZ",
      "list_date": "2024-03-01"
    },
    {
      "id": "P-KZ-00042",
      "name": "Nurlan Alimov",
      "type": "PEP",
      "tier": 2,
      "score": 95,
      "confidence_level": "High Confidence",
      "position": "Deputy Minister",
      "organization": "Ministry of Finance",
      "is_active": true,
      "start_date": "2022-09-01"
    },
    {
      "id": "AM-234",
      "name": "N. Alimov",
      "type": "ADVERSE_MEDIA",
      "score": 72,
      "confidence_level": "Medium Confidence",
      "headline": "Kazakhstan Official Under Investigation",
      "date": "2024-03-15",
      "category": "Corruption"
    }
  ]
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Name is required"
}
```

**Error Response (503 Service Unavailable):**
```json
{
  "error": "Database connection failed"
}
```

**Score Interpretation:**
- 100 = Exact Match (Red badge)
- 85-99 = High Confidence (Yellow badge)
- 70-84 = Medium Confidence (Yellow badge)
- 50-69 = Low Confidence (Green badge)
- <50 = Discard (not returned)

---

### M3 — PEP Profiles (Weeks 5-6)

#### GET /pep/:pepId

Retrieve detailed profile for a politically exposed person.

**Status:** 🚧 In Development

**Request:**
```
GET /api/v1/pep/PEP-KZ-00001
```

**Response (200 OK):**
```json
{
  "pep_id": "PEP-KZ-00001",
  "name_latin": "Nursultan Nazarbayev",
  "name_cyrillic": "Нұрсұлтан Назарбаев",
  "position": "First President",
  "organization": "Office of Former President",
  "tier": 1,
  "start_date": "1991-12-16",
  "end_date": null,
  "is_active": true,
  "associates": {
    "family": [
      {
        "name": "Dariga Nazarbayeva",
        "relationship": "daughter"
      }
    ],
    "business": [
      {
        "name": "Samruk-Kazyna JSC",
        "role": "shareholder"
      }
    ]
  },
  "source_urls": [
    "https://akorda.kz",
    "https://en.wikipedia.org/wiki/Nursultan_Nazarbayev"
  ],
  "created_at": "2026-03-20T10:15:30Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "PEP not found"
}
```

---

### M4 — Adverse Media (Weeks 7-8)

#### GET /alerts

Fetch adverse media alerts with optional filters.

**Status:** 🚧 In Development

**Request:**
```
GET /api/v1/alerts?date_from=2024-01-01&date_to=2024-03-31&category=Corruption&limit=50
```

**Query Parameters:**
| Param | Type | Default | Notes |
|-------|------|---------|-------|
| date_from | string (YYYY-MM-DD) | 90 days ago | Start of date range |
| date_to | string (YYYY-MM-DD) | today | End of date range |
| category | string | (none) | Filter: Corruption, Sanctions, Fraud, etc. |
| entity | string | (none) | Filter by mentioned person/organization |
| limit | int | 50 | Max results (1-500) |
| offset | int | 0 | Pagination offset |

**Response (200 OK):**
```json
{
  "total": 127,
  "limit": 50,
  "offset": 0,
  "alerts": [
    {
      "alert_id": "ALERT-KZ-001",
      "date": "2024-03-15",
      "source": "Reuters",
      "headline": "Kazakhstan Corruption Case Filed Against Official",
      "summary": "High-ranking government official faces charges in connection with embezzlement scheme",
      "category": "Corruption",
      "entities": {
        "persons": [
          {
            "name": "Official Name",
            "role": "defendant"
          }
        ]
      },
      "url": "https://reuters.com/article"
    }
  ]
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid date format; use YYYY-MM-DD"
}
```

---

### M5 — Case Decisions (Weeks 9-12)

#### POST /case

Record analyst decision on a screening match.

**Status:** 🚧 In Development

**Request:**
```json
POST /api/v1/case
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "match_id": "REQ-20260327-00123-PEP-KZ-00002",
  "match_type": "PEP",
  "decision": "true_positive",
  "notes": "Confirmed: President of Kazakhstan"
}
```

**Parameters:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| match_id | string | YES | From screening results |
| match_type | string | YES | PEP, SANCTIONS, ADVERSE_MEDIA |
| decision | string | YES | true_positive, false_positive, needs_review |
| notes | string | NO | Analyst notes |

**Response (201 Created):**
```json
{
  "case_id": 12345,
  "request_id": "REQ-20260327-00123",
  "match_id": "REQ-20260327-00123-PEP-KZ-00002",
  "decision": "true_positive",
  "timestamp": "2026-03-27T14:45:30Z"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Missing or invalid authentication token"
}
```

---

## Authentication (M5+)

**Method:** JWT Bearer Token

**Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Endpoints Requiring Auth:**
- `POST /screen` (M5+)
- `POST /case` (M5+)
- `GET /pep/:id` (M5+)
- `GET /alerts` (M5+)

**Endpoints Without Auth:**
- `GET /health` (always open for monitoring)

---

## Error Handling

**Standard Error Response:**
```json
{
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "timestamp": "2026-03-27T14:30:45Z"
}
```

**Status Codes:**
| Code | Meaning | Scenarios |
|------|---------|-----------|
| 200 | OK | Successful request |
| 201 | Created | Resource created (POST) |
| 400 | Bad Request | Missing/invalid params |
| 401 | Unauthorized | Missing/invalid JWT |
| 403 | Forbidden | User lacks permission |
| 404 | Not Found | Resource doesn't exist |
| 503 | Service Unavailable | DB connection lost |

---

## Rate Limiting (M5+)

**Free Tier (development):**
- 100 requests/minute per IP

**Enterprise Tier (production):**
- 10,000 requests/minute per API key

**Header Response:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1711527600
```

---

## Examples

### Example: Screen a Person

```bash
curl -X POST http://localhost:3000/api/v1/screen \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alimov Nurlan",
    "dob": "1985-06-15",
    "nationality": "KZ"
  }'
```

### Example: Get Alerts

```bash
curl http://localhost:3000/api/v1/alerts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --data-urlencode "category=Corruption" \
  --data-urlencode "date_from=2024-01-01"
```

### Example: Record Decision

```bash
curl -X POST http://localhost:3000/api/v1/case \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "match_id": "REQ-20260327-00123-PEP-KZ-00002",
    "match_type": "PEP",
    "decision": "true_positive",
    "notes": "Confirmed hit"
  }'
```

---

## Changelog

### 2026-03-27 (M1)
- ✅ `GET /health` endpoint live

### 2026-04-15 (M2)
- 🚧 `POST /screen` in development

### 2026-05-15 (M3)
- 🚧 `GET /pep/:id` in development

### 2026-06-15 (M4)
- 🚧 `GET /alerts` in development

### 2026-07-15 (M5)
- 🚧 `POST /case` in development
- 🚧 JWT authentication added

