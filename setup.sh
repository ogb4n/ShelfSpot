#!/usr/bin/env bash
# ==============================================================================
# ShelfSpot Setup Wizard
# ==============================================================================
set -e

# ── Colours ───────────────────────────────────────────────────────────────────
if [[ -t 1 ]]; then
  BOLD="\033[1m"; DIM="\033[2m"; RESET="\033[0m"
  CYAN="\033[36m"; GREEN="\033[32m"; YELLOW="\033[33m"; RED="\033[31m"; BLUE="\033[34m"
else
  BOLD=""; DIM=""; RESET=""; CYAN=""; GREEN=""; YELLOW=""; RED=""; BLUE=""
fi

banner()  { echo -e "\n${CYAN}${BOLD}$*${RESET}"; }
step()    { echo -e "\n${BLUE}${BOLD}▸ $*${RESET}"; }
info()    { echo -e "  ${DIM}$*${RESET}"; }
success() { echo -e "  ${GREEN}✓ $*${RESET}"; }
warn()    { echo -e "  ${YELLOW}⚠ $*${RESET}"; }
error()   { echo -e "\n${RED}${BOLD}✗ $*${RESET}" >&2; exit 1; }
ask()     { echo -e -n "  ${BOLD}$1${RESET} "; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default Postgres credentials, offered as the pre-filled answer in every
# prompt_default "Postgres ..." call below.
readonly DEFAULT_POSTGRES_USER="postgres"
readonly DEFAULT_POSTGRES_PASSWORD="password"
readonly DEFAULT_POSTGRES_DB="shelfspot"

# ── Non-interactive mode ─────────────────────────────────────────────────────
# --yes runs the wizard unattended: every prompt_default falls back to its
# default (itself overridable via environment variables, e.g. BACKEND_PORT),
# and every prompt_required must be satisfied by an environment variable or
# the script errors out instead of hanging on a `read` with no tty.
NONINTERACTIVE=false
CHOICE="${SHELFSPOT_INSTALL:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    -y|--yes)
      NONINTERACTIVE=true
      shift
      ;;
    --profile)
      CHOICE="$2"
      shift 2
      ;;
    -h|--help)
      cat <<'HELP'
Usage: setup.sh [--yes|-y] [--profile N]

  --yes, -y     Non-interactive install: use defaults/environment variables
                instead of prompting. Ports and Postgres credentials fall
                back to sane defaults, the JWT secret is auto-generated.
  --profile N   Install profile for --yes (defaults to 1):
                  1) Full suite   2) Backend stack
                  3) Frontend only (needs BACKEND_URL)
                  4) CLI only (needs SHELFSPOT_URL)
                  5) Custom (needs WANTS_DB/WANTS_BACKEND/WANTS_FRONTEND/
                     WANTS_CLI=true|false)

Recognised environment variables: BACKEND_PORT, FRONTEND_PORT, DB_PORT,
POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, RESEND_API_KEY,
RESEND_FROM_ADDRESS, ALERT_EMAIL_RECIPIENT, INSTALL_CLI (y/n),
BACKEND_URL, SHELFSPOT_URL.

Examples:
  ./setup.sh --yes
  BACKEND_PORT=9082 POSTGRES_PASSWORD="$(openssl rand -hex 24)" ./setup.sh --yes
HELP
      exit 0
      ;;
    *)
      error "Unknown argument: $1 (see --help)"
      ;;
  esac
done

# ── Helpers ───────────────────────────────────────────────────────────────────
require_cmd() {
  local cmd="$1" hint="$2"
  if ! command -v "$cmd" &>/dev/null; then
    error "$cmd is not installed. $hint"
  fi
}

require_node() {
  require_cmd node "Install Node.js v18+ from https://nodejs.org"
  local v; v=$(node -e "process.stdout.write(process.versions.node)")
  local major; major=$(echo "$v" | cut -d. -f1)
  [[ "$major" -ge 18 ]] || error "Node.js v18+ required (found v$v). Please upgrade."
  success "Node.js v$v"
}

require_docker() {
  require_cmd docker "Install Docker from https://docs.docker.com/get-docker/"
  docker info &>/dev/null || error "Docker daemon is not running. Please start Docker and re-run."
  require_cmd "docker" ""
  docker compose version &>/dev/null || error "Docker Compose v2 is required. Update Docker Desktop or install the plugin."
  success "Docker $(docker --version | grep -oP '\d+\.\d+\.\d+')"
}

