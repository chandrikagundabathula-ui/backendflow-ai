# BackendFlow AI - FastAPI Service

FastAPI REST API backend powered by SQLAlchemy and SQLite.

## Endpoints
- `GET /api/health` - Health check status
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (JWT)
- `GET /api/auth/me` - User profile
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project detail
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

## Testing
Run pytest:
```bash
python -m pytest tests -v
```
