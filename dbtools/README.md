# dbtools — (OpenCode, Kilo Code, Claude Code, Gemini CLI, Codex CLI, Antigravity, Cursor, etc.)

Este paquete contiene el agente **dbtools** (SQL Server Standard/Enterprise) en formatos portables. El preset original vive en el harness DSH (`~/.dsh/.agent-presets/dbtools`); lo que aquí se distribuye son sus partes reutilizables:

| Pieza | Formato | Portable |
|---|---|---|
| `skills/` (5 skills) | **Agent Skills** (`SKILL.md` con frontmatter `name`/`description`) | ✅ copiar y pegar |
| `agents/` (1 orquestador + 5 subagentes) | Markdown con frontmatter (`mode`, `description`, `permission`) | ✅ copiar según la tool |
| `orchestrator-prompt.md` | Prompt reutilizable (para `AGENTS.md`/rules) | ✅ copiar y pegar |

## Instalación One-Liner desde GitHub (sin clonar)

La forma más rápida de instalarlo sin descargar ni clonar el repositorio manualmente:

### 1. Con `npx` (Multiplataforma: Windows, Linux, macOS)
Requiere Node.js 16+:

```bash
# Instalación global en todas las tools
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

Si prefieres clonar el código en tu máquina:

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

Detalles: el instalador escribe la persona orquestadora como `CLAUDE.md` (Claude Code), `GEMINI.md` (Gemini CLI, solo proyecto) y `AGENTS.md` (Codex y Antigravity). Genera los agentes de **Claude Code con frontmatter propio** (formato YAML estricto, tools solo lectura, permiso `Agent` para el orquestador y `Skill` para subagentes); para **Codex CLI** genera el orquestador `dbtools.toml` y los 5 subagentes como archivos **TOML** en `.codex/agents/` con `sandbox_mode = "read-only"`. Para **Antigravity**, a nivel global empaqueta e instala un **Plugin nativo** en `~/.gemini/config/plugins/dbtools/` con su manifiesto `plugin.json`, sus 5 skills y las directivas en `rules/AGENTS.md` (auto-activado en `config.json`), y los agentes en `agents/{name}/agent.md`. Para OpenCode y Kilo Code usa los `agents/*.md` compartidos (frontmatter `mode`). Las skills de Codex y Antigravity en proyectos viven en el estándar abierto `.agents/skills/`. En modo desinstalación (`--uninstall`), elimina de forma segura y precisa únicamente los artefactos pertenecientes a dbtools preservando configuraciones y agentes de terceros.

---

## Estructura

```
dbtools/
├── README.md                     # instrucciones de instalación
├── install.js                    # instalador automático (Node.js, sin dependencias)
├── orchestrator-prompt.md        # persona orquestadora (reutilizable como regla/instrucción)
├── skills/                       # 5 skills en formato Agent Skills
│   ├── sql-server-developer/SKILL.md
│   ├── sql-server-administrator/SKILL.md
│   ├── sql-server-tuning/SKILL.md
│   ├── sql-server-audit-security/SKILL.md
│   └── sql-server-data-analyst/SKILL.md
└── agents/                       # 1 agente principal + 5 subagentes
    ├── dbtools.md
    ├── sql-server-developer.md
    ├── sql-server-administrator.md
    ├── sql-server-tuning.md
    ├── sql-server-audit-security.md
    └── sql-server-data-analyst.md
```

---

## 1) OpenCode

Las skills y los agentes se descubren desde el proyecto o de forma global.

**Skills** — copia `skills/` a cualquiera de estas rutas:
- Proyecto: `.opencode/skills/` (o `.claude/skills/`, `.agents/skills/`)
- Global: `~/.config/opencode/skills/` (Windows: `%USERPROFILE%\.config\opencode\skills\`)

**Agentes** — copia los `.md` de `agents/` a:
- Proyecto: `.opencode/agents/`
- Global: `~/.config/opencode/agents/`

```bash
# ejemplo (proyecto)
cp -r skills/*           .opencode/skills/
cp    agents/*.md        .opencode/agents/
```

Con esto:
- `dbtools` aparece como **primary agent** (cámbialo con Tab o con el selector).
- Los 5 subagentes se invocan automáticamente (por su `description`) o con `@sql-server-developer`, etc.
- Las skills se cargan con la herramienta `skill` cuando su `description` coincide.

Referencia: [OpenCode — Agents](https://opencode.ai/docs/agents/) · [OpenCode — Agent Skills](https://opencode.ai/docs/skills/)

---

## 2) Kilo Code

**Skills** — copia `skills/` a:
- Proyecto: `.kilo/skills/`
- Global: `~/.kilo/skills/` (Windows: `%USERPROFILE%\.kilo\skills\`)
- Compatibilidad: `.claude/skills/` o `.agents/skills/` también se leen.

**Agentes (modes)** — copia los `.md` de `agents/` a:
- Proyecto: `.kilo/agents/` (o `.kilo/agent/`, legacy `.kilocode/agents/`)
- Global: `~/.config/kilo/agent/`

```bash
# ejemplo (proyecto)
cp -r skills/*    .kilo/skills/
cp    agents/*.md .kilo/agents/
```

`dbtools` queda como agente `primary`; los 5 subagentes quedan como `mode: subagent` (se invocan con la herramienta `task`/delegación). Usa `/reload` o inicia sesión nueva para recargar.

Referencia: [Kilo Code — Custom Modes](https://kilo.ai/docs/customize/custom-modes) · [Kilo Code — Skills](https://kilo.ai/docs/customize/skills)

---

## 3) Otros programas

- **Claude Code**: skills → `.claude/skills/` (global `~/.claude/skills/`); subagentes y orquestador → `.claude/agents/*.md` (con frontmatter YAML estricto, tools de solo lectura, `Agent` para delegar y `Skill` para cargar runbooks).
- **Codex CLI**: skills → `.agents/skills/` (global `~/.agents/skills/`); orquestador y subagentes → `.codex/agents/*.toml` (`dbtools.toml` + 5 subagentes con `sandbox_mode = "read-only"`); persona y reglas → `AGENTS.md` (global `~/.codex/AGENTS.md`).
- **Antigravity**: a nivel global se instala como **Plugin** en `~/.gemini/config/plugins/dbtools/` (descubierto automáticamente por Desktop y CLI con `plugin.json`, `skills/` y `rules/AGENTS.md`); a nivel de workspace/proyecto skills → `.agents/skills/` y persona/reglas → `AGENTS.md`.
- **Cursor**: skills → `.cursor/skills/`; reglas → `.cursor/rules/` (pega el contenido de `orchestrator-prompt.md`); agentes → `.cursor/agents/`.
- **Cualquier tool con Agent Skills** (agentskills.io): las 5 `skills/` funcionan directamente.

Si la tool solo soporta **instrucciones/rules** (sin subagentes), pega `orchestrator-prompt.md` como `AGENTS.md` (OpenCode) o `.kilo/rules/dbtools.md` + `instructions` en `kilo.jsonc`, y el modelo "actuará" como el subagente elegido usando las skills.

---

## Conexión a SQL Server (solo lectura)

Estas tools conectan a la BD de dos formas:

1. **Shell (`sqlcmd`/`Invoke-Sqlcmd`)** — el agente ejecuta consultas de solo lectura:
   - `sqlcmd -S SRV\INSTANCIA,1433 -E -d Base -Q "SELECT @@VERSION;"`
   - `sqlcmd -S SRV,1433 -U usuario -P "***" -d Base -K ReadOnly -Q "SELECT ..."`
   - `Invoke-Sqlcmd -ServerInstance "SRV\INSTANCIA" -Database "Base" -Query "SELECT ..." -TrustServerCertificate`
2. **MCP de SQL Server** — configura un servidor MCP (p. ej. `mssql-mcp-server` o similar) en `opencode.json` / `kilo.jsonc` apuntando a una conexión de solo lectura.

**Regla inquebrantable (ya incluida en persona + skills + subagentes):** ningún agente crea/modifica/elimina objetos, elementos o datos. Solo `SELECT`, catálogo (`sys.*`) y DMVs (`sys.dm_*`). Los cambios se entregan como script para que el usuario los ejecute.

**Nota de seguridad:** la garantía técnica de solo lectura depende de las credenciales. Usa una cuenta con `db_datareader`/`SELECT` (o una réplica de solo lectura) y `ApplicationIntent=ReadOnly`. En OpenCode/Kilo puedes reforzar con `permission: { edit: deny }` (ya puesto en los subagentes) y opcionalmente `bash: ask`.