gen_secret() {
  # 48 random hex bytes
  if command -v openssl &>/dev/null; then
    openssl rand -hex 48
  else
    tr -dc 'a-f0-9' < /dev/urandom | head -c 96
  fi
}

prompt_default() {
  # prompt_default "Question" "default"  → reads into $REPLY, falls back to default
  local question="$1" default="$2"
  if $NONINTERACTIVE; then
    REPLY="$default"
    info "${question}: ${REPLY}"
    return
  fi
  ask "${question} [${default}]:"
  read -r REPLY
  if [[ -z "$REPLY" ]]; then
    REPLY="$default"
  fi
}

prompt_required() {
  # prompt_required "Question" ["env fallback"]  → in --yes mode, the fallback
  # (an environment variable read by the caller) must be non-empty or the
  # script errors out instead of blocking on a `read` with no tty attached.
  local question="$1" env_value="${2:-}"
  if $NONINTERACTIVE; then
    [[ -n "$env_value" ]] || error "Non-interactive mode: no value for '${question}'. Set the matching environment variable and retry (see --help)."
    REPLY="$env_value"
    info "${question}: ${REPLY}"
    return
  fi
  while true; do
    ask "${question}:"
    read -r REPLY
    [[ -n "$REPLY" ]] && return
    warn "This field is required."
  done
}

wait_healthy() {
  local service="$1" max="${2:-60}" i=0
  step "Waiting for $service to be healthy…"
  while [[ $i -lt $max ]]; do
    local status
    status=$(docker inspect --format='{{.State.Health.Status}}' "shelfspot_${service}" 2>/dev/null || echo "missing")
    case "$status" in
      healthy) success "$service is healthy"; return 0 ;;
      missing|"") info "Container not yet started…" ;;
      *) info "Status: $status" ;;
    esac
    sleep 3; (( i+=3 ))
  done
  warn "$service did not report healthy within ${max}s. It may still be starting."
}

write_backend_env() {
  local file="$SCRIPT_DIR/backend/.env"
  cat > "$file" <<EOF
DATABASE_URL="${DATABASE_URL}"
JWT_SECRET="${JWT_SECRET}"
RESEND_API_KEY="${RESEND_API_KEY:-}"
RESEND_FROM_EMAIL="${RESEND_FROM_EMAIL:-ShelfSpot <noreply@shelfspot.local>}"
ALERT_EMAIL_RECIPIENT="${ALERT_EMAIL_RECIPIENT:-}"
EOF
  success "backend/.env written"
}

write_root_env() {
  local file="$SCRIPT_DIR/.env"
  cat > "$file" <<EOF
POSTGRES_USER=${POSTGRES_USER:-postgres}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-password}
POSTGRES_DB=${POSTGRES_DB:-shelfspot}
DB_PORT=${DB_PORT:-5432}
BACKEND_PORT=${BACKEND_PORT:-8082}
FRONTEND_PORT=${FRONTEND_PORT:-8083}
NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL:-}
EOF
  success ".env written"
}

install_cli() {
  local url="$1"
  local cli_dir="$SCRIPT_DIR/cli"
  [[ -d "$cli_dir" ]] || error "cli/ directory not found."

  step "Building CLI…"
  (cd "$cli_dir" && npm install --silent --ignore-scripts && npm run build --silent)
  success "CLI built"

  step "Installing shelfspot command globally…"
  tgz=$(cd "$cli_dir" && npm pack --silent 2>/dev/null | tail -1)
  npm install -g "$cli_dir/$tgz"
  rm -f "$cli_dir/$tgz"
  success "shelfspot command installed"

  # Persist SHELFSPOT_URL
  local export_line="export SHELFSPOT_URL=\"${url}\""
  local profiles=("$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.profile")
  for p in "${profiles[@]}"; do
    if [[ -f "$p" ]]; then
      sed -i '/^export SHELFSPOT_URL=/d' "$p" 2>/dev/null || true
      echo "$export_line" >> "$p"
      success "SHELFSPOT_URL written to $p"
    fi
  done
  export SHELFSPOT_URL="$url"

  step "Logging in to ShelfSpot…"
  shelfspot auth login
}

