# FastAPI Security Hardening

This document outlines recommended Python libraries and strategies for hardening the FastAPI application, with a special focus on WebSocket security.

### Core FastAPI/Starlette Features (Your First Line of Defense)

Before adding new libraries, it's essential to leverage the powerful security features built into FastAPI and its underlying ASGI framework, Starlette.

1.  **Data Validation with Pydantic:**
    - **Why:** This is FastAPI's strongest feature. It prevents common vulnerabilities like NoSQL/SQL injection, and malformed data attacks by ensuring all incoming data conforms to a strict schema.
    - **For WebSockets:** While FastAPI automatically validates HTTP request bodies, for WebSockets you must do it manually. When you receive a message (e.g., as JSON), you should immediately parse and validate it with a Pydantic model inside a `try/except` block.

2.  **Dependency Injection for Auth:**
    - **Why:** Use `fastapi.Depends` to create reusable authentication and authorization components. This ensures that endpoints (or WebSocket connections) are protected by requiring a valid user, token, or specific permissions.
    - **For WebSockets:** You can use dependency injection directly in the WebSocket route handler to verify credentials passed during the initial connection (e.g., via query parameters or cookies).

### WebSocket-Specific Security

WebSockets are persistent connections, which introduces unique security challenges compared to stateless HTTP requests.

1.  **Authentication:** Since WebSockets don't have headers for every message, you must authenticate the connection itself.
    - **Library:** `python-jose` for handling JSON Web Tokens (JWT).
    - **Strategy:** Implement an authentication function using `python-jose` that you call via `Depends`. The token can be passed from the client in one of two ways:
      1.  **As a query parameter** during the connection request: `ws://yourserver.com/ws?token=...`
      2.  **As the very first message** sent over the WebSocket after it's established.

2.  **Rate Limiting:** Protects against Denial-of-Service (DoS) attacks where a client might flood your server with messages.
    - **Library:** `slowapi`
    - **Why:** It's a rate-limiter specifically designed for Starlette and FastAPI and works seamlessly with both regular HTTP routes and WebSockets. You can apply rate limits per IP address or per authenticated user.

### General Application Security (Highly Recommended)

These libraries address broader security concerns that apply to your entire application.

1.  **Password Hashing:**
    - **Library:** `passlib` with `bcrypt`.
    - **Why:** If you are storing user accounts, you must never store passwords in plaintext. `passlib` is the standard for securely hashing and verifying passwords.

2.  **Secure HTTP Headers:**
    - **Library:** `secure`
    - **Why:** Adds important security headers (like `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`, etc.) to your responses automatically. This helps mitigate common web vulnerabilities like Cross-Site Scripting (XSS) and clickjacking. It's implemented as a simple middleware.

3.  **CORS (Cross-Origin Resource Sharing):**
    - **Library:** `fastapi.middleware.cors.CORSMiddleware`.
    - **Why:** While not a "hardening" library itself, it's a critical security feature. It allows you to control which frontend domains are allowed to connect to your API, preventing unauthorized web applications from interacting with it.

### Development & CI/CD Security

1.  **Static Code Analysis:**
    - **Tool:** `bandit`
    - **Why:** Scans your Python code for common security vulnerabilities, like using weak cryptographic functions or hardcoding secrets. It's best used as a pre-commit hook or in your CI pipeline.

2.  **Dependency Scanning:**
    - **Tool:** `pip-audit`
    - **Why:** Scans your project's dependencies (`uv.lock`, `requirements.txt`, etc.) and alerts you if any of them have known security vulnerabilities (CVEs). This is crucial for preventing supply chain attacks.
