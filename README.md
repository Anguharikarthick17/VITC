# 🚨 FixNow Portal – Emergency Civic Complaint Management System

A full-stack web application for citizens to report civic issues and administrators to manage, track, escalate, and analyze complaints.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, TypeScript, Express 5, Prisma ORM |
| **Database** | PostgreSQL 15 |
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS v4 |
| **Auth** | JWT, bcrypt, Role-Based Access Control |
| **Charts** | Recharts |
| **Icons** | Lucide React |

## Features

### Public
- 🚨 **Complaint Form** — Submit civic issues with title, description, category (18 types), severity, location, contact info, and optional image upload
- 🔍 **Complaint Tracking** — Track complaint status and timeline by ID
- 📊 **Public Dashboard** — Live stats, charts by category/location, recently resolved issues — filterable by state/city

### Admin
- 📋 **Dashboard** — Overview stats, critical alerts, charts, recent complaints
- 📁 **Complaint Management** — Search, filter (status/severity/category/location), paginated table
- 📄 **Complaint Detail** — Full info, image, timeline, assign officer, update status, internal notes
- 📈 **Analytics** — Line/bar/pie charts: daily trends, by state/city/district/category/severity, resolution time
- 👤 **User Management** — Create/delete admin users (Super Admin only)
- ⏰ **Auto-Escalation** — Unresolved complaints escalate after 48 hours
- 🚨 **Critical Alerts** — Automatic notification on CRITICAL severity

### Security
- JWT authentication with token refresh
- bcrypt password hashing (12 rounds)
- Role-based access: Super Admin, State Admin, Officer
- Input validation via Zod schemas
- Helmet security headers, CORS, rate limiting
- File upload validation (JPG/PNG only, 5MB max)

## Project Structure

```
HACK/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database models & enums
│   │   └── seed.ts                # Initial admin users
│   ├── src/
│   │   ├── controllers/           # Route handlers
│   │   ├── middlewares/            # Auth, RBAC, upload, validation
│   │   ├── routes/                # API route definitions
│   │   ├── services/              # Escalation, notifications
│   │   ├── utils/                 # Zod schemas
│   │   ├── app.ts                 # Express config
│   │   └── server.ts              # Entry point
│   ├── uploads/                   # Uploaded images
│   └── API_DOCS.md                # Full API reference
├── frontend/
│   ├── src/
│   │   ├── components/            # AdminLayout
│   │   ├── context/               # AuthContext
│   │   ├── pages/                 # All pages (public + admin)
│   │   ├── services/              # Axios API client
│   │   └── App.tsx                # Router
│   └── index.html
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+

### Setup

```bash
# 1. Clone & install
cd backend && npm install
cd ../frontend && npm install

# 2. Configure database
# Edit backend/.env with your PostgreSQL connection string:
DATABASE_URL="postgresql://user@localhost:5432/codered?schema=public"

# 3. Push schema & seed
cd backend
npx prisma db push
npm run seed

# 4. Start backend (port 5001)
npm run dev

# 5. Start frontend (port 5173)
cd ../frontend
npm run dev
```

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@gmail.com | admin123 |
| State Admin | stateadmin@gmail.com | admin123 |
| Officer | officer@gmail.com | admin123 |

## Available Scripts

### Backend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with nodemon |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled JS |
| `npm run seed` | Seed database |
| `npm run prisma:studio` | Open Prisma Studio |

### Frontend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Categories (18 total)

Road Damage, Water Supply, Electricity, Sanitation, Public Safety, Noise Pollution, Illegal Construction, Garbage, Traffic, Street Lighting, Park Maintenance, Drainage/Flooding, Air Pollution, Animal Control, Public Transport, Building Safety, Fire Hazard, Other

## API Documentation

See [backend/API_DOCS.md](backend/API_DOCS.md) for the complete API reference.