# ══════════════════════════════════════════════════════════════════════════════
# BANNER
# ══════════════════════════════════════════════════════════════════════════════
clear
echo -e "${CYAN}${BOLD}"
echo "  ╔══════════════════════════════════════╗"
echo "  ║        ShelfSpot Setup Wizard        ║"
echo "  ╚══════════════════════════════════════╝"
echo -e "${RESET}"
echo "  Inventory management — setup assistant"
echo ""

# ══════════════════════════════════════════════════════════════════════════════
# MAIN MENU
# ══════════════════════════════════════════════════════════════════════════════
echo -e "${BOLD}  What would you like to install?${RESET}"
echo ""
echo "    1)  Full suite       database + backend + frontend + CLI"
echo "    2)  Backend stack    database + backend API only"
echo "    3)  Frontend only    web app  (backend is hosted elsewhere)"
echo "    4)  CLI only         command-line tool, connects to an existing instance"
echo "    5)  Custom           pick individual components"
echo ""
if $NONINTERACTIVE; then
  CHOICE="${CHOICE:-1}"
  info "Non-interactive mode — installing profile ${CHOICE}"
else
  ask "Choice [1-5]:"
  read -r CHOICE
fi

# ══════════════════════════════════════════════════════════════════════════════
# OPTION 1 — FULL SUITE
# ══════════════════════════════════════════════════════════════════════════════
if [[ "$CHOICE" = "1" ]]; then
  banner "Full Suite Setup"
  require_docker
  require_node

  step "Configuring ports"
  prompt_default "Backend port"  "${BACKEND_PORT:-8082}"; BACKEND_PORT="$REPLY"
  prompt_default "Frontend port" "${FRONTEND_PORT:-8083}"; FRONTEND_PORT="$REPLY"
  prompt_default "Database port" "${DB_PORT:-5432}"; DB_PORT="$REPLY"

  step "Configuring database"
  prompt_default "Postgres user"     "${POSTGRES_USER:-$DEFAULT_POSTGRES_USER}"; POSTGRES_USER="$REPLY"
  prompt_default "Postgres password" "${POSTGRES_PASSWORD:-$DEFAULT_POSTGRES_PASSWORD}"; POSTGRES_PASSWORD="$REPLY"
  prompt_default "Postgres database" "${POSTGRES_DB:-$DEFAULT_POSTGRES_DB}"; POSTGRES_DB="$REPLY"

  DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}"
  JWT_SECRET=$(gen_secret)
  success "JWT secret generated"

  step "Email alerts (optional — press Enter to skip)"
  info "Used to send low-stock alert emails via Resend."
  if $NONINTERACTIVE; then
    [[ -n "$RESEND_API_KEY" ]] && info "Resend API key: set via environment" || info "Resend API key: skipped"
  else
    ask "Resend API key (leave blank to skip):"; read -r RESEND_API_KEY
  fi
  if [[ -n "$RESEND_API_KEY" ]]; then
    prompt_required "From email (e.g. alerts@yourdomain.com)" "$RESEND_FROM_ADDRESS"; RESEND_FROM_EMAIL="ShelfSpot <$REPLY>"
    prompt_required "Alert recipient email" "$ALERT_EMAIL_RECIPIENT"; ALERT_EMAIL_RECIPIENT="$REPLY"
  fi

  NEXT_PUBLIC_BACKEND_URL="http://localhost:${BACKEND_PORT}"

  write_backend_env
  write_root_env

  step "Building and starting containers (this may take a few minutes)…"
  cd "$SCRIPT_DIR"
  docker compose --profile full up -d --build

  wait_healthy "db"

  echo ""
  success "ShelfSpot is running!"
  info "  Backend:  http://localhost:${BACKEND_PORT}"
  info "  Frontend: http://localhost:${FRONTEND_PORT}"
  info "  Swagger:  http://localhost:${BACKEND_PORT}/api/swagger"

  echo ""
  if $NONINTERACTIVE; then
    INSTALL_CLI="${INSTALL_CLI:-n}"
    info "Install the CLI tool on this machine? ${INSTALL_CLI}"
  else
    ask "Install the CLI tool on this machine? [Y/n]:"
    read -r INSTALL_CLI
  fi
  if [[ "$INSTALL_CLI" =~ ^[Nn]$ ]]; then
    echo ""
    success "Setup complete."
  else
    install_cli "http://localhost:${BACKEND_PORT}"
    echo ""
    success "Setup complete. Run 'shelfspot --help' to get started."
  fi

