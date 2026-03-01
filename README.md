# 🌍 Carbon Footprint Tracking and Analysis System

> **Engineering Design and Innovation - 2 | Semester 4**  
> Vishwakarma Institute of Technology, Pune  
> **Group SY-F-10** | Guide: Prof. Palomi Gawali

A full-stack web application that helps individuals track, analyze, and reduce their carbon emissions using AI-powered recommendations, gamification, and predictive analytics.

---

## 📋 Features

### Core Features
- **Carbon Activity Logging** — Track emissions across 6 categories: Travel, Electricity, Food, Streaming, Waste, Shopping
- **Real-time Emission Calculation** — Uses IPCC-backed emission factors for accurate CO₂ calculations
- **Interactive Dashboard** — Visual overview with charts, trends, and budget tracking

### AI & ML Features
- **AI Recommendations** — Rule-based personalized suggestions with SHAP-like feature contribution analysis
- **Emission Predictions** — Linear regression-based 30-day forecasting with trend and risk assessment
- **What-If Analysis** — Simulate lifestyle changes and see projected impact
- **ML Models (Python)** — Ridge Regression, Random Forest, XGBoost for advanced predictions

### Gamification
- **EcoScore System** — Dynamic score (0-100) based on emission patterns
- **Leaderboard** — Global, city, and city-comparison rankings
- **Badges** — 12 achievement badges (First Log, Week Streak, Eco Warrior, etc.)
- **Challenges** — Individual, city, college, weekly, and monthly eco-challenges
- **Leveling System** — Earn points and level up through consistent tracking

### Advanced Features
- **City Emission Heatmap** — Compare emissions across Indian cities with intensity levels
- **Personal Heatmap** — Daily × category emission matrix with day-of-week patterns
- **Carbon Credit Simulation** — Earn and redeem virtual carbon credits
- **Monthly Budget Tracking** — Country-specific monthly emission budgets

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vue.js 3, Vite, Tailwind CSS, Pinia, Chart.js |
| **Backend** | Node.js, Express.js, JWT Authentication |
| **Database** | MongoDB with Mongoose ODM |
| **ML (JS)** | simple-statistics, ml-regression, ml-random-forest |
| **ML (Python)** | scikit-learn, XGBoost, pandas, matplotlib |

---

## 📁 Project Structure

```
code/
├── client/                    # Vue.js Frontend
│   ├── src/
│   │   ├── components/        # Navbar, Sidebar
│   │   ├── views/             # 11 page views
│   │   ├── stores/            # Pinia state management
│   │   ├── services/          # Axios API service
│   │   ├── router/            # Vue Router with auth guards
│   │   ├── assets/            # Tailwind CSS
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                    # Node.js Backend
│   ├── config/                # DB connection, emission factors
│   ├── controllers/           # 8 controllers (auth, carbon, etc.)
│   ├── middleware/             # JWT auth middleware
│   ├── models/                # 4 Mongoose models
│   ├── routes/                # 8 route files
│   ├── seed/                  # Demo data seeder
│   ├── server.js
│   └── package.json
│
└── ml/                        # Python ML Models
    ├── models.py              # Ridge, RF, XGBoost predictors
    ├── train.py               # Training script (MongoDB/synthetic)
    ├── visualize.py           # Feature importance & SHAP plots
    └── requirements.txt
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **Python** 3.9+ (for ML models, optional)

### 1. Backend Setup

```bash
cd code/server
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Seed demo data
npm run seed

# Start server
npm run dev
```

The server runs at `http://localhost:5000`

### 2. Frontend Setup

```bash
cd code/client
npm install

# Start dev server
npm run dev
```

The app runs at `http://localhost:3000`

### 3. ML Models (Optional)

```bash
cd code/ml
pip install -r requirements.txt

# Train with synthetic data
python train.py --synthetic

# Train with MongoDB data
python train.py

# Generate visualizations
python visualize.py
```

### Demo Login
- **Email:** demo@carbon.app
- **Password:** demo123

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/auth/profile` | Get user profile |
| POST | `/api/carbon/log` | Log carbon activity |
| GET | `/api/carbon/records` | Get emission records |
| GET | `/api/carbon/summary/monthly` | Monthly summary |
| GET | `/api/carbon/breakdown` | Category breakdown |
| GET | `/api/recommendations` | AI recommendations |
| GET | `/api/predictions/forecast` | 30-day forecast |
| POST | `/api/predictions/what-if` | What-if analysis |
| GET | `/api/gamification/leaderboard` | Leaderboard |
| GET | `/api/gamification/challenges` | Active challenges |
| GET | `/api/gamification/badges` | User badges |
| GET | `/api/heatmap/cities` | City emission heatmap |
| GET | `/api/heatmap/user` | Personal heatmap |
| GET | `/api/credits` | Carbon credit balance |
| POST | `/api/credits/calculate` | Calculate new credits |
| POST | `/api/credits/redeem` | Redeem credits |
| GET | `/api/dashboard` | Full dashboard data |

---

## 👥 Team Members

| Name | Role |
|------|------|
| Siddhant Udavant | Full Stack Development |
| Shruti Sonawane | Frontend & UI/UX |
| Trupti Shinde | Backend & Database |
| Kanika Shinde | ML Models & Analysis |
| Ayush Shewale | Testing & Documentation |

---

## 📚 References

1. Wiedmann, T. & Minx, J. (2007) — Definition of Carbon Footprints
2. IPCC Emission Factor Database — Greenhouse gas calculations
3. India GHG Programme — India-specific emission factors
4. Lundberg & Lee (2017) — SHAP values for ML interpretability

---

## 📄 License

This project is developed for academic purposes as part of the EDI-2 course at VIT, Pune.
