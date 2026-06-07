#!/bin/bash
# maestro-ios.sh
# Kills old Metro, starts fresh with cleared cache, runs Maestro tests.

set -e

echo "=== Killing old Metro server ==="
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

echo "=== Starting Metro with cleared cache ==="
npx expo start --clear --ios &
METRO_PID=$!

# Wait for Metro to be ready
echo "=== Waiting for Metro to be ready ==="
for i in $(seq 1 30); do
  if curl -s http://localhost:8081/status 2>/dev/null | grep -q "packager-status:running"; then
    echo "Metro is ready!"
    break
  fi
  sleep 1
done

echo "=== Running Maestro tests ==="
npx maestro test --format junit --output reports/maestro/maestro-report.xml .maestro

echo "=== Cleaning up ==="
kill $METRO_PID 2>/dev/null || true