# ══════════════════════════════════════════════════════════════════════════════
# OPTION 2 — BACKEND STACK
# ══════════════════════════════════════════════════════════════════════════════
elif [[ "$CHOICE" = "2" ]]; then
  banner "Backend Stack Setup"
  require_docker

  step "Configuring ports"
  prompt_default "Backend port"  "${BACKEND_PORT:-8082}"; BACKEND_PORT="$REPLY"
  prompt_default "Database port" "${DB_PORT:-5432}"; DB_PORT="$REPLY"

  step "Configuring database"
  prompt_default "Postgres user"     "${POSTGRES_USER:-$DEFAULT_POSTGRES_USER}"; POSTGRES_USER="$REPLY"
  prompt_default "Postgres password" "${POSTGRES_PASSWORD:-$DEFAULT_POSTGRES_PASSWORD}"; POSTGRES_PASSWORD="$REPLY"
  prompt_default "Postgres database" "${POSTGRES_DB:-$DEFAULT_POSTGRES_DB}"; POSTGRES_DB="$REPLY"

  DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}"
  JWT_SECRET=$(gen_secret)
  success "JWT secret generated"

  step "Email alerts (optional — press Enter to skip)"
  if $NONINTERACTIVE; then
    [[ -n "$RESEND_API_KEY" ]] && info "Resend API key: set via environment" || info "Resend API key: skipped"
  else
    ask "Resend API key (leave blank to skip):"; read -r RESEND_API_KEY
  fi
  if [[ -n "$RESEND_API_KEY" ]]; then
    prompt_required "From email" "$RESEND_FROM_ADDRESS"; RESEND_FROM_EMAIL="ShelfSpot <$REPLY>"
    prompt_required "Alert recipient email" "$ALERT_EMAIL_RECIPIENT"; ALERT_EMAIL_RECIPIENT="$REPLY"
  fi

  NEXT_PUBLIC_BACKEND_URL=""
  FRONTEND_PORT="8083"

  write_backend_env
  write_root_env

  step "Building and starting containers…"
  cd "$SCRIPT_DIR"
  docker compose --profile backend up -d --build

  wait_healthy "db"

  echo ""
  success "Backend is running!"
  info "  API:     http://localhost:${BACKEND_PORT}"
  info "  Swagger: http://localhost:${BACKEND_PORT}/api/swagger"

  echo ""
  if $NONINTERACTIVE; then
    INSTALL_CLI="${INSTALL_CLI:-n}"
    info "Install the CLI tool on this machine? ${INSTALL_CLI}"
  else
    ask "Install the CLI tool on this machine? [Y/n]:"
    read -r INSTALL_CLI
  fi
  if [[ ! "$INSTALL_CLI" =~ ^[Nn]$ ]]; then
    require_node
    install_cli "http://localhost:${BACKEND_PORT}"
  fi

  echo ""
  success "Setup complete."

# ══════════════════════════════════════════════════════════════════════════════
# OPTION 3 — FRONTEND ONLY
# ══════════════════════════════════════════════════════════════════════════════
elif [[ "$CHOICE" = "3" ]]; then
  banner "Frontend Setup"
  require_docker

  step "Backend connection"
  prompt_required "Backend URL (e.g. http://192.168.1.10:8082)" "$BACKEND_URL"
  BACKEND_URL="${REPLY%/}"

  step "Configuring port"
  prompt_default "Frontend port" "${FRONTEND_PORT:-8083}"; FRONTEND_PORT="$REPLY"

  POSTGRES_USER="$DEFAULT_POSTGRES_USER"; POSTGRES_PASSWORD="$DEFAULT_POSTGRES_PASSWORD"
  POSTGRES_DB="$DEFAULT_POSTGRES_DB"; DB_PORT="5432"; BACKEND_PORT="8082"
  DATABASE_URL=""; JWT_SECRET=""; RESEND_API_KEY=""
  NEXT_PUBLIC_BACKEND_URL="$BACKEND_URL"

  write_root_env

  # Write a minimal frontend .env for the build
  echo "NEXT_PUBLIC_BACKEND_URL=${BACKEND_URL}" > "$SCRIPT_DIR/frontend/.env.local"
  success "frontend/.env.local written"

  step "Building and starting frontend container…"
  cd "$SCRIPT_DIR"
  docker compose --profile frontend up -d --build

  echo ""
  success "Frontend is running at http://localhost:${FRONTEND_PORT}"
  info "  Connecting to backend: ${BACKEND_URL}"
  echo ""
  success "Setup complete."

