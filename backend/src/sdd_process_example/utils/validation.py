"""Input validation and sanitization utilities."""

import html


def sanitize_player_name(name: str) -> str:
    """Sanitize player name to prevent XSS attacks.

    Args:
        name: Raw player name input

    Returns:
        str: Sanitized name (stripped, HTML-escaped, max 20 chars)

    Example:
        >>> sanitize_player_name("  Alice  ")
        'Alice'
        >>> sanitize_player_name("<script>alert('xss')</script>")
        '&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;'
    """
    # Strip whitespace
    name = name.strip()

    # HTML escape to prevent XSS
    name = html.escape(name)

    # Truncate to 20 characters
    return name[:20]


def validate_player_name(name: str) -> tuple[bool, str]:
    """Validate player name meets requirements.

    Args:
        name: Player name to validate

    Returns:
        tuple[bool, str]: (is_valid, error_message)
            - is_valid: True if name is valid, False otherwise
            - error_message: Empty string if valid, error description if invalid

    Example:
        >>> validate_player_name("Alice")
        (True, '')
        >>> validate_player_name("")
        (False, 'Player name is required')
        >>> validate_player_name("A" * 21)
        (False, 'Player name must be 20 characters or less')
    """
    # Check not empty (after stripping)
    if not name.strip():
        return False, "Player name is required"

    # Check length (before sanitization, based on input)
    if len(name) > 20:
        return False, "Player name must be 20 characters or less"

    return True, ""
