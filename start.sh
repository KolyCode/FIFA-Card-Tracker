#!/usr/bin/env bash
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Backend
echo ">>> Setting up backend..."
cd "$REPO_ROOT/backend"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

source .venv/bin/activate

pip install -r requirements.txt --quiet

python manage.py migrate --run-syncdb

# Load players only if the table is empty
PLAYER_COUNT=$(python manage.py shell -c "from backend_api.models import Player; print(Player.objects.count())" 2>/dev/null || echo "0")
if [ "$PLAYER_COUNT" = "0" ]; then
  echo ">>> Loading player data..."
  python manage.py load_players
else
  echo ">>> Players already loaded, skipping."
fi

# Create default moderator if it doesn't exist
python manage.py create_moderator --username admin --password admin 2>/dev/null || true

echo ">>> Starting Django on http://localhost:8000 ..."
python manage.py runserver &
BACKEND_PID=$!

# Frontend
echo ">>> Setting up frontend..."
cd "$REPO_ROOT/frontend"

npm install --silent

echo ">>> Starting Vite on http://localhost:5173 ..."
npm start &
FRONTEND_PID=$!

# Cleanup on exit
trap "echo '>>> Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT INT TERM

echo ""
echo "App running:"
echo "  Frontend → http://localhost:5173"
echo "  Backend  → http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop."

wait $BACKEND_PID $FRONTEND_PID
