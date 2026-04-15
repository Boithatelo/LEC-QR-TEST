# LEC IntelliSupport

LEC IntelliSupport is an internal IT support platform with a modern web frontend, a Django API backend, and a separate AI service for ticket classification and assistance.

## Project Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- App Router (`app/` directory)
- Tailwind CSS 4
- shadcn/ui
- Radix UI
- Lucide React
- Recharts

### Backend

- Python
- Django 5
- Django REST Framework

### AI / Intelligent Services

- FastAPI
- Uvicorn
- scikit-learn
- pandas
- NumPy
- joblib
- TF-IDF + Logistic Regression models for ticket classification and support assistance

### Database

- SQLite for local/default development
- PostgreSQL support for configured environments

### Tooling

- ESLint
- PostCSS
- npm / Node.js

## Architecture Summary

- A Next.js frontend handles the user interface and dashboard experience.
- A Django REST backend manages users, tickets, workflows, and business logic.
- A separate FastAPI AI service provides machine-learning powered ticket categorization and related assistance.
