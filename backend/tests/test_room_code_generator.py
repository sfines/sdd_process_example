"""Tests for room code generation utility."""

from unittest.mock import MagicMock

from sdd_process_example.utils.room_code_generator import (
    generate_room_code,
    is_code_available,
)


class TestGenerateRoomCode:
    """Tests for generate_room_code function."""

    def test_generates_valid_format(self) -> None:
        """Test that generated code matches WORD-#### format."""
        code = generate_room_code()
        parts = code.split("-")

        assert len(parts) == 2, "Code should have WORD-#### format"
        assert parts[0].isalpha(), "First part should be alphabetic"
        assert parts[0].isupper(), "Word should be uppercase"
        assert len(parts[1]) == 4, "Number should be 4 digits"
        assert parts[1].isdigit(), "Second part should be numeric"

    def test_generates_different_codes(self) -> None:
        """Test that multiple calls generate different codes (high probability)."""
        codes = [generate_room_code() for _ in range(100)]
        unique_codes = set(codes)

        # With 100 words and 10,000 numbers, chance of collision is very low
        assert len(unique_codes) > 90, "Should generate mostly unique codes"

    def test_word_from_valid_list(self) -> None:
        """Test that word part comes from predefined list."""
        code = generate_room_code()
        word = code.split("-")[0]

        # We can't test exact list but can verify format
        assert len(word) >= 3, "Word should be at least 3 characters"
        assert len(word) <= 8, "Word should be at most 8 characters"

    def test_number_padded_correctly(self) -> None:
        """Test that number is zero-padded to 4 digits."""
        code = generate_room_code()
        number = code.split("-")[1]

        assert number[0] in "0123456789", "Should allow leading zeros"
        assert len(number) == 4, "Should always be 4 digits"


class TestIsCodeAvailable:
    """Tests for is_code_available function."""

    def test_returns_true_when_code_not_exists(self) -> None:
        """Test returns True when room code is available."""
        mock_redis = MagicMock()
        mock_redis.exists.return_value = False

        result = is_code_available("ALPHA-1234", mock_redis)

        assert result is True
        mock_redis.exists.assert_called_once_with("room:ALPHA-1234")

    def test_returns_false_when_code_exists(self) -> None:
        """Test returns False when room code is taken."""
        mock_redis = MagicMock()
        mock_redis.exists.return_value = True

        result = is_code_available("BRAVO-5678", mock_redis)

        assert result is False
        mock_redis.exists.assert_called_once_with("room:BRAVO-5678")

    def test_uses_correct_redis_key_format(self) -> None:
        """Test that Redis key format is room:{code}."""
        mock_redis = MagicMock()
        mock_redis.exists.return_value = False

        is_code_available("CHARLIE-9999", mock_redis)

        mock_redis.exists.assert_called_once_with("room:CHARLIE-9999")
