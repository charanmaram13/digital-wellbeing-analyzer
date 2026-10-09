# Digital Wellbeing Analyzer 🧘‍♂️⚡
### AI-Powered Screen-Time & Digital Wellbeing Analyzer

**Digital Wellbeing Analyzer** is a full-stack, production-minded modular web application that analyzes digital screen-time data, detects problematic behavioral patterns (such as late-night binging, marathon unbroken sessions, and high category monopolies), calculates a transparent, mathematically explainable Digital Wellbeing Score (0–100), and generates personalized behavioral habit strategies using **Google Gemini AI** with an instant deterministic rule-based fallback.

---

## 🚀 Key Features

- **Transparent Digital Wellbeing Score (0–100)**:
  - 100-point composite scoring model:
    - **Goal Adherence (max 35 pts)**: Daily limit compliance.
    - **Sleep Protection (max 25 pts)**: Minimization of screen exposure after bedtime.
    - **Session Health (max 20 pts)**: Absence of continuous marathon sessions exceeding thresholds.
    - **Focus Consistency (max 20 pts)**: Completion of verified monotasking blocks.
  - Transparent formula audit and classification (`Balanced`, `Needs Attention`, `High-Risk Pattern`).
- **Algorithmic Anomaly & Pattern Detector**:
  - Daily goal overages and magnitude calculations.
  - Late-night circadian disruption alerts based on configured user bedtime.
  - Category over-concentration (e.g. social media or streaming &gt;50% of time).
  - Extended unbroken sessions (&gt;90 minutes) without breaks.
  - Upward usage velocity relative to historical baseline.
- **Google Gemini AI Insights & Fallback**:
  - Structured behavioral recommendations via Google Gemini 1.5 Flash.
  - Strict input sanitization (preventing prompt injections from app names or CSV text).
  - Deterministic rule engine fallback guarantees 100% operational functionality without an API key.
- **Interactive Focus Sprint Timer & Goal Tracker**:
  - Built-in Pomodoro sprint timer (15, 25, 50 min) with progress ring and sound/visual cue.
  - Saves completed focus blocks directly to the database and awards points to the Wellbeing Score.
  - Configurable daily and category-specific screen-time goals.
- **Smart CSV Import & Export**:
  - In-browser and API CSV parser with duplicate detection, header validation, and line-by-line error reporting.
  - One-click export of usage logs.
- **Realistic Demo Mode**:
  - Pre-seeded with 14 days of realistic, varied application usage data clearly tagged as `demo`.
  - Quick-fill demo account login button.
