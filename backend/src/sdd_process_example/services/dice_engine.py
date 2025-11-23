"""Dice rolling engine with cryptographic randomness for fairness."""

import secrets
from datetime import UTC, datetime

from ..models import DiceResult
from .dice_parser import DiceParser


class DiceEngine:
    """Engine for generating cryptographically secure dice rolls."""

    def __init__(self) -> None:
        """Initialize the dice engine with a parser."""
        self._parser = DiceParser()

    def roll(
        self, formula: str, player_id: str = "", player_name: str = ""
    ) -> DiceResult:
        """Roll dice based on a formula string (e.g., '2d6+3').

        Args:
            formula: The dice formula string.
            player_id: ID of the player making the roll.
            player_name: Name of the player making the roll.

        Returns:
            A DiceResult object with the outcome.

        Raises:
            ValueError: If the formula is invalid.
        """
        try:
            total, individual_rolls = self._parser.parse(formula)
        except Exception as e:
            # Re-raise Lark's parsing errors as a ValueError for consistency
            raise ValueError(f"Invalid dice formula: {formula}") from e

        # Calculate modifier: total - sum of raw dice rolls
        modifier = total - sum(individual_rolls)

        return DiceResult(
            roll_id=secrets.token_urlsafe(16),
            player_id=player_id,
            player_name=player_name,
            formula=formula,
            individual_results=individual_rolls,
            modifier=modifier,
            total=total,
            timestamp=datetime.now(UTC),
        )

    def validate_formula(self, formula: str) -> bool:
        """Validate a dice roll formula string using the parser.

        Args:
            formula: Formula string to validate

        Returns:
            True if formula is valid, False otherwise
        """
        try:
            self._parser.parse(formula)
            return True
        except Exception:
            return False
