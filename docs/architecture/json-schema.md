# JSON Schema Definitions

This document provides JSON schema definitions for the main data structures used in the D&D Dice Roller application.

## Room

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Room",
  "description": "A dice rolling room",
  "type": "object",
  "properties": {
    "room_code": {
      "description": "WORD-#### format (e.g., 'ALPHA-1234')",
      "type": "string"
    },
    "mode": {
      "type": "string",
      "enum": ["open", "dm-led"]
    },
    "created_at": {
      "description": "Unix timestamp (ms)",
      "type": "integer"
    },
    "last_activity": {
      "description": "Unix timestamp (ms)",
      "type": "integer"
    },
    "ttl": {
      "description": "Seconds (1800 for DM-led, 18000 for Open)",
      "type": "integer"
    },
    "creator_player_id": {
      "description": "UUID (room admin)",
      "type": "string",
      "format": "uuid"
    },
    "dm_player_id": {
      "description": "UUID (only in DM-led mode)",
      "type": "string",
      "format": "uuid"
    },
    "dc": {
      "description": "Current DC threshold (1-30)",
      "type": "integer",
      "minimum": 1,
      "maximum": 30
    },
    "players": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/player"
      }
    },
    "roll_history": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/roll"
      }
    },
    "kicked_sessions": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "mode_change_history": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/modeChange"
      }
    }
  },
  "required": [
    "room_code",
    "mode",
    "created_at",
    "last_activity",
    "ttl",
    "creator_player_id",
    "players",
    "roll_history",
    "kicked_sessions",
    "mode_change_history"
  ],
  "definitions": {
    "player": {
      "title": "Player",
      "description": "A player in a dice rolling room",
      "type": "object",
      "properties": {
        "player_id": {
          "description": "UUID for the player",
          "type": "string",
          "format": "uuid"
        },
        "name": {
          "description": "Player's name",
          "type": "string",
          "minLength": 1,
          "maxLength": 20
        },
        "connected": {
          "description": "Real-time connection status",
          "type": "boolean"
        },
        "joined_at": {
          "description": "Unix timestamp (ms) of when the player joined",
          "type": "integer"
        },
        "session_hash": {
          "description": "SHA256(IP + User-Agent) for kick tracking",
          "type": "string"
        },
        "last_seen": {
          "description": "Unix timestamp (ms) of when the player was last seen",
          "type": "integer"
        }
      },
      "required": [
        "player_id",
        "name",
        "connected",
        "joined_at",
        "session_hash",
        "last_seen"
      ]
    },
    "roll": {
      "title": "Roll",
      "description": "A single dice roll",
      "type": "object",
      "properties": {
        "roll_id": {
          "description": "UUID for the roll",
          "type": "string",
          "format": "uuid"
        },
        "player_id": {
          "description": "UUID of the player who made the roll",
          "type": "string",
          "format": "uuid"
        },
        "player_name": {
          "description": "Snapshot of the player's name at the time of the roll",
          "type": "string"
        },
        "timestamp": {
          "description": "Unix timestamp (ms) of the roll",
          "type": "integer"
        },
        "sequence": {
          "description": "Deterministic ordering within the room",
          "type": "integer"
        },
        "dice_formula": {
          "description": "Display string for the roll, e.g., '3d6+5'",
          "type": "string"
        },
        "dice_type": {
          "description": "Number of sides on the dice",
          "type": "integer",
          "enum": [4, 6, 8, 10, 12, 20, 100]
        },
        "dice_count": {
          "description": "Number of dice rolled",
          "type": "integer"
        },
        "modifier": {
          "description": "Value added to or subtracted from the total",
          "type": "integer"
        },
        "advantage": {
          "description": "Advantage status of the roll",
          "type": "string",
          "enum": ["none", "advantage", "disadvantage"]
        },
        "individual_results": {
          "description": "Raw results of each die roll",
          "type": "array",
          "items": {
            "type": "integer"
          }
        },
        "total": {
          "description": "Final result of the roll (sum + modifier)",
          "type": "integer"
        },
        "hidden": {
          "description": "Whether the roll is hidden from other players",
          "type": "boolean"
        },
        "revealed": {
          "description": "Whether a hidden roll has been revealed",
          "type": "boolean"
        },
        "dc_check": {
          "description": "Optional DC evaluation",
          "type": "object",
          "properties": {
            "dc": {
              "type": "integer"
            },
            "passed": {
              "type": "boolean"
            }
          },
          "required": ["dc", "passed"]
        },
        "permalink": {
          "description": "URL path for the permalink, e.g., '/roll/{roll_id}'",
          "type": "string"
        }
      },
      "required": [
        "roll_id",
        "player_id",
        "player_name",
        "timestamp",
        "sequence",
        "dice_formula",
        "dice_type",
        "dice_count",
        "modifier",
        "advantage",
        "individual_results",
        "total",
        "hidden",
        "revealed",
        "permalink"
      ]
    },
    "modeChange": {
      "title": "ModeChange",
      "description": "A record of a room mode change",
      "type": "object",
      "properties": {
        "timestamp": {
          "description": "Unix timestamp (ms) of the mode change",
          "type": "integer"
        },
        "from_mode": {
          "type": "string",
          "enum": ["open"]
        },
        "to_mode": {
          "type": "string",
          "enum": ["dm-led"]
        },
        "dm_player_id": {
          "description": "UUID of the newly designated DM",
          "type": "string",
          "format": "uuid"
        },
        "initiated_by": {
          "description": "player_id of the room creator",
          "type": "string",
          "format": "uuid"
        }
      },
      "required": [
        "timestamp",
        "from_mode",
        "to_mode",
        "dm_player_id",
        "initiated_by"
      ]
    }
  }
}
```

## Player

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Player",
  "description": "A player in a dice rolling room",
  "type": "object",
  "properties": {
    "player_id": {
      "description": "UUID for the player",
      "type": "string",
      "format": "uuid"
    },
    "name": {
      "description": "Player's name",
      "type": "string",
      "minLength": 1,
      "maxLength": 20
    },
    "connected": {
      "description": "Real-time connection status",
      "type": "boolean"
    },
    "joined_at": {
      "description": "Unix timestamp (ms) of when the player joined",
      "type": "integer"
    },
    "session_hash": {
      "description": "SHA256(IP + User-Agent) for kick tracking",
      "type": "string"
    },
    "last_seen": {
      "description": "Unix timestamp (ms) of when the player was last seen",
      "type": "integer"
    }
  },
  "required": [
    "player_id",
    "name",
    "connected",
    "joined_at",
    "session_hash",
    "last_seen"
  ]
}
```

