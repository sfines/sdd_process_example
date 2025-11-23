"""A dice parser using Lark for evaluating dice notation."""

import secrets
from typing import Any

from lark import Lark, Transformer, v_args  # type: ignore

# Secure random number generator for dice rolls
_rng = secrets.SystemRandom()


class Roll(int):
    """A wrapper for an integer that represents a single dice roll."""


class DiceTransformer(Transformer):
    """Transforms the parsed tree into a result.

    Each method corresponds to a rule in the grammar.
    """

    def __init__(self) -> None:
        super().__init__()
        self.rolls: list[int] = []

    def expr(self, args: list[Any]) -> int:
        """Process an expression (addition or subtraction)."""
        result = args[0]
        for i in range(1, len(args), 2):
            op = args[i]
            right = args[i + 1]
            if op == "+":
                result += right
            else:
                result -= right
        return result

    def term(self, args: list[Any]) -> int:
        """Process a term (multiplication or division)."""
        result = args[0]
        for i in range(1, len(args), 2):
            op = args[i]
            right = args[i + 1]
            if op == "*":
                result *= right
            elif right == 0:
                raise ValueError("Division by zero is not allowed in dice notation.")
            else:
                result //= right  # Integer division
        return result

    @v_args(inline=True)
    def factor(self, value: int) -> int:
        """Handle factors (dice, numbers, or parenthesized expressions)."""
        return value

    def dice(self, args: list[Any]) -> int:
        """Handle the 'dice' rule (e.g., '2d6')."""
        n_dice, n_sides = args
        if n_dice > 100 or n_sides > 1000:
            raise ValueError("Dice count and sides are limited to 100d1000.")
        # Roll the dice and store individual results
        rolls = [_rng.randint(1, n_sides) for _ in range(n_dice)]
        self.rolls.extend(rolls)
        return sum(rolls)

    def number(self, args: list[Any]) -> int:
        """Convert a number token to an integer."""
        return int(args[0])

    def INT(self, token: str) -> int:
        """Convert an integer token to an integer."""
        return int(token)


class DiceParser:
    """Parses and evaluates a dice expression."""

    def __init__(self) -> None:
        """Initialize the parser with the dice grammar."""
        self.grammar = Lark(
            r"""
            ?start: expr
            ?expr: term (ADD_OP term)*
            ?term: factor (MUL_OP factor)*
            ?factor: dice | number | "(" expr ")"
            dice: INT "d" INT
            number: INT
            ADD_OP: "+" | "-"
            MUL_OP: "*" | "/"
            %import common.INT
            %import common.WS
            %ignore WS
        """,
            start="expr",
        )
        self.transformer = DiceTransformer()

    def parse(self, expression: str) -> tuple[int, list[int]]:
        """Parse a dice expression and return the total and individual rolls.

        Args:
            expression: The dice notation string (e.g., "2d6+1d4-2").

        Returns:
            A tuple containing the total result and a list of individual rolls.
        """
        # Reset rolls for each parse
        self.transformer.rolls = []
        tree = self.grammar.parse(expression)
        total = self.transformer.transform(tree)
        return total, self.transformer.rolls


# Example usage:
if __name__ == "__main__":
    parser = DiceParser()
    total, rolls = parser.parse("2d6+10")
    print(f"Expression: 2d6+10 -> Total: {total}, Rolls: {rolls}")

    total, rolls = parser.parse("1d20-2")
    print(f"Expression: 1d20-2 -> Total: {total}, Rolls: {rolls}")

    total, rolls = parser.parse("(1d4*2)+5")
    print(f"Expression: (1d4*2)+5 -> Total: {total}, Rolls: {rolls}")
