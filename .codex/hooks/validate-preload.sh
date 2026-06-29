#!/usr/bin/env bash
# Hook de pre-execucao para Codex: bloqueia edicao sem preload de governanca.
#
# Entrada: JSON do tool use via stdin.
#
# Modos (via variavel de ambiente GOVERNANCE_PRELOAD_MODE):
#   fail  — emite lembrete em stderr, exit 1 (bloqueia a edicao) [DEFAULT]
#   warn  — emite lembrete em stderr, exit 0 (nao bloqueia, opt-out explicito)
#
# Unlock: exportar GOVERNANCE_PRELOAD_CONFIRMED=1 na sessao atual.
# Consulte AGENTS.md para o contrato de carga base.

set -euo pipefail

GOVERNANCE_PRELOAD_MODE="${GOVERNANCE_PRELOAD_MODE:-fail}"
GOVERNANCE_PRELOAD_CONFIRMED="${GOVERNANCE_PRELOAD_CONFIRMED:-0}"

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=../../scripts/lib/parse-hook-input.sh
source "$HOOK_DIR/../../scripts/lib/parse-hook-input.sh" 2>/dev/null \
  || source "$(cd "$HOOK_DIR/../.." && pwd)/scripts/lib/parse-hook-input.sh" 2>/dev/null \
  || { echo "AVISO: parse-hook-input.sh nao encontrado" >&2; exit 0; }

_stdin="$(cat)"
file_path="$(printf '%s' "$_stdin" | parse_file_path)"

case "$file_path" in
  *.go|*.py|*.ts|*.js|*.tsx|*.jsx)
    echo "LEMBRETE: antes de editar codigo, confirme que AGENTS.md e agent-governance/SKILL.md foram lidos nesta sessao." >&2

    if [[ "$GOVERNANCE_PRELOAD_CONFIRMED" == "1" ]]; then
      exit 0
    fi

    if [[ "$GOVERNANCE_PRELOAD_MODE" == "fail" ]]; then
      echo "GOVERNANCE_PRELOAD_MODE=fail: bloqueando edicao ate que o contrato de carga seja confirmado." >&2
      echo "Para prosseguir: export GOVERNANCE_PRELOAD_CONFIRMED=1" >&2
      exit 1
    fi
    ;;
esac

exit 0
