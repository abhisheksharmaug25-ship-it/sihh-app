# 🏥 MedVault — Connected Care

A hospital-centric digital patient medical record system built for **Smart India Hackathon**. MedVault lets patients and families manage health records, track vitals, store medical documents, and prepare for doctor consultations with an AI assistant.

**Live demo:** https://medvault-cyan.vercel.app

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Secure Auth | Register/login with bcrypt-hashed passwords and session cookies |
| 👨‍👩‍👧 Family Profiles | Manage health records for the whole family under one account |
| 📊 Health Analytics | Track sugar, BP, weight, pulse & temperature with trends |
| 💊 Medicine Tracker | Medicine schedules with dosage, frequency & instructions |
| 📄 Document Vault | Upload & view PDFs/images (prescriptions, lab reports) |
| 🤖 AI Assistant | Pre-consultation chat that organizes symptoms into a structured summary |
| 📜 Medical History | Timeline of conditions, events & attachments |

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4, lucide-react
- **Backend:** Next.js API Routes (REST), bcryptjs, session auth
- **AI:** OpenAI-compatible LLM API (`gpt-4o-mini` default) for the health assistant
- **Storage:** Vercel Blob (production) / local filesystem (dev)
- **Database:** JSON store (Prisma schema ready for migration)
- **Hosting:** Vercel

## 🚀 Getting Started

```bash
git clone https://github.com/abhisheksharmaug25-ship-it/sihh-app.git
cd sihh-app
npm install
npm run dev
```

Open http://localhost:3000

### Environment Variables

Create a `.env` file (see `.env.example`):

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | No | Prisma DB URL (JSON store used by default) |
| `LLM_API_KEY` | No | OpenAI-compatible API key for the AI assistant |
| `LLM_BASE_URL` | No | Custom LLM provider base URL |
| `LLM_MODEL` | No | Model name (default: `gpt-4o-mini`) |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob token for file storage on Vercel |

## 📡 REST API

| Endpoint | Methods | Description |
|---|---|---|
| `/api/auth/register` | POST | Create account |
| `/api/auth/login` | POST | Login |
| `/api/auth/logout` | POST | Logout |
| `/api/me` | GET | Current user |
| `/api/profile` | GET, PUT | Patient profile |
| `/api/patients` | GET, POST | Patient records |
| `/api/family` | GET, POST | Family members |
| `/api/health/readings` | GET, POST | Vitals readings |
| `/api/medicines` | GET, POST, PUT, DELETE | Medicine tracker |
| `/api/documents` | GET, POST, DELETE | Document vault |
| `/api/documents/[id]` | GET | View/download document |
| `/api/documents/analyze` | POST | AI document analysis |
| `/api/assistant` | POST | AI health assistant |
| `/api/consultations` | GET, POST | Consultations |
| `/api/history` | GET, POST, DELETE | Medical history |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/            # REST API routes
│   ├── analytics/      # Health analytics page
│   ├── medicines/      # Medicine tracker page
│   └── page.tsx        # Main dashboard
├── components/         # React components
└── lib/                # Auth, storage, data store, helpers
```

## 📜 License

MIT
