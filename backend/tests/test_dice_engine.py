"""Unit tests for DiceEngine service - TDD approach."""

from sdd_process_example.services.dice_engine import DiceEngine


def test_dice_engine_initialization() -> None:
    """Test that DiceEngine initializes correctly."""
    engine = DiceEngine()
    assert engine._rng is not None


def test_roll_d20_returns_valid_range() -> None:
    """Test that roll_d20 returns results in valid range (1-20)."""
    engine = DiceEngine()

    # Roll 100 times to ensure randomness works
    for _ in range(100):
        result = engine.roll_d20(player_id="test", player_name="Test Player")
        assert len(result.individual_results) == 1
        roll_value = result.individual_results[0]
        assert 1 <= roll_value <= 20, f"Roll value {roll_value} out of range"


def test_roll_d20_with_positive_modifier() -> None:
    """Test roll_d20 with positive modifier."""
    engine = DiceEngine()
    result = engine.roll_d20(modifier=5, player_id="test", player_name="Test")

    assert result.modifier == 5
    assert result.formula == "1d20+5"
    roll_value = result.individual_results[0]
    assert result.total == roll_value + 5


def test_roll_d20_with_negative_modifier() -> None:
    """Test roll_d20 with negative modifier."""
    engine = DiceEngine()
    result = engine.roll_d20(modifier=-3, player_id="test", player_name="Test")

    assert result.modifier == -3
    assert result.formula == "1d20-3"
    roll_value = result.individual_results[0]
    assert result.total == roll_value - 3


def test_roll_d20_without_modifier() -> None:
    """Test roll_d20 without modifier."""
    engine = DiceEngine()
    result = engine.roll_d20(modifier=0, player_id="test", player_name="Test")

    assert result.modifier == 0
    assert result.formula == "1d20"
    roll_value = result.individual_results[0]
    assert result.total == roll_value


def test_roll_d20_includes_player_info() -> None:
    """Test that roll_d20 includes player information."""
    engine = DiceEngine()
    result = engine.roll_d20(modifier=0, player_id="player123", player_name="Alice")

    assert result.player_id == "player123"
    assert result.player_name == "Alice"
    assert result.roll_id is not None
    assert len(result.roll_id) > 0
    assert result.timestamp is not None


def test_roll_d20_generates_unique_ids() -> None:
    """Test that each roll generates a unique roll_id."""
    engine = DiceEngine()
    roll_ids = set()

    for _ in range(100):
        result = engine.roll_d20(player_id="test", player_name="Test")
        assert result.roll_id not in roll_ids, "Duplicate roll_id generated"
        roll_ids.add(result.roll_id)


def test_validate_formula_valid_basic() -> None:
    """Test validate_formula accepts basic dice notation."""
    engine = DiceEngine()
    assert engine.validate_formula("1d20") is True
    assert engine.validate_formula("2d6") is True
    assert engine.validate_formula("3d8") is True


def test_validate_formula_valid_with_modifier() -> None:
    """Test validate_formula accepts dice notation with modifiers."""
    engine = DiceEngine()
    assert engine.validate_formula("1d20+5") is True
    assert engine.validate_formula("2d6-3") is True
    assert engine.validate_formula("1d20+10") is True


def test_validate_formula_invalid() -> None:
    """Test validate_formula rejects invalid formulas."""
    engine = DiceEngine()
    assert engine.validate_formula("invalid") is False
    assert engine.validate_formula("d20") is False
    assert engine.validate_formula("1d") is False
    assert engine.validate_formula("") is False
    assert engine.validate_formula("1d20+") is False
    assert engine.validate_formula("1d20-") is False


def test_roll_d20_distribution_roughly_uniform() -> None:
    """Test that d20 rolls have roughly uniform distribution."""
    engine = DiceEngine()
    rolls = [
        engine.roll_d20(player_id="test", player_name="Test").individual_results[0]
        for _ in range(1000)
    ]

    # Count occurrences of each value (1-20)
    counts = {i: rolls.count(i) for i in range(1, 21)}

    # Each value should appear roughly 50 times (1000/20)
    # Allow generous range for randomness: 20-80 times
    for value, count in counts.items():
        assert 20 <= count <= 80, f"Value {value} appeared {count} times (expected ~50)"
