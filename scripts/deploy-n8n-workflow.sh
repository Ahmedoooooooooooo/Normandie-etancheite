#!/usr/bin/env bash
# Cree ou met a jour un workflow n8n a partir d'un fichier JSON exporte.
#
# Usage :
#   N8N_API_KEY="..." ./scripts/deploy-n8n-workflow.sh n8n-workflow-get-appointments.json
#
# Necessite : curl, jq

set -euo pipefail

N8N_HOST="https://n8n.srv1591454.hstgr.cloud"
WORKFLOW_FILE="${1:?Usage: $0 <fichier-workflow.json>}"

if [ -z "${N8N_API_KEY:-}" ]; then
  echo "Erreur : variable d'environnement N8N_API_KEY non definie" >&2
  exit 1
fi

NAME=$(jq -r '.name' "$WORKFLOW_FILE")
BODY=$(jq '{name, nodes, connections, settings}' "$WORKFLOW_FILE")

EXISTING_ID=$(curl -s "$N8N_HOST/api/v1/workflows?limit=250" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  | jq -r --arg name "$NAME" '.data[] | select(.name == $name) | .id' | head -n1)

if [ -n "$EXISTING_ID" ]; then
  echo "Mise a jour du workflow existant '$NAME' (id=$EXISTING_ID)..."
  curl -s -X PUT "$N8N_HOST/api/v1/workflows/$EXISTING_ID" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$BODY" | jq '{id, name, updatedAt}'
else
  echo "Creation du workflow '$NAME'..."
  curl -s -X POST "$N8N_HOST/api/v1/workflows" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$BODY" | jq '{id, name, createdAt}'
fi
