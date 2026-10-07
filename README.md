# 🌾 AgriSentinel

**AI-powered crop disease detection and district-level agricultural surveillance platform** — connecting farmers who need fast diagnosis with officers who need district-wide visibility, before small outbreaks become big losses.

> Upload a photo of a sick crop → get an AI diagnosis with treatment steps in seconds.
> Be a district officer → see every case, every hotspot, and every weather-driven risk on one dashboard — and actually act on it.

---

## 📖 Table of Contents

- [Why this exists](#-why-this-exists)
- [Who it's for](#-who-its-for)
- [Features](#-features)
  - [For Farmers](#-for-farmers)
  - [For District Officers](#-for-district-officers)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Core Data Model](#-core-data-model)
- [API Overview](#-api-overview)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Folder Structure](#-folder-structure)
- [Challenges & What I Learned](#-challenges--what-i-learned)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🌱 Why this exists

Smallholder farmers often can't get fast, reliable help when a crop starts showing disease symptoms — by the time an expert sees it, the damage has spread. At the same time, district agriculture officers have **no aggregated view** of what's happening across their district: no map of hotspots, no way to confirm or reject AI diagnoses, no tracking of whether a referral or treatment actually helped, and no early warning before weather conditions make an outbreak worse.

**AgriSentinel closes that loop** — from a farmer's phone camera, to AI diagnosis, to officer verification, to tracked follow-up, to weather-based early warning.

## 👥 Who it's for

| Role | What they get |
|---|---|
| 🧑‍🌾 **Farmer** | Upload a crop photo → instant AI diagnosis, treatment plan, and a history of every report they've submitted with live case status |
| 🧑‍💼 **District Officer** | A full "Command Center" — district-wide hotspot map, analytics, case verification workflow, referral tracking, follow-up outcomes, and a 4-category weather risk engine |

---

## ✨ Features

### 🧑‍🌾 For Farmers

- **📸 AI Crop Health Analysis** — upload a photo + crop details (soil type, growth stage, symptoms, affected area) and get back a structured AI diagnosis: primary diagnosis, confidence score, alternative diagnoses, visible symptoms, possible causes, a full treatment plan (biological/chemical/cultural/soil-water controls), farmer self-checks, and clear guidance on when to escalate to an expert.
- **📍 Automatic location tagging** — GPS coordinates are reverse-geocoded to resolve the district automatically, so every report is instantly visible to the right officer.
- **🗂️ My Reports** — a personal history of every analysis ever submitted, with crop, date, severity, and thumbnail at a glance.
- **🔍 Transparent case tracking** — open any report and see, read-only, exactly what the officer has done: case status (`Pending Review → Verified → Action Taken → Resolved`), any lab/field referral raised, and any follow-up visit scheduled — with the officer's own notes.

### 🧑‍💼 For District Officers

- **🗺️ District Hotspot Map** — every case plotted on a live Leaflet map, color-coded by severity, so clusters of disease are visible at a glance.
- **📊 Full Analytics Suite**
  - Crop health distribution donut chart
  - Disease-category bar chart (fungal / viral / pest / bacterial / healthy)
  - Day-wise disease progression trend — click any point for a breakdown of healthy/moderate/high-risk counts for that exact date
- **🖱️ Clickable stat cards** — Total Reports, High Risk, Moderate, Healthy — each opens a filtered, full list of matching cases
- **✅ Case Status Workflow** — officers confirm or reject the AI's diagnosis (`Pending Review → Verified / False Positive → Action Taken → Resolved`) with an optional note, so the system actually learns from field confirmation instead of trusting the AI blindly
- **📋 Referral System** — raise a **Lab Referral** or **Field Visit** for any high-risk case, with assignee, due date, and status tracking (`Pending → In Progress → Completed / Cancelled`)
- **🔁 Follow-up / Revisit Tracking** — schedule a recheck date for any case, then record the real-world outcome: **Improved / No Change / Worsened** — turning "we recommended a treatment" into "we know if it worked"
- **⏰ Due Follow-ups Reminder** — a dashboard banner surfaces every follow-up that's due or overdue, so nothing falls through the cracks
- **🌦️ Weather Risk Engine** — live OpenWeatherMap data converted into **four separate risk scores**, for both *right now* and the *next 5 days*:
  | Risk | Driven by |
  |---|---|
  | 🍄 Fungal Disease | Humidity + rainfall + temperature |
  | 🐛 Viral / Pest | Heat + dryness (favors whitefly/aphid activity) |
  | 🔥 Heat Stress | Extreme temperature |
  | 💧 Water/Moisture Stress | Drought (low humidity, no rain) or waterlogging (heavy rain) |

  Full breakdown includes a current-conditions hero panel, 5-day forecast charts, a grouped daily risk chart, and a raw hour-by-hour table — turning the dashboard from purely *reactive* (something already went wrong) to *proactive* (conditions favor an outbreak this week).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router, Tailwind CSS, Recharts, React-Leaflet, Lucide Icons |
| Backend | Node.js, Express.js (split across multiple microservices) |
| Database | MongoDB + Mongoose (GeoJSON `2dsphere` indexing for location queries) |
| Auth | Firebase Google Sign-In + OTP verification, JWT via HTTP-only cookies |
| AI | Gemini AI (structured crop disease diagnosis) |
| Weather | OpenWeatherMap API (current + 5-day/3-hour forecast) |
| Geocoding | OpenStreetMap Nominatim (reverse geocoding for district resolution) |
| Media | Cloudinary (crop photo storage) |
| Deployment | Vercel (frontend) + Render (backend services) |

---

## 🏗️ Architecture

AgriSentinel's backend is split into **independent microservices** rather than one monolith — an auth service, a file-upload service, and a crop-analysis service — communicating over HTTP. This keeps the AI/analysis workload isolated from auth and media handling.

```
┌─────────────┐      ┌───────────────────┐      ┌────────────────────┐
│   React SPA │─────▶│   Auth Service     │      │  Analysis Service   │
│  (Vercel)   │      │  Firebase + JWT     │      │  Gemini AI + Geo    │
└─────┬───────┘      └───────────────────┘      └─────────┬──────────┘
      │                                                     │
      │              ┌───────────────────┐                 │
      └─────────────▶│  File Upload Svc   │◀────────────────┘
                      │    Cloudinary       │
                      └───────────────────┘
                              │
                      ┌───────────────────┐
                      │     MongoDB         │
                      │  (2dsphere index)   │
                      └───────────────────┘
```

Each analysis document stores both a **GeoJSON Point** (for map rendering and radius-style queries) and a **pre-resolved `district` string** (from reverse geocoding at submission time), so the district officer's queries stay fast without needing geo-aggregation on every request.

---

## 🧬 Core Data Model

The heart of the system is the `Analysis` document — one crop report, enriched over its entire lifecycle:

```
Analysis
├── cropName, cropTypeUse, cropTypeSeason, soilType, growthStage
├── symptoms, affectedArea, description, photoURL
├── addLocation: { type: "Point", coordinates, formattedAddress }
├── district                      ← resolved once, queried many times
├── userId                        ← the farmer who submitted it
├── aianalysis                    ← full structured Gemini output
│   ├── summary, cropHealth, primaryDiagnosisDetails
│   ├── alternativeDiagnoses[], locationAnalysis
│   ├── recommendedActions, treatmentDetails
│   └── farmerChecks[], whenToSeekExpertHelp
├── status                        ← officer verification workflow
├── officerNote, reviewedBy, reviewedAt
└── followUps[]                   ← scheduled revisits + recorded outcomes
    ├── scheduledDate, status
    └── improvementStatus, outcomeNotes, completedAt

Referral  (one-to-many with Analysis)
├── analysisId, type               ← "Lab Referral" | "Field Visit"
├── assigneeName, assigneeContact, dueDate
├── status                         ← Pending | In Progress | Completed | Cancelled
└── createdBy, completedAt
```

---

## 🔌 API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/farmer/analysis` | Submit a new crop analysis (photo + AI diagnosis) |
| `GET` | `/farmer/analysis/mine` | Farmer's own report history |
| `GET` | `/farmer/district-data/:district` | All reports in an officer's district |
| `GET` | `/farmer/district/analysis/:id` | Single analysis by ID |
| `PATCH` | `/farmer/analysis/:id/status` | Update case status (officer) |
| `POST` | `/farmer/analysis/:id/followup` | Schedule a follow-up/revisit |
| `PATCH` | `/farmer/analysis/:id/followup/:followupId` | Record follow-up outcome |
| `GET` | `/farmer/followups/due/:district` | Due/overdue follow-ups for a district |
| `POST` | `/farmer/referral` | Raise a lab/field referral |
| `PATCH` | `/farmer/referral/:id/status` | Update referral status |
| `GET` | `/farmer/referral/analysis/:analysisId` | Referrals for one case |
| `GET` | `/farmer/weather-risk/:district` | Current 4-category weather risk |
| `GET` | `/farmer/weather-forecast/:district` | 5-day/3-hour forecast with risk per slot |

All routes are protected by JWT auth middleware; officer-only actions are additionally role-gated on the frontend.

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB instance (local or Atlas)
- Firebase project (Google Sign-In enabled)
- Cloudinary account
- OpenWeatherMap API key (free tier)
- A Gemini API key

### Setup

```bash
# Clone the repo
git clone https://github.com/Manvendra-2006/FarmerHelper.git
cd agrisentinel

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

# Frontend-specific packages
npm install recharts react-leaflet leaflet
```

Set up your `.env` files (see [Environment Variables](#-environment-variables)), then run:

```bash
# Backend
cd server
npm run dev

# Frontend
cd client
npm run dev
```

> ⚠️ **Deploying to Vercel?** Don't forget a `vercel.json` with a catch-all rewrite to `index.html`, or client-side routes will 404 on refresh.

---

## 🔐 Environment Variables

**Backend**
```env
MONGO_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
OPENWEATHER_API_KEY=
GEMINI_API_KEY=
FIREBASE_PROJECT_ID=
```

**Frontend**
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_API_BASE_URL=
```

---

## 📁 Folder Structure

```
client/
├── src/
│   ├── pages/
│   │   ├── Home.jsx, SelectRole.jsx, Login.jsx
│   │   ├── farmer/MyReports.jsx, CropHealthAnalysis.jsx
│   │   └── officer/CommandCenter.jsx, DistrictReports.jsx, WeatherAnalytics.jsx
│   ├── componenet/
│   │   ├── dashboard/     ← charts, map, modal, referral & follow-up panels
│   │   └── ProtectedRoute.jsx
│   ├── context/Authcontext.jsx
│   └── axios/
server/
├── controller/analysis.controller.js, referral.controller.js
├── models/analysis.model.js, Referral.model.js
├── routes/analysis.routes.js, referral.routes.js
└── middleware/authmiddleware.js
```

---

## 🧩 Challenges & What I Learned

- **AI output doesn't always match your enum.** Real severity strings like `"Severe"`, `"Mild"`, `"Moderate to Severe"` silently fell into an "Unknown" bucket because the normalizer only checked for exact keywords — meaning the *most dangerous* cases were the ones getting hidden. Fixed by re-ordering classification checks most-severe-first.
- **SPA routing + static hosts need a rewrite rule.** Client-side routes 404'd on refresh on Vercel until a `vercel.json` catch-all rewrite was added.
- **Inconsistent auth payload access is a silent killer.** Mixing `req.user._id`, `req.userId`, and `req.user.data.user._id` across controllers meant fields like `reviewedBy` saved as `undefined` with zero errors thrown.
- **One modal, two roles.** Instead of building a separate farmer-facing detail view, the same `AnalysisDetailModal` is reused with a `readOnly` flag — cutting duplicate UI work while keeping both roles' experiences consistent.

---

## 🗺️ Roadmap

- [ ] Multilingual advisories (Hindi / Chhattisgarhi)
- [ ] SMS/push notifications for due follow-ups
- [ ] Extension-worker role with self-service referral updates
- [ ] Pest-trap / IoT sensor input alongside photo-based detection
- [ ] Surveillance coverage metric (% of registered farmers actively reporting)

---

<p align="center">Built by <strong>Manvendra Bhardwaj</strong> 🌾</p>
