"""Room code generation utilities."""

import random

from redis import Redis


# NATO phonetic alphabet + common words for room codes
WORD_LIST = [
    "ALPHA",
    "BRAVO",
    "CHARLIE",
    "DELTA",
    "ECHO",
    "FOXTROT",
    "GOLF",
    "HOTEL",
    "INDIA",
    "JULIET",
    "KILO",
    "LIMA",
    "MIKE",
    "NOVEMBER",
    "OSCAR",
    "PAPA",
    "QUEBEC",
    "ROMEO",
    "SIERRA",
    "TANGO",
    "UNIFORM",
    "VICTOR",
    "WHISKEY",
    "XRAY",
    "YANKEE",
    "ZULU",
    "APPLE",
    "BANANA",
    "CHERRY",
    "DRAGON",
    "EAGLE",
    "FALCON",
    "GIRAFFE",
    "HORSE",
    "IGUANA",
    "JAGUAR",
    "KOALA",
    "LION",
    "MONKEY",
    "NEWT",
    "OTTER",
    "PANDA",
    "QUAIL",
    "RABBIT",
    "SNAKE",
    "TIGER",
    "UNICORN",
    "VIPER",
    "WALRUS",
    "XERUS",
    "YAK",
    "ZEBRA",
    "AZURE",
    "BRONZE",
    "COPPER",
    "DIAMOND",
    "EMERALD",
    "FROST",
    "GOLDEN",
    "HOLLOW",
    "IVORY",
    "JADE",
    "KNIGHT",
    "LUNAR",
    "MYSTIC",
    "NOBLE",
    "ONYX",
    "PEARL",
    "QUARTZ",
    "RUBY",
    "SILVER",
    "TOPAZ",
    "ULTRA",
    "VIOLET",
    "WINTER",
    "XENON",
    "YELLOW",
    "ZENITH",
    "AMBER",
    "BLAZE",
    "CRYSTAL",
    "DAWN",
    "EMBER",
    "FLAME",
    "GLACIER",
    "HAVEN",
    "IRON",
    "JEWEL",
    "KARMA",
    "LIGHT",
    "MAGIC",
    "NIGHT",
    "OCEAN",
    "PRISM",
    "QUEST",
    "RAVEN",
    "SHADOW",
    "THUNDER",
    "UNITY",
    "VAPOR",
    "WAVE",
    "WIZARD",
    "ZODIAC",
    "ARROW",
    "BLADE",
]


def generate_room_code() -> str:
    """Generate a unique room code in format WORD-####.

    Returns:
        str: Room code in format like "ALPHA-1234"

    Example:
        >>> code = generate_room_code()
        >>> len(code.split("-"))
        2
        >>> code.split("-")[0] in WORD_LIST
        True
    """
    word = random.choice(WORD_LIST)
    number = random.randint(0, 9999)
    return f"{word}-{number:04d}"


def is_code_available(room_code: str, redis_client: Redis) -> bool:
    """Check if a room code is available (not already taken).

    Args:
        room_code: The room code to check (e.g., "ALPHA-1234")
        redis_client: Redis client instance

    Returns:
        bool: True if code is available, False if taken

    Example:
        >>> from unittest.mock import MagicMock
        >>> mock_redis = MagicMock()
        >>> mock_redis.exists.return_value = False
        >>> is_code_available("ALPHA-1234", mock_redis)
        True
    """
    key = f"room:{room_code}"
    return not redis_client.exists(key)
