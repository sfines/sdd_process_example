# Prompt: Define Python Coding Standards

You are an expert Python developer and style guide author. Produce a practical, organization-ready Python Coding Standards document that follows current best practices (2025) and is suitable for modern backend and library code.

Deliverables and structure

- Include a "Tooling & Config" section that provides sample `pyproject.toml`, `noxfile.py`, and editor/IDE recommendations.

Essential enforcement / hard constraints

Typing & public APIs

Testing

Error handling & logging

Security & secrets

Concurrency

Packaging & dependencies
Include `pyproject.toml` with metadata, `build-system`, and tool configs for Ruff and isort. Use `uv` project workflows (e.g., `uv sync`) in docs for reproducible developer environments.
Ruff, isort, Mypy, Pre-commit, and `pyproject` examples.
Also include a minimal `pyproject.toml` snippet that merges Ruff, isort, and MyPy config.

- Provide `noxfile.py` example and recommended nox sessions (lint, format, test, typecheck) to standardize local and CI commands.

Migration

1. Add `pyproject.toml` and the target tool configs.
2. Run `pre-commit run --all-files` and fix issues progressively.
3. Use `ruff format --fix` to standardize code style (Ruff replaces Black for formatting tasks).
4. Add type checking as `disallow_untyped_defs = false` first; then increase strictness gradually.

Examples

Reviewer checklist (10 items)

GitHub Actions snippet

Add enforcement config snippets

- Add a short **one-page Decision Table** template summarizing high-level rules and enforcement levels (INFO/WARN/FAIL) for the architecture and standards documents.

Make the standard actionable and minimal. The generated standard should be `2-6` pages of Markdown that developers can follow and copy into `docs/standards/python.md`. Also include a minimal `pyproject.toml` snippet that merges Ruff, isort, and MyPy config.

Return only the Markdown content without additional commentary.

## End of Prompt
