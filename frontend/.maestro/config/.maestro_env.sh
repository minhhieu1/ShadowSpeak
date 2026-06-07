#!/bin/bash
# =============================================================================
# Maestro Environment Setup
# =============================================================================
# Source this file before running Maestro tests in CI or local env.
#
# Usage:
#   source .maestro/config/.maestro_env.sh
#   source .maestro/config/.maestro_env.sh production
#
# =============================================================================

set -euo pipefail

ENV="${1:-dev}"

echo "🔧 Setting up Maestro environment: $ENV"

# App Configuration
export MAESTRO_APP_ID="com.shadowspeak.app"
export MAESTRO_APP_NAME="ShadowSpeak"

# Platform
export MAESTRO_PLATFORM="${MAESTRO_PLATFORM:-ios}"

# Default timeouts
export MAESTRO_LAUNCH_TIMEOUT_MS="${MAESTRO_LAUNCH_TIMEOUT_MS:-30000}"
export MAESTRO_ELEMENT_TIMEOUT_MS="${MAESTRO_ELEMENT_TIMEOUT_MS:-10000}"

# Environment URLs
case "$ENV" in
  dev)
    export MAESTRO_BASE_URL="http://localhost:3000"
    export MAESTRO_API_URL="http://localhost:8080"
    export MAESTRO_OIDC_ISSUER="http://localhost:8080/realms/shadowspeak"
    ;;
  staging)
    export MAESTRO_BASE_URL="https://staging.shadowspeak.app"
    export MAESTRO_API_URL="https://api.staging.shadowspeak.app"
    export MAESTRO_OIDC_ISSUER="https://auth.staging.shadowspeak.app/realms/shadowspeak"
    ;;
  production)
    export MAESTRO_BASE_URL="https://shadowspeak.app"
    export MAESTRO_API_URL="https://api.shadowspeak.app"
    export MAESTRO_OIDC_ISSUER="https://auth.shadowspeak.app/realms/shadowspeak"
    ;;
  *)
    echo "⚠️  Unknown environment: $ENV. Falling back to dev."
    export MAESTRO_BASE_URL="http://localhost:3000"
    export MAESTRO_API_URL="http://localhost:8080"
    ;;
esac

# Build paths
export MAESTRO_IOS_BUILD_PATH="./ios/build/Build/Products/Debug-iphonesimulator/ShadowSpeak.app"
export MAESTRO_ANDROID_BUILD_PATH="./android/app/build/outputs/apk/debug/app-debug.apk"

# Android signing (placeholder - set these in CI secrets)
export MAESTRO_ANDROID_KEYSTORE_PATH="${MAESTRO_ANDROID_KEYSTORE_PATH:-}"
export MAESTRO_ANDROID_KEYSTORE_PASSWORD="${MAESTRO_ANDROID_KEYSTORE_PASSWORD:-}"
export MAESTRO_ANDROID_KEY_ALIAS="${MAESTRO_ANDROID_KEY_ALIAS:-}"
export MAESTRO_ANDROID_KEY_PASSWORD="${MAESTRO_ANDROID_KEY_PASSWORD:-}"

# Analytics
export MAESTRO_CLI_NO_ANALYTICS="true"
export MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED="true"

echo "✅ Maestro environment configured for: $ENV"
echo "   Platform:    $MAESTRO_PLATFORM"
echo "   App ID:      $MAESTRO_APP_ID"
echo "   Base URL:    $MAESTRO_BASE_URL"
echo "   API URL:     $MAESTRO_API_URL"
