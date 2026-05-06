# Session Tracker API

A Django REST API for tracking work and study sessions with categorized time logging.

## Features

- User authentication with Django session auth
- CRUD operations for personal sessions
- Global category system with duplicate prevention
- API-first architecture

## Tech Stack

| Component | Version |
|-----------|---------|
| Python | 3.12 |
| Django | 5.x |
| Django REST Framework | 3.15 |
| Database | SQLite |

## Quick Start

```bash
git clone <your-repo-url>
cd session-tracker
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## API Endpoints

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/categories/ | No | List all categories |
| GET | /api/categories/{id}/ | No | Get single category |

### Sessions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/sessions/ | Yes | List user's sessions |
| GET | /api/sessions/{id}/ | Yes | Get single session |
| POST | /api/sessions/add/ | Yes | Create session |
| PUT | /api/sessions/update/{id}/ | Yes | Full update |
| PATCH | /api/sessions/patch/{id}/ | Yes | Partial update |
| DELETE | /api/sessions/delete/{id}/ | Yes | Delete session |

## API Examples

### Create Session

```bash
curl -X POST http://localhost:8000/api/sessions/add/ \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: <token>" \
  -b "sessionid=<id>" \
  -d '{"title":"Deep Work","duration":3600,"category_id":2}'
```

Response 201:
```json
{"id":5,"title":"Deep Work","duration":3600,"category":{"id":2,"name":"Coding"},"created_at":"2025-05-06T14:30:00Z"}
```

### Partial Update

```bash
curl -X PATCH http://localhost:8000/api/sessions/patch/5/ \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: <token>" \
  -b "sessionid=<id>" \
  -d '{"title":"Updated"}'
```

### Delete Session

```bash
curl -X DELETE http://localhost:8000/api/sessions/delete/5/ \
  -H "X-CSRFToken: <token>" \
  -b "sessionid=<id>"
```

## Data Model

Session: user (FK), title (CharField 50), description (TextField blank), category (FK null), duration (IntegerField), created_at (DateTimeField auto)

Category: name (CharField 50 unique), description (TextField blank)

## Design Decisions

- API-first: Backend serves JSON, frontend consumes via fetch
- User-scoped: All session queries filter by request.user
- Global categories: Shared across users, names normalized with .title().strip()
- Write-only category_id input, read-only nested category output

## Trade-offs

- Session auth instead of JWT (simpler for v1, JWT planned for v2)
- SQLite for development (PostgreSQL for production)
- Hard delete (soft delete considered for v2)

## License

MIT
