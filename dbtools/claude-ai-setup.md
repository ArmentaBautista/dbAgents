# dbtools en Claude.ai / app de escritorio

Claude.ai y la app de escritorio **NO leen archivos locales** (`~/.claude/`, `.claude/`, etc. son solo para Claude Code CLI). La forma de usarlos con dbtools es un **Project** de Claude.ai:

## 1) Crear un Project

En claude.ai → Projects → **Create project** → nombre p. ej. `dbtools (SQL Server)`.

## 2) Instrucciones del proyecto

En la pestaña del proyecto, pega el contenido de **`orchestrator-prompt.md`** en *Custom instructions* (o *Instructions*). Ese texto hace que el modelo actúe como el orquestador `dbtools`: pregunta qué subagente usar, pregunta por la conexión de solo lectura y aplica la regla inquebrantable.

## 3) Skills como conocimiento

Sube los 5 `SKILL.md` como archivos del proyecto (sección *Knowledge*):

- `skills/sql-server-developer/SKILL.md`
- `skills/sql-server-administrator/SKILL.md`
- `skills/sql-server-tuning/SKILL.md`
- `skills/sql-server-audit-security/SKILL.md`
- `skills/sql-server-data-analyst/SKILL.md`

Claude.ai los tendrá disponibles y los usará cuando la tarea corresponda al rol.

## 4) Uso

No hay subagentes nativos en Claude.ai: el modelo **asume el rol** que le pidas siguiendo su skill.

- *"Actúa como el subagente tuning y analiza este plan de ejecución."*
- *"Usa la skill sql-server-audit-security para revisar estos permisos."*

## Alternativa sin Project (chat suelto)

Pega el contenido de `orchestrator-prompt.md` al inicio de la conversación y, cuando la tarea lo pida, pega o adjunta la `SKILL.md` del rol correspondiente.

## Recordatorio

- Conecta solo con cuenta de solo lectura (`db_datareader`/`SELECT`, `ApplicationIntent=ReadOnly`); claude.ai no puede ejecutar `sqlcmd` por sí mismo, así que los `SELECT` los ejecutas tú y le pasas los resultados, o le das los archivos/scripts para que analice.