## Roll

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Roll",
  "description": "A single dice roll",
  "type": "object",
  "properties": {
    "roll_id": {
      "description": "UUID for the roll",
      "type": "string",
      "format": "uuid"
    },
    "player_id": {
      "description": "UUID of the player who made the roll",
      "type": "string",
      "format": "uuid"
    },
    "player_name": {
      "description": "Snapshot of the player's name at the time of the roll",
      "type": "string"
    },
    "timestamp": {
      "description": "Unix timestamp (ms) of the roll",
      "type": "integer"
    },
    "sequence": {
      "description": "Deterministic ordering within the room",
      "type": "integer"
    },
    "dice_formula": {
      "description": "Display string for the roll, e.g., '3d6+5'",
      "type": "string"
    },
    "dice_type": {
      "description": "Number of sides on the dice",
      "type": "integer",
      "enum": [4, 6, 8, 10, 12, 20, 100]
    },
    "dice_count": {
      "description": "Number of dice rolled",
      "type": "integer"
    },
    "modifier": {
      "description": "Value added to or subtracted from the total",
      "type": "integer"
    },
    "advantage": {
      "description": "Advantage status of the roll",
      "type": "string",
      "enum": ["none", "advantage", "disadvantage"]
    },
    "individual_results": {
      "description": "Raw results of each die roll",
      "type": "array",
      "items": {
        "type": "integer"
      }
    },
    "total": {
      "description": "Final result of the roll (sum + modifier)",
      "type": "integer"
    },
    "hidden": {
      "description": "Whether the roll is hidden from other players",
      "type": "boolean"
    },
    "revealed": {
      "description": "Whether a hidden roll has been revealed",
      "type": "boolean"
    },
    "dc_check": {
      "description": "Optional DC evaluation",
      "type": "object",
      "properties": {
        "dc": {
          "type": "integer"
        },
        "passed": {
          "type": "boolean"
        }
      },
      "required": ["dc", "passed"]
    },
    "permalink": {
      "description": "URL path for the permalink, e.g., '/roll/{roll_id}'",
      "type": "string"
    }
  },
  "required": [
    "roll_id",
    "player_id",
    "player_name",
    "timestamp",
    "sequence",
    "dice_formula",
    "dice_type",
    "dice_count",
    "modifier",
    "advantage",
    "individual_results",
    "total",
    "hidden",
    "revealed",
    "permalink"
  ]
}
```

## ModeChange

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ModeChange",
  "description": "A record of a room mode change",
  "type": "object",
  "properties": {
    "timestamp": {
      "description": "Unix timestamp (ms) of the mode change",
      "type": "integer"
    },
    "from_mode": {
      "type": "string",
      "enum": ["open"]
    },
    "to_mode": {
      "type": "string",
      "enum": ["dm-led"]
    },
    "dm_player_id": {
      "description": "UUID of the newly designated DM",
      "type": "string",
      "format": "uuid"
    },
    "initiated_by": {
      "description": "player_id of the room creator",
      "type": "string",
      "format": "uuid"
    }
  },
  "required": [
    "timestamp",
    "from_mode",
    "to_mode",
    "dm_player_id",
    "initiated_by"
  ]
}
```