# ══════════════════════════════════════════════════════════════════════════════
# OPTION 4 — CLI ONLY
# ══════════════════════════════════════════════════════════════════════════════
elif [[ "$CHOICE" = "4" ]]; then
  banner "CLI Setup"
  require_node

  step "ShelfSpot instance URL"
  echo ""
  info "Examples:  http://192.168.1.100:8082"
  info "           https://shelfspot.myhome.net"
  info "           http://localhost:8082"
  echo ""
  prompt_required "ShelfSpot URL" "$SHELFSPOT_URL"
  SHELFSPOT_URL="${REPLY%/}"

  step "Testing connection…"
  if curl -sf --max-time 5 "${SHELFSPOT_URL}/auth/profile" -o /dev/null 2>/dev/null || \
     curl -sf --max-time 5 "${SHELFSPOT_URL}" -o /dev/null 2>/dev/null; then
    success "ShelfSpot is reachable"
  else
    warn "Could not reach ${SHELFSPOT_URL}. Make sure the server is running."
    if $NONINTERACTIVE; then
      error "Non-interactive mode can't confirm 'continue anyway'. Verify the URL/server and retry."
    fi
    ask "Continue anyway? [y/N]:"
    read -r CONT
    [[ "$CONT" =~ ^[Yy]$ ]] || exit 0
  fi

  install_cli "$SHELFSPOT_URL"

  echo ""
  success "CLI ready. Run 'shelfspot --help' to get started."

