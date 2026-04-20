# FIFA Card Tracker

A web app for tracking your FIFA World Cup sticker collection. Users can manage their card collections, join groups, and trade stickers with other members.

**Stack:** React (Vite) + Django REST Framework + SQLite

---

## Prerequisites

- Python 3.10+
- Node.js 18+

---
## Installation
```bash
git clone https://github.com/KolyCode/FIFA-Card-Tracker.git
```

## Automatic Setup
```bash
./start.sh
```
If this does not work, set up everything manually (explained below).

## Manual Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Load player data into the database
python manage.py load_players

# (Optional) Create a moderator account
python manage.py create_moderator --username admin --password admin

# Start the development server
python manage.py runserver
```

The API will be available at `http://localhost:8000`.

---

## Manual Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

The frontend defaults to `http://localhost:8000` for the API. To override this, create a `.env` file in the `frontend/` directory:

```
VITE_API_URL=http://your-api-url
```