- **Companion Sync Architecture**:
  - REST endpoints ready for companion Android daemon (`UsageStatsManager`) and Desktop client (`GetForegroundWindow`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Lucide Icons, Context API |
| **Backend** | Node.js (ES modules), Express.js, Zod Schema Validation, Helmet, CORS, Cookie-Parser |
| **Database** | MongoDB Atlas / Local MongoDB, Mongoose ODM with compound indexing |
| **Authentication & Security** | JWT, bcrypt password hashing, HTTP-Only cookies, Express Rate Limiting, User Query Scoping |
| **AI Integration** | Google Gemini API (`@google/generative-ai`), structured JSON schema, Deterministic Fallback Engine |
| **Testing** | Vitest, React Testing Library, Supertest |

---

## 📁 Repository Structure

```
digital-wellbeing-analyzer/
├── client/                     # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── app/                # App, Router, Providers
│   │   ├── components/         # UI, Charts, Layout, Insights
│   │   ├── features/           # Auth, Dashboard, ScreenTime, Analytics, Focus, Settings
│   │   ├── services/           # Axios API services
│   │   ├── context/            # AuthContext, ThemeContext
│   │   └── utils/              # Formatters & Category styling
│   ├── tests/                  # Frontend Vitest suite
│   ├── .env.example
│   └── package.json
│
├── server/                     # Express.js REST API Backend
│   ├── src/
│   │   ├── config/             # Environment validation (Zod) & Mongoose DB
│   │   ├── models/             # Mongoose Schemas (User, ScreenTime, Goal, Rec, Focus)
│   │   ├── repositories/       # Data Access Layer (strict user scoping)
│   │   ├── validators/         # Zod Request Body/Query Validators
│   │   ├── controllers/        # Express Route Controllers
│   │   ├── services/           # Domain Business Logic
│   │   ├── analytics/          # Pure JS Analytics, Pattern, & Score Engines
│   │   ├── ai/                 # Gemini Provider & Deterministic Fallback
│   │   ├── middleware/         # Auth, Validate, ErrorHandler, RateLimiter
│   │   └── routes/             # REST API v1 Endpoints
│   ├── tests/                  # Vitest & Supertest E2E & unit tests
│   ├── scripts/                # Demo seeder & sample CSV
│   ├── .env.example
│   └── package.json
│
├── docs/                       # Architecture & API specifications
│   ├── architecture.md
│   ├── api.md
│   └── data-model.md
│
├── .gitignore
├── package.json                # Root workspace orchestrator
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v22+ supported)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or free MongoDB Atlas URI

---

### 1. Installation

Clone or open the repository root:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

### 2. Environment Configuration

#### Backend Configuration (`server/.env`):
Create `server/.env` (or copy `server/.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/digital_wellbeing
JWT_SECRET=super_secret_jwt_key_wellbeing_dev_1234567890
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
COOKIE_SECURE=false
```
> **Note**: If `GEMINI_API_KEY` is omitted, the system seamlessly uses the **Deterministic Behavioral Engine** without interruption!

#### Frontend Configuration (`client/.env`):
Create `client/.env` (or copy `client/.env.example`):
```env
VITE_API_BASE_URL=/api/v1
```

---

### 3. Seed Realistic Demo Data

Run the seeder script to initialize sample accounts, 14 days of realistic records, sample goals, and focus sessions:
```bash
cd server
npm run seed
```
Demo Credentials generated:
- **Email**: `demo@wellbeing.local`
- **Password**: `DemoUser123!`

---

### 4. Running Locally

#### Run Backend Server:
```bash
cd server
npm run dev
# Server starts on http://localhost:5000
# Health check probe: http://localhost:5000/api/v1/health
```

#### Run Frontend Client:
In a separate terminal:
```bash
cd client
npm run dev
# Vite dev server starts on http://localhost:5173
```

Open `http://localhost:5173` in your browser. On the login page, you can click **"Quick Fill Demo Account"** to immediately explore all dashboard graphs, scores, and AI recommendations.

---

## 🧪 Testing

Both backend and frontend contain automated unit and integration tests:

### Run Backend Tests (Analytics Pure Unit Tests + Supertest E2E):
```bash
cd server
npm test
```
*Tests cover:*
- Pure aggregation, late-night detection, and daily averages
- Baseline comparisons and zero-previous-day edge cases
- Pattern detector heuristics
- Wellbeing score calculation formula
- REST API authentication and HTTP-only cookie delivery
- User data isolation security (User 2 blocked from User 1 records)
- CSV parser, streaming validator, and duplicate detection
- AI insight generation with deterministic fallback

### Run Frontend Tests:
```bash
cd client
npm test
```
*Tests cover:*
- Formatter utilities (`formatMinutesToHours`, `formatDate`)
- UI component rendering (`Button`, `Badge`, `MetricCard`)

---

## 📖 REST API Reference (`/api/v1`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/health` | System liveness probe (DB & AI status) | No |
| `POST` | `/auth/register` | Register new account & set JWT cookie | No |
| `POST` | `/auth/login` | Authenticate & set JWT cookie | No |
| `POST` | `/auth/logout` | Clear authentication cookie | No |
| `GET` | `/auth/me` | Fetch authenticated profile | Yes |
| `GET` | `/screen-time` | List records with pagination and filters | Yes |
| `POST` | `/screen-time` | Create screen-time entry | Yes |
| `GET` | `/screen-time/:id` | Get record by ID (user-scoped) | Yes |
| `PATCH` | `/screen-time/:id` | Update record by ID | Yes |
| `DELETE`| `/screen-time/:id` | Delete record | Yes |
| `POST` | `/screen-time/import` | Batch import CSV records | Yes |
| `GET` | `/screen-time/export` | Export all records as CSV file | Yes |
| `GET` | `/analytics/overview` | 6 dashboard metrics, score, & patterns | Yes |
| `GET` | `/analytics/daily` | 14-day daily usage breakdown | Yes |
| `GET` | `/analytics/weekly` | Week-over-week comparison | Yes |
| `GET` | `/analytics/categories`| Category duration & percentage split | Yes |
| `GET` | `/analytics/patterns` | Active behavioral anomaly alerts | Yes |
| `GET` | `/analytics/wellbeing-score` | 100-point score mathematical audit | Yes |
| `POST` | `/insights/generate` | Generate AI insights (Gemini / Fallback)| Yes |
| `GET` | `/recommendations` | List user recommendations | Yes |
| `PATCH`| `/recommendations/:id`| Update recommendation status | Yes |
| `GET` | `/goals` | List user limits & targets | Yes |
| `POST` | `/goals` | Create new screen-time limit | Yes |
| `GET` | `/focus-sessions` | List Pomodoro sprint sessions | Yes |
| `POST` | `/focus-sessions` | Start/complete a focus sprint | Yes |
| `GET` | `/settings` | Get user thresholds & bedtime | Yes |
| `PATCH`| `/settings` | Update user thresholds | Yes |

---

## 🔒 Security & Privacy Architecture

1. **User Scoping & Isolation**:
   Every database query in `repositories/` is programmatically scoped to `userId: req.user._id`. Private resources cannot be accessed or manipulated by substituting an ObjectId.
2. **Zero Exposed Credentials**:
   `JWT_SECRET`, `MONGODB_URI`, and `GEMINI_API_KEY` exist strictly in the backend `.env`. The client `.env` contains solely `VITE_API_BASE_URL`.
3. **HTTP-Only Cookies & CSRF Protection**:
   JWT tokens are stored in `httpOnly`, `sameSite`, `secure` cookies preventing XSS token exfiltration.
4. **Input Sanitization for AI**:
   Prompts sanitize user-supplied application names and metadata, preventing prompt injection attacks.
5. **Rate Limiting**:
   Authentication endpoints and AI generation routes are protected with `express-rate-limit`.

---

## ☁️ Deployment Guidelines

### Backend (Render / Railway / AWS):
1. Create a Web Service connected to this repository with Root Directory set to `server`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Set environment variables: `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `GEMINI_API_KEY`, `COOKIE_SECURE=true`.

### Frontend (Vercel / Netlify):
1. Connect repository with Root Directory set to `client`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variable: `VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1`

---

## 📄 License
MIT License. Built for healthy digital balance.
