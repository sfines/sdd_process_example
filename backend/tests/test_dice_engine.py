"""Unit tests for DiceEngine service - TDD approach."""

import pytest

from sdd_process_example.services.dice_engine import DiceEngine


def test_dice_engine_initialization() -> None:
    """Test that DiceEngine initializes correctly."""
    engine = DiceEngine()
    assert engine._parser is not None


def test_roll_returns_valid_range() -> None:
    """Test that roll returns results in a valid range."""
    engine = DiceEngine()
    result = engine.roll(formula="1d20", player_id="test", player_name="Test")
    assert 1 <= result.total <= 20


def test_roll_with_positive_modifier() -> None:
    """Test roll with a positive modifier."""
    engine = DiceEngine()
    result = engine.roll(formula="1d6+5", player_id="test", player_name="Test")
    assert result.modifier == 5
    assert result.formula == "1d6+5"
    assert 6 <= result.total <= 11


def test_roll_with_negative_modifier() -> None:
    """Test roll with a negative modifier."""
    engine = DiceEngine()
    result = engine.roll(formula="1d20-3", player_id="test", player_name="Test")
    assert result.modifier == -3
    assert result.formula == "1d20-3"
    assert -2 <= result.total <= 17


def test_roll_without_modifier() -> None:
    """Test a simple roll without any modifier."""
    engine = DiceEngine()
    result = engine.roll(formula="1d20", player_id="test", player_name="Test")
    assert result.modifier == 0
    assert result.total == result.individual_results[0]


def test_roll_includes_player_info() -> None:
    """Test that the roll result includes player information."""
    engine = DiceEngine()
    result = engine.roll(formula="1d20", player_id="player123", player_name="Alice")
    assert result.player_id == "player123"
    assert result.player_name == "Alice"


def test_roll_generates_unique_ids() -> None:
    """Test that each roll generates a unique roll_id."""
    engine = DiceEngine()
    roll_ids = {
        engine.roll(formula="1d6", player_id="test", player_name="Test").roll_id
        for _ in range(100)
    }
    assert len(roll_ids) == 100


def test_validate_formula_valid_basic() -> None:
    """Test validate_formula accepts basic dice notation."""
    engine = DiceEngine()
    assert engine.validate_formula("1d20") is True
    assert engine.validate_formula("2d6") is True


def test_validate_formula_valid_with_modifier() -> None:
    """Test validate_formula accepts dice notation with modifiers."""
    engine = DiceEngine()
    assert engine.validate_formula("1d20+5") is True
    assert engine.validate_formula("2d6-3") is True


def test_validate_formula_invalid() -> None:
    """Test validate_formula rejects invalid formulas."""
    engine = DiceEngine()
    assert engine.validate_formula("invalid") is False
    assert engine.validate_formula("d20") is False
    assert engine.validate_formula("1d") is False


def test_roll_complex_formula() -> None:
    """Test a more complex formula with multiple dice and modifiers."""
    engine = DiceEngine()
    result = engine.roll(formula="2d8+1d4-2", player_id="test", player_name="Test")
    # Total should be sum of 2d8 and 1d4, minus 2
    # Min: 1+1+1-2=1, Max: 8+8+4-2=18
    assert 1 <= result.total <= 18
    assert len(result.individual_results) == 3  # 2d8 + 1d4


def test_roll_raises_for_invalid_formula() -> None:
    """Test that roll raises ValueError for an invalid formula."""
    engine = DiceEngine()
    with pytest.raises(ValueError, match="Invalid dice formula"):
        engine.roll(formula="invalid-dice", player_id="test", player_name="Test")
