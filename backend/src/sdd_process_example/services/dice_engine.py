"""Dice rolling engine with cryptographic randomness for fairness."""

import re
import secrets
from datetime import UTC, datetime

from ..models import DiceResult


class DiceEngine:
    """Engine for generating cryptographically secure dice rolls."""

    def __init__(self) -> None:
        """Initialize the dice engine with secure random generator."""
        self._rng = secrets.SystemRandom()

    def roll_d20(
        self, modifier: int = 0, player_id: str = "", player_name: str = ""
    ) -> DiceResult:
        """Roll a single d20 with optional modifier.

        Args:
            modifier: Integer modifier to add to the roll (-20 to +20)
            player_id: ID of the player making the roll
            player_name: Name of the player making the roll

        Returns:
            DiceResult with formula, individual results, modifier, and total
        """
        roll = self._rng.randint(1, 20)
        total = roll + modifier

        # Format formula string
        if modifier > 0:
            formula = f"1d20+{modifier}"
        elif modifier < 0:
            formula = f"1d20{modifier}"  # Negative sign already included
        else:
            formula = "1d20"

        return DiceResult(
            roll_id=secrets.token_urlsafe(16),
            player_id=player_id,
            player_name=player_name,
            formula=formula,
            individual_results=[roll],
            modifier=modifier,
            total=total,
            timestamp=datetime.now(UTC),
        )

    def validate_formula(self, formula: str) -> bool:
        """Validate a dice roll formula string.

        Accepts formats:
        - "1d20"
        - "1d20+5"
        - "1d20-3"

        Args:
            formula: Formula string to validate

        Returns:
            True if formula is valid, False otherwise
        """
        # Pattern: {count}d{sides}[+/-{modifier}]
        pattern = r"^\d+d\d+([+-]\d+)?$"
        return bool(re.match(pattern, formula))
