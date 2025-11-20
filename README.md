# SDD Process Example

A full-stack application demonstrating Specification-Driven Development practices. This project showcases a modern development workflow with FastAPI backend, React frontend, Docker containerization, and comprehensive CI/CD pipelines.

## Quick Start

### With Docker

```bash
docker-compose up
```

The application will be available at:

- **Frontend:** http://localhost
- **Backend API:** http://localhost:8000
- **Health Check:** http://localhost:8000/api/health

### Without Docker

**Backend:**

```bash
python -m pip install -e .
python -m uvicorn backend.main:app --reload
```

**Frontend:**

```bash
npm install
npm run dev
```

## Technology Stack

- **Backend:** FastAPI 0.104+, Python 3.11, Uvicorn
- **Frontend:** React 18.2+, TypeScript 5.3+, Vite 5.0+
- **Testing:** pytest (backend), vitest (frontend)
- **Linting:** ruff (Python), ESLint (TypeScript)
- **Type Checking:** mypy (Python), tsc (TypeScript)
- **Infrastructure:** Docker, Docker Compose
- **CI/CD:** GitHub Actions, GHCR

## Project Structure

```
.
├── backend/
│   ├── Dockerfile
│   ├── main.py              # FastAPI application
│   ├── pyproject.toml       # Python dependencies
│   └── tests/
│       └── test_health.py
├── frontend/
│   ├── Dockerfile
│   ├── package.json         # Node dependencies
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── tests/
│       └── App.test.tsx
├── docker-compose.yml
├── .github/
│   ├── workflows/
│   │   ├── lint.yml
│   │   ├── type-check.yml
│   │   ├── test.yml
│   │   └── build.yml
│   └── CONTRIBUTING.md
└── README.md
```

## Development

See [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) for detailed development setup and contribution guidelines.

### Running Tests

**Backend:**

```bash
pytest backend/tests/ -v
```

**Frontend:**

```bash
npm run test -- run
```

### Linting and Type Checking

**Backend:**

```bash
ruff check backend/
mypy backend/ --strict
```

**Frontend:**

```bash
npm run lint
npm run typecheck
```

## CI/CD Pipeline

All commits to `develop` trigger:

- Linting (ruff, eslint)
- Type checking (mypy, tsc)
- Unit tests (pytest, vitest)

Merges to `main` trigger:

- Docker image builds for backend and frontend
- Automated push to GitHub Container Registry (GHCR)

## Roadmap

- **Story 1.1:** Project Scaffolding and CI/CD Setup ✅
- **Story 1.2:** WebSocket Connection and Real-time Communication
- Future stories as per Epic 1 specification

## License

See [LICENSE](LICENSE) file for details.
