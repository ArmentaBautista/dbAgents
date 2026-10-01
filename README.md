# dbAgents — Orquestador de Agentes y Skills SQL Server

Suite portable de agentes y skills especializadas en Microsoft SQL Server (Standard/Enterprise) para herramientas de IA como **OpenCode, Kilo Code, Claude Code, Gemini CLI, Codex CLI y Google Antigravity**.

Opera bajo una **política estricta de solo lectura** (diagnóstico, catálogo, DMVs y consultas SELECT).

| Pieza | Formato | Portable |
|---|---|---|
| `skills/` (6 skills: 1 orquestador + 5 subagentes) | **Agent Skills** (`SKILL.md` con frontmatter `name`/`description`) | ✅ copiar y pegar |
| `agents/` (1 orquestador + 5 subagentes) | Markdown con frontmatter (`mode`, `description`, `permission`) | ✅ copiar según la tool |
| `orchestrator-prompt.md` | Prompt reutilizable (para `AGENTS.md`/rules) | ✅ copiar y pegar |

---

## Requisitos antes de instalar

Asegurese de contar con Node, Npm y Git instalados antes de intentar instalar el Agente/Skills
En caso de que no cuenta con ellos, siga los pasos a continuación, en caso contrario, dirijase al apartado de Instalación.

1. NodeJS. Abra una terminal: 
``` ps1 
# Ejecute el siguiente comando que descargará el instalador gráfico, siga las indicaciones del mismo.
winget install OpenJS.NodeJS.LTS --source winget


# Valide que la instalación fue correcta
node -v
npm -v

# Si puede ver el número de versión de ambos, continue con el paso 2
```
2. GIT. En una terminal:
``` ps1 
# Ejecute el siguiente comando que descargará el instalador gráfico, siga las indicaciones del mismo.
winget install Git.Git --source winget

# Valide que la instalación fue correcta
git --version

# Si puede ver el número de versión continue con las instalación del Agente/Skills

# Es posible que al ejecutar npx en powershell tenga un error debido a la política de bloqueo de scripts
# en ese caso puede abrir una terminal como administrador y ejecutar:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

```

## Instalación One-Liner desde GitHub (sin clonar)

La forma más rápida de instalarlo sin descargar ni clonar el repositorio manualmente:

### 1. Con `npx` (Recomendado — Windows, Linux, macOS)
Requiere Node.js 16+:

```bash
# Instalación global en todas las tools soportadas
npx github:ArmentaBautista/dbAgents

# Solo para herramientas específicas
npx github:ArmentaBautista/dbAgents opencode kilocode
npx github:ArmentaBautista/dbAgents codex antigravity

# En el directorio del proyecto actual
npx github:ArmentaBautista/dbAgents --project .

# Simulación previa (dry-run)
npx github:ArmentaBautista/dbAgents --dry-run

# Desinstalación limpia
npx github:ArmentaBautista/dbAgents --uninstall
```

### 2. Con PowerShell (Windows)
```powershell
# Instalación global
irm https://raw.githubusercontent.com/ArmentaBautista/dbAgents/main/install.ps1 | iex

# O pasando opciones específicas
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/ArmentaBautista/dbAgents/main/install.ps1))) opencode kilocode
```

### 3. Con Bash (Linux / macOS)
```bash
# Instalación global
curl -fsSL https://raw.githubusercontent.com/ArmentaBautista/dbAgents/main/install.sh | bash

# O pasando opciones específicas
curl -fsSL https://raw.githubusercontent.com/ArmentaBautista/dbAgents/main/install.sh | bash -s -- opencode kilocode
```

---

## Instalador manual (clonando el repositorio)

```bash
git clone https://github.com/ArmentaBautista/dbAgents.git
cd dbAgents/dbtools

# Instalación
node install.js                        # todo, global (usuario)
node install.js opencode kilocode      # solo esas dos
node install.js codex antigravity      # Codex CLI y Antigravity
node install.js --project .            # todo, dentro del proyecto actual
node install.js --dry-run              # previsualizar sin escribir
node install.js --no-overwrite         # no sobrescribir archivos existentes

# Desinstalación
node install.js --uninstall            # desinstalar todo a nivel global
node install.js -u --dry-run           # previsualizar qué se desinstalaría
node install.js codex --uninstall      # desinstalar solo de Codex
node install.js --project . -u         # desinstalar del proyecto actual
```

| Flag | Efecto |
|---|---|
| `--global` (por defecto) | instala/desinstala en la carpeta de usuario de cada tool (OpenCode `~/.config/opencode`, Kilo `~/.kilo`, Claude `~/.claude` + Desktop, Gemini `~/.gemini`, Codex `~/.codex` + `~/.agents`, Antigravity Plugin `~/.gemini/config/plugins/dbtools` + `~/.gemini/config/agents`) |
| `--project <dir>` | instala/desinstala dentro de un proyecto (`.opencode/`, `.kilo/`, `.claude/`, `.gemini/`, `.agents/` + `.codex/`, y `AGENTS.md`/`CLAUDE.md` según la tool) |
| `--uninstall`, `-u` | desinstala las skills, agentes, plugins y contextos creados por dbtools sin tocar otros agentes del usuario |
| `--dry-run` | muestra qué haría sin escribir ni borrar nada |
| `--no-overwrite` | no pisa archivos existentes (solo aplica a instalación) |

---

## Estructura

```
dbAgents/
├── package.json                  # soporte npx github:ArmentaBautista/dbAgents
├── install.ps1                   # instalador one-liner PowerShell
├── install.sh                    # instalador one-liner Bash
├── README.md                     # documentación general
└── dbtools/
    ├── install.js                # motor instalador (Node.js, sin dependencias)
    ├── orchestrator-prompt.md    # persona orquestadora
    ├── skills/                   # 6 skills en formato Agent Skills
    │   ├── dbtools/SKILL.md      # orquestador ejecutable como skill
    │   ├── sql-server-developer/SKILL.md
    │   ├── sql-server-administrator/SKILL.md
    │   ├── sql-server-tuning/SKILL.md
    │   ├── sql-server-audit-security/SKILL.md
    │   └── sql-server-data-analyst/SKILL.md
    └── agents/                   # 1 agente principal + 5 subagentes
        ├── dbtools.md
        ├── sql-server-developer.md
        ├── sql-server-administrator.md
        ├── sql-server-tuning.md
        ├── sql-server-audit-security.md
        └── sql-server-data-analyst.md
```

---

## Conexión a SQL Server (solo lectura)

Estas tools conectan a la BD de dos formas:

1. **Shell (`sqlcmd`/`Invoke-Sqlcmd`)** — el agente ejecuta consultas de solo lectura:
   - `sqlcmd -S SRV\INSTANCIA,1433 -E -d Base -Q "SELECT @@VERSION;"`
   - `sqlcmd -S SRV,1433 -U usuario -P "***" -d Base -K ReadOnly -Q "SELECT ..."`
   - `Invoke-Sqlcmd -ServerInstance "SRV\INSTANCIA" -Database "Base" -Query "SELECT ..." -TrustServerCertificate`
2. **MCP de SQL Server** — configura un servidor MCP apuntando a una conexión de solo lectura.

**Regla inquebrantable:** ningún agente crea/modifica/elimina objetos, elementos o datos. Solo `SELECT`, catálogo (`sys.*`) y DMVs (`sys.dm_*`). Los cambios se entregan como script para que el usuario los ejecute.


