#!/bin/sh
set -e

# Activate the virtual environment
. /home/appuser/app/.venv/bin/activate

# Execute the command passed to this script
exec "$@"