# ══════════════════════════════════════════════════════════════════════════════
# OPTION 5 — CUSTOM
# ══════════════════════════════════════════════════════════════════════════════
elif [[ "$CHOICE" = "5" ]]; then
  banner "Custom Setup"
  echo ""
  echo "  Select the components to install (y/n for each):"
  echo ""

  if $NONINTERACTIVE; then
    # Environment toggles are true|false; translate to the y/n shape the
    # checks below expect. Database and backend default to on, CLI to off
    # (it mutates global npm state and shell rc files) — mirrors the
    # interactive defaults for options 1/2.
    DO_DB="y";       [[ "${WANTS_DB:-true}" == "false" ]] && DO_DB="n"
    DO_BACKEND="y";  [[ "${WANTS_BACKEND:-true}" == "false" ]] && DO_BACKEND="n"
    DO_FRONTEND="y"; [[ "${WANTS_FRONTEND:-true}" == "false" ]] && DO_FRONTEND="n"
    DO_CLI="n";      [[ "${WANTS_CLI:-false}" == "true" ]] && DO_CLI="y"
    info "Components — db:${DO_DB} backend:${DO_BACKEND} frontend:${DO_FRONTEND} cli:${DO_CLI}"
  else
    ask "Database (PostgreSQL via Docker)? [Y/n]:"; read -r DO_DB
    ask "Backend API (Docker)?             [Y/n]:"; read -r DO_BACKEND
    ask "Frontend web app (Docker)?        [Y/n]:"; read -r DO_FRONTEND
    ask "CLI tool?                         [Y/n]:"; read -r DO_CLI
  fi

  WANTS_DB=$([[ ! "$DO_DB" =~ ^[Nn]$ ]] && echo true || echo false)
  WANTS_BACKEND=$([[ ! "$DO_BACKEND" =~ ^[Nn]$ ]] && echo true || echo false)
  WANTS_FRONTEND=$([[ ! "$DO_FRONTEND" =~ ^[Nn]$ ]] && echo true || echo false)
  WANTS_CLI=$([[ ! "$DO_CLI" =~ ^[Nn]$ ]] && echo true || echo false)

  # Collect config only for what's needed
  NEEDS_DOCKER=false
  $WANTS_DB      && NEEDS_DOCKER=true
  $WANTS_BACKEND && NEEDS_DOCKER=true
  $WANTS_FRONTEND && NEEDS_DOCKER=true

  $NEEDS_DOCKER && require_docker
  $WANTS_CLI    && require_node

  POSTGRES_USER="$DEFAULT_POSTGRES_USER"; POSTGRES_PASSWORD="$DEFAULT_POSTGRES_PASSWORD"
  POSTGRES_DB="$DEFAULT_POSTGRES_DB";  DB_PORT="5432"
  BACKEND_PORT="8082"; FRONTEND_PORT="8083"
  DATABASE_URL="postgresql://postgres:password@db:5432/shelfspot"
  JWT_SECRET=""; RESEND_API_KEY=""; RESEND_FROM_EMAIL=""; ALERT_EMAIL_RECIPIENT=""
  NEXT_PUBLIC_BACKEND_URL=""

  if $WANTS_DB || $WANTS_BACKEND; then
    step "Configuring database"
    prompt_default "Postgres user"     "${POSTGRES_USER:-$DEFAULT_POSTGRES_USER}"; POSTGRES_USER="$REPLY"
    prompt_default "Postgres password" "${POSTGRES_PASSWORD:-$DEFAULT_POSTGRES_PASSWORD}"; POSTGRES_PASSWORD="$REPLY"
    prompt_default "Postgres database" "${POSTGRES_DB:-$DEFAULT_POSTGRES_DB}"; POSTGRES_DB="$REPLY"
    prompt_default "Database port"     "${DB_PORT:-5432}"; DB_PORT="$REPLY"
    DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}"
  fi

  if $WANTS_BACKEND; then
    prompt_default "Backend port" "${BACKEND_PORT:-8082}"; BACKEND_PORT="$REPLY"
    JWT_SECRET=$(gen_secret)
    success "JWT secret generated"
    if $NONINTERACTIVE; then
      [[ -n "$RESEND_API_KEY" ]] && info "Resend API key: set via environment" || info "Resend API key: skipped"
    else
      ask "Resend API key (leave blank to skip):"; read -r RESEND_API_KEY
    fi
    if [[ -n "$RESEND_API_KEY" ]]; then
      prompt_required "From email" "$RESEND_FROM_ADDRESS"; RESEND_FROM_EMAIL="ShelfSpot <$REPLY>"
      prompt_required "Alert recipient email" "$ALERT_EMAIL_RECIPIENT"; ALERT_EMAIL_RECIPIENT="$REPLY"
    fi
    write_backend_env
  fi

  if $WANTS_FRONTEND; then
    prompt_default "Frontend port" "${FRONTEND_PORT:-8083}"; FRONTEND_PORT="$REPLY"
    if ! $WANTS_BACKEND; then
      prompt_required "Backend URL (e.g. http://192.168.1.10:8082)" "$BACKEND_URL"
      NEXT_PUBLIC_BACKEND_URL="${REPLY%/}"
    else
      NEXT_PUBLIC_BACKEND_URL="http://localhost:${BACKEND_PORT}"
    fi
    echo "NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}" > "$SCRIPT_DIR/frontend/.env.local"
    success "frontend/.env.local written"
  fi

  write_root_env

  # Determine which Docker profiles to activate
  if $NEEDS_DOCKER; then
    PROFILES=()
    ($WANTS_DB || $WANTS_BACKEND) && PROFILES+=("backend")
    $WANTS_FRONTEND && PROFILES+=("frontend")

    PROFILE_ARGS=""
    for p in "${PROFILES[@]}"; do PROFILE_ARGS="$PROFILE_ARGS --profile $p"; done

    step "Starting selected containers…"
    cd "$SCRIPT_DIR"
    # shellcheck disable=SC2086
    docker compose $PROFILE_ARGS up -d --build

    ($WANTS_DB || $WANTS_BACKEND) && wait_healthy "db"
  fi

  if $WANTS_CLI; then
    if $WANTS_BACKEND; then
      CLI_URL="http://localhost:${BACKEND_PORT}"
    else
      echo ""
      prompt_required "ShelfSpot URL to connect the CLI to" "$SHELFSPOT_URL"
      CLI_URL="${REPLY%/}"
    fi
    install_cli "$CLI_URL"
  fi

  echo ""
  success "Custom setup complete."
  $WANTS_BACKEND  && info "  API:      http://localhost:${BACKEND_PORT}"
  $WANTS_FRONTEND && info "  Frontend: http://localhost:${FRONTEND_PORT}"

else
  error "Invalid choice: $CHOICE"
fi

echo ""
