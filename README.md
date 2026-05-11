# Session Tracker API

A Django REST API for tracking work and study sessions with categorized time logging.

## Features

- User authentication with Django session auth
- CRUD operations for personal sessions
- Global category system with duplicate prevention
- Paginated list endpoints with configurable page size
- Filter sessions by category and date range
- API-first architecture

## Tech Stack

| Component             | Version |
| --------------------- | ------- |
| Python                | 3.12    |
| Django                | 5.x     |
| Django REST Framework | 3.15    |
| Database              | SQLite  |

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

| Method | Endpoint              | Auth | Description         |
| ------ | --------------------- | ---- | ------------------- |
| GET    | /api/categories/      | No   | List all categories |
| GET    | /api/categories/{id}/ | No   | Get single category |

### Sessions

| Method | Endpoint                   | Auth | Description                      |
| ------ | -------------------------- | ---- | -------------------------------- |
| GET    | /api/sessions/             | Yes  | List user's sessions (paginated) |
| GET    | /api/sessions/{id}/        | Yes  | Get single session               |
| POST   | /api/sessions/add/         | Yes  | Create session                   |
| PUT    | /api/sessions/update/{id}/ | Yes  | Full update                      |
| PATCH  | /api/sessions/patch/{id}/  | Yes  | Partial update                   |
| DELETE | /api/sessions/delete/{id}/ | Yes  | Delete session                   |

## Query Parameters

### Pagination

| Parameter | Type    | Default | Description              |
| --------- | ------- | ------- | ------------------------ |
| page      | integer | 1       | Page number              |
| page_size | integer | 20      | Items per page (max: 50) |

### Filtering

| Parameter  | Type              | Description                          |
| ---------- | ----------------- | ------------------------------------ |
| category   | integer           | Filter by category ID                |
| start_date | date (YYYY-MM-DD) | Filter sessions created on or after  |
| end_date   | date (YYYY-MM-DD) | Filter sessions created on or before |

**Example:** `GET /api/sessions/?category=2&start_date=2025-05-01&page=1`

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
{
	"id": 5,
	"title": "Deep Work",
	"duration": 3600,
	"category": {
		"id": 2,
		"name": "Coding"
	},
	"created_at": "2025-05-06T14:30:00Z"
}
```

### List Sessions with Pagination

```bash
curl -X GET "http://localhost:8000/api/sessions/?page=1&page_size=10" \
  -b "sessionid=<id>"
```

Response 200:

```json
{
	"count": 45,
	"next": "http://localhost:8000/api/sessions/?page=2&page_size=10",
	"previous": null,
	"results": [
		{
			"id": 5,
			"title": "Deep Work",
			"duration": 3600,
			"category": {
				"id": 2,
				"name": "Coding"
			},
			"created_at": "2025-05-06T14:30:00Z"
		}
	]
}
```

### Filter by Category

```bash
curl -X GET "http://localhost:8000/api/sessions/?category=2" \
  -b "sessionid=<id>"
```

### Filter by Date Range

```bash
curl -X GET "http://localhost:8000/api/sessions/?start_date=2025-05-01&end_date=2025-05-07" \
  -b "sessionid=<id>"
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

Response 200:

```json
{ "success": "session deleted" }
```

## Data Model

### Session

| Field       | Type          | Constraints         | Description                   |
| ----------- | ------------- | ------------------- | ----------------------------- |
| user        | ForeignKey    | CASCADE, non-null   | Owner (auto-set from request) |
| title       | CharField     | max_length=50       | Session title                 |
| description | TextField     | blank=True          | Optional notes                |
| category    | ForeignKey    | SET_NULL, null=True | Optional category             |
| duration    | IntegerField  | positive            | Duration in seconds           |
| created_at  | DateTimeField | auto_now_add=True   | Creation timestamp            |

### Category

| Field       | Type      | Constraints                | Description              |
| ----------- | --------- | -------------------------- | ------------------------ |
| name        | CharField | max_length=50, unique=True | Normalized category name |
| description | TextField | blank=True                 | Optional description     |

## Design Decisions

- **API-first architecture.** Backend serves JSON via REST endpoints. Frontend consumes via fetch. Separation allows independent evolution.
- **User-scoped sessions.** All session queries filter by `request.user`. Users cannot access others' data.
- **Global categories with normalization.** Categories are shared across users. Names are `.title().strip()` normalized on save to prevent duplicates like "study", "Study", "STUDY".
- **Write-only category_id, read-only nested category.** Frontend sends `category_id` integer. API returns full nested `category` object for display.
- **Pagination by default.** List endpoints return paginated responses to prevent performance issues with large datasets.
- **Optional filtering.** Query parameters allow clients to narrow results without multiple round trips.

## Trade-offs

- **Session auth instead of JWT.** Simpler for v1 with browser frontend. JWT planned for API-only mobile clients.
- **SQLite in development.** Sufficient for single-user testing. PostgreSQL required for production concurrency.
- **Hard delete on sessions.** No recovery. Soft delete with `is_active` flag considered for v2.
- **Function-based views.** Explicit and readable. Planned migration to DRF ViewSets in v2.

## Running Tests

```bash
python manage.py test session --verbosity=2
```

## License

MIT
