# MedVault — Architecture

## Overview

MedVault is a hospital-centric digital patient medical record system built on Next.js with a REST API backend.

```
User (Browser)
  |
  v
Next.js Frontend (React 19, Tailwind CSS)
  |
  v
Next.js API Routes (REST)
  |
  +----> JSON Data Store (data/sihh.json)  [Prisma schema ready for Postgres migration]
  |
  +----> Vercel Blob (document storage)
  |
  v
AI Assistant (OpenAI-compatible LLM API)
  |
  v
Pre-consultation summary
```

## Components

### Frontend
- **App Router pages:** dashboard (`/`), analytics (`/analytics`), medicines (`/medicines`)
- **Components:** FamilyModal, HealthAnalytics, Medicines

### Backend (REST API)
- **Auth:** `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` — bcrypt password hashing + httpOnly session cookies
- **Records:** `/api/patients`, `/api/family`, `/api/profile`, `/api/history`
- **Health:** `/api/health/readings` (sugar, BP, weight, pulse, temperature)
- **Documents:** `/api/documents` (upload/list/delete), `/api/documents/[id]` (view/download), `/api/documents/analyze` (AI extraction)
- **AI:** `/api/assistant` — pre-consultation chat that organizes symptoms into a structured summary

### Storage
- **Documents:** Vercel Blob in production (`BLOB_READ_WRITE_TOKEN`), local `public/uploads` in development
- **Data:** JSON file store; Prisma schema defined for migration to a hosted database

### Security
- Patient ownership checks on every route
- Session cookies are httpOnly and secure in production
- No secrets committed to the repository
