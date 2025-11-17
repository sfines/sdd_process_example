# Contributing to SDD Process Example

## Setup

### Prerequisites

- Docker and Docker Compose
- Python 3.11+ (for local development)
- Node.js 20+ (for local frontend development)
- pnpm package manager

### Local Development

#### With Docker

```bash
docker-compose up
```

The application will be available at:

- Frontend: `http://localhost`
- Backend: `http://localhost:8000`
- Backend Health Check: `http://localhost:8000/api/health`

#### Without Docker

**Backend:**

```bash
cd backend
pip install -e ..
pytest tests/
python -m uvicorn main:app --reload
```

**Frontend:**

```bash
cd frontend
pnpm install
pnpm run dev
```

## Linting and Type Checking

### Backend

```bash
# Lint Python code
ruff check backend/ --select=E,W,F

# Type check Python code
mypy backend/ --strict

# Format Python code (automatic)
ruff format backend/
```

### Frontend

```bash
# Lint TypeScript/JavaScript code
npm run lint

# Type check TypeScript code
npm run typecheck

# Format code (automatic)
npm run format
```

## Testing

### Backend

```bash
pytest backend/tests/ -v
```

### Frontend

```bash
npm run test -- run
```

## Code Standards

- **Python:** Python 3.11+, type hints required, strict mypy
- **JavaScript/TypeScript:** TypeScript with strict mode, ESLint configuration
- **Linting:** All warnings must be resolved before merge
- **Tests:** All tests must pass before merge

## Git Workflow

1. Create a feature branch from `develop`
2. Make your changes, ensuring all linting and type checks pass
3. Write or update tests for your changes
4. Push to GitHub and create a Pull Request
5. All CI/CD checks must pass
6. Once approved and merged, the build workflow automatically triggers for Docker images

## CI/CD Pipeline

The project uses GitHub Actions for:

- **Lint Workflow** (`.github/workflows/lint.yml`): Runs on develop branch push
  - Python: `ruff check`
  - JavaScript/TypeScript: `eslint`
- **Type Check Workflow** (`.github/workflows/type-check.yml`): Runs on develop branch push
  - Python: `mypy --strict`
  - TypeScript: `tsc --noEmit`
- **Test Workflow** (`.github/workflows/test.yml`): Runs on develop branch push
  - Python: `pytest`
  - JavaScript: `vitest`
- **Build Workflow** (`.github/workflows/build.yml`): Runs on main branch merge
  - Builds Docker images for backend and frontend
  - Pushes to GitHub Container Registry (GHCR)

## Port Configuration

Default ports:

- Frontend: 80 (localhost) or 3000 (dev server)
- Backend: 8000
- Redis: 6379

To use different ports, create a `docker-compose.override.yml` file:

```yaml
version: '3.9'

services:
  backend:
    ports:
      - '8001:8000'

  frontend:
    ports:
      - '3001:80'

  redis:
    ports:
      - '6380:6379'
```

## Troubleshooting

### Docker port conflicts

If port 80, 3000, 8000, or 6379 is already in use, use `docker-compose.override.yml` to map to different ports.

### mypy strict mode issues

Some third-party libraries may not have complete type stubs. You can add exceptions in `pyproject.toml`:

```toml
[tool.mypy]
ignore_missing_imports = true
```

### npm/pnpm install issues

Clear cache and reinstall:

```bash
pnpm install --force
```
