import nox


@nox.session(python=["3.13"])
def lint(session: nox.Session) -> None:
    session.install("ruff")
    session.run("ruff", "check", ".")


@nox.session(python=["3.13"])
def format(session: nox.Session) -> None:
    session.install("ruff", "isort")
    session.run("ruff", "format", ".")
    session.run("isort", ".")


@nox.session(python=["3.13"])
def typecheck(session: nox.Session) -> None:
    session.install("mypy", "fastapi", "pydantic", "uvicorn")
    session.run("mypy", "--strict", "backend/src")


@nox.session(python=["3.13"])
def test(session: nox.Session) -> None:
    session.install("-e", ".")
    session.install("pytest", "pytest-cov", "pytest-asyncio", "httpx")
    session.run("pytest", "backend/tests/", "-v", "--cov=backend/src")


@nox.session(python=["3.13"])
def security(session: nox.Session) -> None:
    """Run Bandit security checks on the codebase."""
    session.install("bandit[toml]")
    session.run(
        "bandit",
        "-r",
        "backend/src",
        "-c",
        "pyproject.toml",
        "-f",
        "screen",
    )

