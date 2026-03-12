#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

REMOTE_PORT="${REMOTE_PORT:-22}"
REMOTE_HOST="${REMOTE_HOST:-}"
REMOTE_USER="${REMOTE_USER:-}"
REMOTE_FRONTEND_TEST_DIR="${REMOTE_FRONTEND_TEST_DIR:-/home/TianduHiring/production/frontend/deploy}"
REMOTE_PASSWORD="${REMOTE_PASSWORD:-}"
FRONT_URL="${FRONT_URL:-https://interview.ycjp-work.com}"
API_URL="${API_URL:-https://interview.ycjp-work.com/api}"
PHONE="${PHONE:-}"
PASSWORD="${PASSWORD:-}"
TOKEN="${TOKEN:-}"
JOBSEEKER_POSITION_ID="${JOBSEEKER_POSITION_ID:-}"
EXPECTED_POSITION_NAME="${EXPECTED_POSITION_NAME:-}"
SKIP_DEPLOY="${SKIP_DEPLOY:-0}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --remote-host) REMOTE_HOST="$2"; shift 2 ;;
    --remote-user) REMOTE_USER="$2"; shift 2 ;;
    --remote-port) REMOTE_PORT="$2"; shift 2 ;;
    --remote-frontend-test-dir) REMOTE_FRONTEND_TEST_DIR="$2"; shift 2 ;;
    --remote-password) REMOTE_PASSWORD="$2"; shift 2 ;;
    --front-url) FRONT_URL="$2"; shift 2 ;;
    --api-url) API_URL="$2"; shift 2 ;;
    --phone) PHONE="$2"; shift 2 ;;
    --password) PASSWORD="$2"; shift 2 ;;
    --token) TOKEN="$2"; shift 2 ;;
    --jobseeker-position-id) JOBSEEKER_POSITION_ID="$2"; shift 2 ;;
    --expected-position-name) EXPECTED_POSITION_NAME="$2"; shift 2 ;;
    --skip-deploy) SKIP_DEPLOY=1; shift ;;
    *)
      echo "未知参数: $1" >&2
      exit 1
      ;;
  esac
done

if [[ -z "$JOBSEEKER_POSITION_ID" ]]; then
  echo "缺少 jobseeker position id，请传 --jobseeker-position-id 或设置 JOBSEEKER_POSITION_ID" >&2
  exit 1
fi

if [[ -z "$TOKEN" && ( -z "$PHONE" || -z "$PASSWORD" ) ]]; then
  echo "必须提供 TOKEN，或同时提供 PHONE/PASSWORD" >&2
  exit 1
fi

SSH_BASE=(ssh -p "$REMOTE_PORT" -o StrictHostKeyChecking=no)
RSYNC_RSH=(ssh -p "$REMOTE_PORT" -o StrictHostKeyChecking=no)

if [[ -n "$REMOTE_PASSWORD" ]]; then
  if ! command -v sshpass >/dev/null 2>&1; then
    echo "REMOTE_PASSWORD 已提供，但本机未安装 sshpass" >&2
    exit 1
  fi
  SSH_BASE=(sshpass -p "$REMOTE_PASSWORD" ssh -p "$REMOTE_PORT" -o StrictHostKeyChecking=no)
  RSYNC_RSH=(sshpass -p "$REMOTE_PASSWORD" ssh -p "$REMOTE_PORT" -o StrictHostKeyChecking=no)
fi

if [[ "$SKIP_DEPLOY" != "1" ]]; then
  if [[ -z "$REMOTE_HOST" || -z "$REMOTE_USER" || -z "$REMOTE_FRONTEND_TEST_DIR" ]]; then
    echo "未设置远端部署参数，必须提供 REMOTE_HOST / REMOTE_USER / REMOTE_FRONTEND_TEST_DIR 或使用 --skip-deploy" >&2
    exit 1
  fi

  cd "$ROOT_DIR"
  bash ./deploy.sh
  rsync -az --delete -e "${RSYNC_RSH[*]}" "$ROOT_DIR/deploy/" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_FRONTEND_TEST_DIR}/"
fi

CHECK_ARGS=(
  --front-url "$FRONT_URL"
  --api-url "$API_URL"
  --jobseeker-position-id "$JOBSEEKER_POSITION_ID"
)

if [[ -n "$EXPECTED_POSITION_NAME" ]]; then
  CHECK_ARGS+=(--expected-position-name "$EXPECTED_POSITION_NAME")
fi

if [[ -n "$TOKEN" ]]; then
  CHECK_ARGS+=(--token "$TOKEN")
else
  CHECK_ARGS+=(--phone "$PHONE" --password "$PASSWORD")
fi

cd "$ROOT_DIR"
node ./scripts/verify_prod_mock_interview_legacy.js "${CHECK_ARGS[@]}"
