# FIFA Card Tracker

A web app for tracking your FIFA World Cup sticker collection. Users can manage their card collections, join groups, and trade stickers with other members.

**Stack:** React (Vite) + Django REST Framework + SQLite

---

## Prerequisites

- Python 3.10+: --python version
- Node.js 18+: -node v
- npm: -npm v

Ensure all prerequisites are updated to their latest stable releases to guarantee compatibility with the following:
* **Django:** Installed into the Python virtual environment (`.venv`) during the `pip install` step.
  - To check if installed: Ensure you are in the /backend directory and .venv is active. Run `python -m django --version`.
* **React & Vite:** Installed into the `node_modules` folder during the `npm install` step.
  - To check if React and Vite are installed: Ensure you are inside the /frontend directory. Run `npm list react`. Then run `npx vite -v`.
* **SQLite:** This is bundled with Python by default, so no separate installation is required.
  - To check if SQLite is installed: Run `sqlite3 --version`.

---
## Installation
```bash
git clone https://github.com/KolyCode/FIFA-Card-Tracker.git
```

## Automatic Setup
```bash
./start.sh
```
Please make sure before running this command, you have 
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
