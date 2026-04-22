# 💰 SmartBudget

SmartBudget is a production-grade personal finance web app built for users
who want more than a transaction log. It combines statistical anomaly
detection, AI-powered interpretation, and TensorFlow.js forecasting to help
users understand their spending behavior, stay on budget, and make smarter
financial decisions.

Built with React, Firebase, and an AI agent layer that communicates insights
in plain, actionable language.

---

🚀 **[Live Demo](https://smartbudget-beta.vercel.app/)**

---

## Features

### Core Finance Tools
- **Dashboard** — Complete snapshot of income, expenses, budgets, and goals
at a glance
- **Transactions** — Log, view, filter, and manage income and expenses
- **Budgets** — Per-category budgets with proactive overspending alerts
- **Goals** — Financial goals with time-based progress tracking
- **Reports** — Interactive charts with PDF and CSV export

### Smart Insights Engine
SmartBudget has a two-layer insight system:

**Rule-based insights**
Proactive alerts for budget thresholds, spending patterns, and goal progress.

**AI-powered insights**
- Anomaly detection using Median Absolute Deviation (MAD) to flag
statistically unusual spending per category
- An AI agent interprets each anomaly and returns a specific explanation
and actionable suggestion in plain language
- TensorFlow.js forecasting model predicts next month's spending per category
- Multi-model fallback chain: primary model → fallback model → rule-based
insight, ensuring users always receive an insight regardless of API
availability
- Per-user insight quota system to manage API usage responsibly

### User Experience
- Real-time data sync powered by Firestore listeners
- In-app notifications for transaction, budget, and goal thresholds
- Per-user isolated data with Firebase security rules
- Custom spending categories with real-time UI updates
- Skeleton loaders, page transitions, and modal animations
- Lazy loading and SEO-friendly setup

---

## ⚒️ Tech Stack

- **Frontend**: React, Zustand, TailwindCSS, Framer Motion
- **State Management**: Zustand
- **Backend**: Firebase (Firestore, Auth)
- **AI Agent**: OpenAI GTP-4o-mini (primary), GPT-4o (fallback)
- **ML/AI**: TensorFlow.js(anomaly detection + forecasting)
- **Charts**: Chart.js
- **API Layer** Vercel Serverless Functions
- **Testing**: Vitest
- **Build Tool**: Vite

---

## 📂 Project Structure

-public/
-api/             # AI API
-lib/             # Firebase Admin setup + Quota tracking(server-side)
-src/
----components/   # Reusable UI Components
----context/      # React Context providers
----data/         # Static and sample data
----firebase/     # Firebase config and listeners(client-side)
----hooks/        # Custom hooks
----initializer/  # App-level initializer
----layout/       # Page layout component
----ml/           # AI agents, anomaly detection, forecasting
----pages/        # Route-level page components
----routes/       # Route definitions
----schema/       # Validation schemas
----store/        # Zustand stores
----tests/        # Unit and integration test
----utils/        # Utility functions
----App.jsx
----main.css
----main.jsx
-index.html

---

## Architecture Notes

SmartBudget is designed with production constraints in mind:

- **Data isolation** — Each user's data is scoped and protected via
Firestore security rules
- **Anomaly deduplication** — Detected anomalies are stored transactionally
to prevent duplicate API calls on the same data
- **Cost management** — API calls are gated by a per-user quota system.
Users on the free tier receive a fixed number of AI insights. Rule-based
fallback ensures uninterrupted experience when quota is reached
- **Resilient AI pipeline** — If the primary model fails, the system
automatically retries with the fallback model before defaulting to
rule-based insights

---

## Status

Active development. Not open source.