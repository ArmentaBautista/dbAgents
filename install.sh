#!/usr/bin/env bash
# dbtools — Script instalador one-liner para Bash (Linux / macOS)
# Uso:
#   curl -fsSL https://raw.githubusercontent.com/ArmentaBautista/dbAgents/main/install.sh | bash
# O con argumentos:
#   curl -fsSL https://raw.githubusercontent.com/ArmentaBautista/dbAgents/main/install.sh | bash -s -- opencode kilocode

set -e

if ! command -v node >/dev/null 2>&1; then
    echo -e "\033[0;31m[ERROR] Node.js no está instalado o no se encuentra en el PATH.\033[0m"
    echo -e "\033[0;33mPor favor instala Node.js (v16+) desde https://nodejs.org/\033[0m"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" >/dev/null 2>&1 && pwd)"
if [ -f "$SCRIPT_DIR/dbtools/install.js" ]; then
    node "$SCRIPT_DIR/dbtools/install.js" "$@"
    exit $?
elif [ -f "$SCRIPT_DIR/install.js" ]; then
    node "$SCRIPT_DIR/install.js" "$@"
    exit $?
fi

TMP_DIR=$(mktemp -d -t dbagents-XXXXXX)
cleanup() {
    rm -rf "$TMP_DIR"
}
trap cleanup EXIT

REPO_URL="${DBTOOLS_REPO:-https://github.com/ArmentaBautista/dbAgents/archive/refs/heads/main.tar.gz}"

echo -e "\033[0;36mDescargando dbAgents...\033[0m"
curl -fsSL "$REPO_URL" | tar -xz -C "$TMP_DIR"

INSTALL_JS=$(find "$TMP_DIR" -name "install.js" | head -n 1)

if [ -z "$INSTALL_JS" ]; then
    echo -e "\033[0;31m[ERROR] No se encontró install.js en el paquete descargado.\033[0m"
    exit 1
fi

echo -e "\033[0;32mEjecutando instalador dbtools...\033[0m"
node "$INSTALL_JS" "$@"
