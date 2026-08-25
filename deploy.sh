#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/deploy.env"
LOG_FILE="${SCRIPT_DIR}/deploy.log"

export AWS_PAGER=""

fail() {
  local message="$1"
  {
    echo "=== Deploy failed at $(date -u +"%Y-%m-%dT%H:%M:%SZ") ==="
    echo "$message"
    if [[ -n "${2:-}" ]]; then
      echo
      echo "$2"
    fi
  } > "$LOG_FILE"
  echo "Deploy failed. Details written to ${LOG_FILE}" >&2
  exit 1
}

if [[ ! -f "$ENV_FILE" ]]; then
  fail "Missing ${ENV_FILE}. Create deploy.env with AWS and S3 settings."
fi

set -a
# Strip Windows CRLF so sourced values are not polluted by \r
# shellcheck disable=SC1090
source <(tr -d '\r' < "$ENV_FILE")
set +a

required_vars=(
  AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY
  AWS_REGION
  DEPLOY_FOLDER
  S3_BUCKET_NAME
  S3_FOLDER
)

for var in "${required_vars[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    fail "Missing required variable ${var} in deploy.env"
  fi
done

if ! command -v aws >/dev/null 2>&1; then
  fail "AWS CLI (aws) is not installed or not on PATH."
fi

DEPLOY_FOLDER="${DEPLOY_FOLDER%/}"
if [[ "$DEPLOY_FOLDER" != /* ]]; then
  DEPLOY_FOLDER="${SCRIPT_DIR}/${DEPLOY_FOLDER#./}"
fi

if [[ ! -d "$DEPLOY_FOLDER" ]]; then
  fail "DEPLOY_FOLDER does not exist: ${DEPLOY_FOLDER}"
fi

if [[ -z "$(ls -A "$DEPLOY_FOLDER" 2>/dev/null)" ]]; then
  fail "DEPLOY_FOLDER is empty: ${DEPLOY_FOLDER}"
fi

S3_FOLDER="${S3_FOLDER#/}"
S3_FOLDER="${S3_FOLDER%/}"
S3_URI="s3://${S3_BUCKET_NAME}/${S3_FOLDER}/"

export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_DEFAULT_REGION="${AWS_REGION}"
export AWS_REGION

echo "Source:      ${DEPLOY_FOLDER}"
echo "Destination: ${S3_URI}"
echo "Region:      ${AWS_REGION}"
echo "This will upload new/changed files and delete remote files that are not in the local folder."
echo
read -r -p "Deploy now? [y/N] " confirm
case "$confirm" in
  y|Y|yes|YES) ;;
  *)
    echo "Deploy cancelled."
    exit 0
    ;;
esac

echo
echo "Uploading..."

set +e
sync_output="$(aws s3 sync "$DEPLOY_FOLDER" "$S3_URI" --delete --no-progress 2>&1)"
sync_status=$?
set -e

if [[ $sync_status -ne 0 ]]; then
  fail "aws s3 sync exited with status ${sync_status}" "$sync_output"
fi

if [[ -f "$LOG_FILE" ]]; then
  rm -f "$LOG_FILE"
fi

echo "$sync_output"
echo
echo "Deploy complete: ${S3_URI}"
