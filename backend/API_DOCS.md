# FixNow Portal – API Documentation

**Base URL**: `http://localhost:5001/api`

---

## Authentication

All admin endpoints require a `Authorization: Bearer <token>` header. Obtain a token via the login endpoint.

---

## Endpoints

### Auth

#### `POST /auth/login`
Authenticate and receive JWT token.
```json
// Request
{ "email": "admin@gmail.com", "password": "password123" }

// Response 200
{ "token": "eyJhbG...", "user": { "id": "...", "name": "Super Admin", "email": "admin@gmail.com", "role": "SUPER_ADMIN", "state": null }}
```

#### `POST /auth/register` 🔒 Super Admin
Create a new admin user.
```json
// Request
{ "name": "New Officer", "email": "officer2@gmail.com", "password": "pass123", "role": "OFFICER", "state": "Maharashtra" }

// Response 201
{ "user": { "id": "...", "name": "New Officer", "email": "officer2@gmail.com", "role": "OFFICER" }}
```

#### `GET /auth/me` 🔒
Get current authenticated user.

---

### Complaints

#### `POST /complaints` (Public)
Submit a new complaint. Accepts `multipart/form-data`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | ✅ | 5-200 characters |
| description | string | ✅ | 10-5000 characters |
| category | enum | ✅ | See categories below |
| severity | enum | ✅ | LOW, MEDIUM, HIGH, CRITICAL |
| state | string | ✅ | Indian state name |
| city | string | ✅ | City name |
| district | string | ✅ | District name |
| contact | string | ✅ | 10-15 digit phone |
| email | string | ✅ | Valid email |
| image | file | ❌ | JPG/PNG, max 5MB |

```bash
curl -X POST http://localhost:5001/api/complaints \
  -F "title=Broken road" \
  -F "description=Large pothole on Main Street" \
  -F "category=ROAD_DAMAGE" \
  -F "severity=HIGH" \
  -F "state=Maharashtra" \
  -F "city=Mumbai" \
  -F "district=Andheri" \
  -F "contact=9876543210" \
  -F "email=citizen@gmail.com"
```

```json
// Response 201
{ "id": "abc-123-...", "message": "Complaint submitted successfully" }
```

#### `GET /complaints/track/:id` (Public)
Track a complaint by ID.
```json
// Response 200
{
  "id": "abc-123",
  "title": "Broken road",
  "category": "ROAD_DAMAGE",
  "severity": "HIGH",
  "status": "IN_PROGRESS",
  "state": "Maharashtra",
  "city": "Mumbai",
  "district": "Andheri",
  "assignedTo": { "id": "...", "name": "Officer One", "role": "OFFICER" },
  "createdAt": "2026-03-01T...",
  "updatedAt": "2026-03-01T...",
  "timeline": [
    { "action": "Assigned to Officer One", "performedBy": "Super Admin", "timestamp": "..." },
    { "action": "Complaint submitted", "performedBy": "System", "timestamp": "..." }
  ]
}
```

#### `GET /complaints/public` (Public)
List complaints with location filtering. No sensitive data exposed.

| Param | Type | Description |
|-------|------|-------------|
| state | string | Filter by state |
| city | string | Filter by city (partial match) |
| district | string | Filter by district (partial match) |
| category | enum | Filter by category |
| severity | enum | Filter by severity |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 50) |

```bash
curl "http://localhost:5001/api/complaints/public?state=Maharashtra&city=Mumbai"
```

#### `GET /complaints` 🔒
Admin complaint list with full filters.

| Param | Type | Description |
|-------|------|-------------|
| status | enum | PENDING, IN_PROGRESS, RESOLVED, ESCALATED |
| severity | enum | LOW, MEDIUM, HIGH, CRITICAL |
| category | enum | Any category |
| state | string | Exact state match |
| city | string | Partial city match |
| district | string | Partial district match |
| search | string | Search in title, description, ID |
| page | number | Page (default: 1) |
| limit | number | Per page (default: 20) |

#### `GET /complaints/:id` 🔒
Get full complaint details with logs and assigned officer.

#### `PATCH /complaints/:id` 🔒
Update complaint status, assignment, notes, or severity.
```json
// Request
{ "status": "IN_PROGRESS", "assignedToId": "officer-uuid", "notes": "Assigned to field team" }
```

#### `DELETE /complaints/:id` 🔒 Super Admin
Delete a complaint permanently.

---

### Analytics

#### `GET /analytics/public` (Public)
Public summary for the dashboard. Supports optional `state` and `city` query params.
```json
// Response 200
{
  "stats": { "total": 150, "pending": 45, "inProgress": 30, "resolved": 60, "escalated": 15, "resolutionRate": 40 },
  "byCategory": [{ "category": "ROAD_DAMAGE", "count": 25 }, ...],
  "byState": [{ "state": "Maharashtra", "count": 40 }, ...],
  "recentResolved": [{ "id": "...", "title": "Fixed pothole", "category": "ROAD_DAMAGE", "state": "Maharashtra", "city": "Mumbai", "updatedAt": "..." }]
}
```

#### `GET /analytics/summary` 🔒
Admin stats: total, pending, inProgress, resolved, escalated, critical counts.

#### `GET /analytics/by-state` 🔒
Complaint counts grouped by state.

#### `GET /analytics/by-category` 🔒
Complaint counts grouped by category.

#### `GET /analytics/by-severity` 🔒
Complaint counts grouped by severity.

#### `GET /analytics/by-city` 🔒
Complaint counts grouped by city (top 20).

#### `GET /analytics/by-district` 🔒
Complaint counts grouped by district (top 20).

#### `GET /analytics/daily` 🔒
Daily complaint counts for the last 30 days.

#### `GET /analytics/resolution-time` 🔒
Average resolution time in hours and count of resolved complaints.

---

### Users

#### `GET /users` 🔒
List all users with assigned complaint counts.

#### `GET /users/officers` 🔒
List officers available for assignment.

#### `PATCH /users/:id` 🔒 Super Admin
Update user name, role, or state.

#### `DELETE /users/:id` 🔒 Super Admin
Delete a user.

---

## Categories

| Value | Display |
|-------|---------|
| ROAD_DAMAGE | Road Damage |
| WATER_SUPPLY | Water Supply |
| ELECTRICITY | Electricity |
| SANITATION | Sanitation |
| PUBLIC_SAFETY | Public Safety |
| NOISE_POLLUTION | Noise Pollution |
| ILLEGAL_CONSTRUCTION | Illegal Construction |
| GARBAGE | Garbage |
| TRAFFIC | Traffic |
| STREET_LIGHTING | Street Lighting |
| PARK_MAINTENANCE | Park Maintenance |
| DRAINAGE_FLOODING | Drainage / Flooding |
| AIR_POLLUTION | Air Pollution |
| ANIMAL_CONTROL | Animal Control |
| PUBLIC_TRANSPORT | Public Transport |
| BUILDING_SAFETY | Building Safety |
| FIRE_HAZARD | Fire Hazard |
| OTHER | Other |

## Roles

| Role | Permissions |
|------|-------------|
| SUPER_ADMIN | Full access: manage users, delete complaints, all states |
| STATE_ADMIN | Manage complaints in assigned state |
| OFFICER | View and update assigned complaints |

## Health Check

```bash
curl http://localhost:5001/api/health
# {"status":"OK","timestamp":"2026-03-01T..."}
```
