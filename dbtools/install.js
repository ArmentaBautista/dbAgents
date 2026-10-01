#!/usr/bin/env node
'use strict';
/*
 * dbtools — instalador y desinstalador portable
 * Copia o elimina las skills y los agentes del paquete dbtools de las tools de IA:
 *   OpenCode, Kilo Code, Claude Code, Gemini CLI, Codex CLI y Antigravity.
 *
 * Uso:
 *   node install.js [target...] [opciones]
 *
 * targets:  opencode | kilocode | claude | gemini | codex | antigravity | all   (por defecto: all)
 * opciones:
 *   --global            instalar/desinstalar a nivel de usuario (por defecto)
 *   --project <dir>     instalar/desinstalar dentro de un proyecto
 *   --uninstall, -u     desinstalar skills, agentes y configuración de dbtools
 *   --dry-run           solo previsualizar, sin escribir ni borrar
 *   --no-overwrite      no sobrescribir archivos existentes (solo instalación)
 *   --help, -h          esta ayuda
 *
 * Ejemplos:
 *   node install.js                       # todo, global (instalar)
 *   node install.js --uninstall           # todo, global (desinstalar)
 *   node install.js codex -u              # solo Codex (desinstalar)
 *   node install.js opencode kilocode     # solo esas dos (instalar)
 *   node install.js --project .           # todo, en el proyecto actual
 *   node install.js --project . -u        # desinstalar del proyecto actual
 *   node install.js --dry-run             # previsualizar
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const BUNDLE_DIR = __dirname;
const SKILLS_SRC = path.join(BUNDLE_DIR, 'skills');
const AGENTS_SRC = path.join(BUNDLE_DIR, 'agents');
const PERSONA_SRC = path.join(BUNDLE_DIR, 'orchestrator-prompt.md');
const HOME = os.homedir();

const KNOWN_TARGETS = ['opencode', 'kilocode', 'claude', 'gemini', 'codex', 'antigravity'];

const KNOWN_DBTOOLS_SKILLS = [
  'dbtools',
  'sql-server-developer',
  'sql-server-administrator',
  'sql-server-tuning',
  'sql-server-audit-security',
  'sql-server-data-analyst',
];

const KNOWN_DBTOOLS_AGENTS = [
  'dbtools',
  'sql-server-developer',
  'sql-server-administrator',
  'sql-server-tuning',
  'sql-server-audit-security',
  'sql-server-data-analyst',
];

function getDbtoolsSkillNames() {
  const list = new Set(KNOWN_DBTOOLS_SKILLS);
  if (fs.existsSync(SKILLS_SRC)) {
    try {
      for (const entry of fs.readdirSync(SKILLS_SRC, { withFileTypes: true })) {
        if (entry.isDirectory()) list.add(entry.name);
      }
    } catch (_) {}
  }
  return Array.from(list);
}

function getDbtoolsAgentNames() {
  const list = new Set(KNOWN_DBTOOLS_AGENTS);
  if (fs.existsSync(AGENTS_SRC)) {
    try {
      for (const f of fs.readdirSync(AGENTS_SRC)) {
        if (f.endsWith('.md')) list.add(f.replace(/\.md$/, ''));
      }
    } catch (_) {}
  }
  return Array.from(list);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function usage() {
  console.log(`dbtools — instalador y desinstalador portable de skills y agentes SQL Server

Uso:
  node install.js [target...] [opciones]

targets:  opencode | kilocode | claude | gemini | codex | antigravity | all   (por defecto: all)

opciones:
  --global            instalar/desinstalar a nivel de usuario (por defecto)
  --project <dir>     instalar/desinstalar dentro de un proyecto
  --uninstall, -u     desinstalar skills, agentes y configuración de dbtools
  --dry-run           solo previsualizar, sin modificar ni borrar
  --no-overwrite      no sobrescribir archivos existentes (solo instalación)
  --help, -h          esta ayuda

Ejemplos:
  node install.js                       # instalar todo, global
  node install.js --uninstall           # desinstalar todo, global
  node install.js codex --uninstall     # desinstalar solo de Codex
  node install.js -u --dry-run          # previsualizar desinstalación
  node install.js --project .           # instalar en proyecto actual
  node install.js --project . -u        # desinstalar del proyecto actual
`);
}

function parseArgs(argv) {
  const opts = { targets: [], scope: 'global', projectDir: null, dryRun: false, overwrite: true, uninstall: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === 'all') opts.targets = KNOWN_TARGETS.slice();
    else if (a === 'uninstall' || a === '--uninstall' || a === '-u') opts.uninstall = true;
    else if (KNOWN_TARGETS.includes(a)) { if (!opts.targets.includes(a)) opts.targets.push(a); }
    else if (a === '--global') opts.scope = 'global';
    else if (a === '--project') { opts.scope = 'project'; opts.projectDir = path.resolve(argv[++i] || '.'); }
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--no-overwrite') opts.overwrite = false;
    else if (a === '--help' || a === '-h') { usage(); process.exit(0); }
    else { console.error('Argumento desconocido: ' + a); usage(); process.exit(2); }
  }
  if (opts.targets.length === 0) opts.targets = KNOWN_TARGETS.slice();
  return opts;
}

// ---------------------------------------------------------------------------
// Utilidades de copia
// ---------------------------------------------------------------------------
function ensureDir(dir) {
  if (!opts.dryRun) fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dst, overwrite) {
  if (!overwrite && fs.existsSync(dst)) return 'skip';
  if (opts.dryRun) return 'write';
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  return 'write';
}

function copyDirRecursive(src, dst, overwrite) {
  const results = [];
  if (!fs.existsSync(src)) return results;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) results.push(...copyDirRecursive(s, d, overwrite));
    else results.push([s, d, copyFile(s, d, overwrite)]);
  }
  return results;
}

// ---------------------------------------------------------------------------
// Frontmatter (para generar agentes Claude Code con formato propio)
// ---------------------------------------------------------------------------
function splitFrontmatter(text) {
  if (!text.startsWith('---')) return { frontmatter: '', body: text.trim() };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { frontmatter: '', body: text.trim() };
  return { frontmatter: text.slice(4, end).trim(), body: text.slice(end + 4).trim() };
}

function frontmatterField(fm, key) {
  const lines = fm.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(new RegExp('^' + key + ':\\s*(.*)$'));
    if (m) {
      const val = m[1].trim();
      if (val === '>-' || val === '>' || val === '|' || val === '|-') {
        const block = [];
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].startsWith('  ') || lines[j].startsWith('\t')) {
            block.push(lines[j].trim());
          } else if (lines[j].trim() === '') {
            block.push('');
          } else {
            break;
          }
        }
        return block.join(' ').trim();
      }
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        return val.slice(1, -1);
      }
      return val;
    }
  }
  return '';
}

// ---------------------------------------------------------------------------
// Definición de las tools
// ---------------------------------------------------------------------------
const TOOLS = {
  opencode: {
    label: 'OpenCode',
    skillsDir() {
      return opts.scope === 'project'
        ? path.join(opts.projectDir, '.opencode', 'skills')
        : path.join(HOME, '.config', 'opencode', 'skills');
    },
    agentsDir() {
      return opts.scope === 'project'
        ? path.join(opts.projectDir, '.opencode', 'agents')
        : path.join(HOME, '.config', 'opencode', 'agents');
    },
    hasAgents: true,
    claudeFormat: false,
    contextFile: null,
    reloadNote: 'Reinicia la sesión para recargar skills y agentes.',
  },
  kilocode: {
    label: 'Kilo Code',
    skillsDir() {
      return opts.scope === 'project'
        ? path.join(opts.projectDir, '.kilo', 'skills')
        : path.join(HOME, '.kilo', 'skills');
    },
    agentsDir() {
      return opts.scope === 'project'
        ? path.join(opts.projectDir, '.kilo', 'agents')
        : path.join(HOME, '.config', 'kilo', 'agent');
    },
    hasAgents: true,
    claudeFormat: false,
    contextFile: null,
    reloadNote: 'Usa /reload o inicia una sesión nueva.',
  },
  claude: {
    label: 'Claude Code',
    skillsDir() {
      return opts.scope === 'project'
        ? path.join(opts.projectDir, '.claude', 'skills')
        : path.join(HOME, '.claude', 'skills');
    },
    agentsDir() {
      return opts.scope === 'project'
        ? path.join(opts.projectDir, '.claude', 'agents')
        : path.join(HOME, '.claude', 'agents');
    },
    hasAgents: true,
    claudeFormat: true,
    // El "agente principal" de Claude es la memoria CLAUDE.md
    contextFile() {
      return opts.scope === 'project'
        ? path.join(opts.projectDir, 'CLAUDE.md')
        : path.join(HOME, '.claude', 'CLAUDE.md');
    },
    reloadNote: 'Reinicia Claude Code para recargar skills, agentes y CLAUDE.md.',
  },
  gemini: {
    label: 'Gemini CLI',
    skillsDir() {
      return opts.scope === 'project'
        ? path.join(opts.projectDir, '.gemini', 'skills')
        : path.join(HOME, '.gemini', 'skills');
    },
    agentsDir: null,
    hasAgents: false,
    claudeFormat: false,
    // Gemini no tiene subagentes nativos: la persona va en GEMINI.md (solo proyecto)
    contextFile() {
      return opts.scope === 'project' ? path.join(opts.projectDir, 'GEMINI.md') : null;
    },
    reloadNote: 'Verifica con /skills list y /memory reload.',
  },
  codex: {
    label: 'Codex CLI',
    // Codex usa el estándar abierto .agents/skills como ubicación nativa de skills
    // (también lo leen OpenCode/Gemini/Kilo en modo compatibilidad).
    skillsDir() {
      return opts.scope === 'project'
        ? path.join(opts.projectDir, '.agents', 'skills')
        : path.join(HOME, '.agents', 'skills');
    },
    // Subagentes de Codex = archivos TOML en .codex/agents/ (o ~/.codex/agents/).
    agentsDir() {
      return opts.scope === 'project'
        ? path.join(opts.projectDir, '.codex', 'agents')
        : path.join(HOME, '.codex', 'agents');
    },
    hasAgents: true,
    codexFormat: true,
    // El orquestador de Codex es el agente principal: la persona va en AGENTS.md
    // (auto-detectada) y delega en los subagentes TOML por nombre.
    contextFile() {
      return opts.scope === 'project'
        ? path.join(opts.projectDir, 'AGENTS.md')
        : path.join(HOME, '.codex', 'AGENTS.md');
    },
    reloadNote: 'Codex auto-detecta AGENTS.md y .codex/agents/*.toml; skills en .agents/skills.',
  },
  antigravity: {
    label: 'Antigravity (Google)',
    // Antigravity: en modo proyecto instala en .agents/skills/, .agents/agents/ y AGENTS.md.
    // A nivel global se instala como Plugin nativo en ~/.gemini/config/plugins/dbtools/
    // y los agentes en ~/.gemini/config/agents/{name}/agent.md.
    isPlugin: true,
    skillsDir() {
      return opts.scope === 'project'
        ? path.join(opts.projectDir, '.agents', 'skills')
        : path.join(HOME, '.gemini', 'config', 'plugins', 'dbtools', 'skills');
    },
    agentsDir() {
      return opts.scope === 'project'
        ? path.join(opts.projectDir, '.agents', 'agents')
        : path.join(HOME, '.gemini', 'config', 'agents');
    },
    hasAgents: true,
    antigravityFormat: true,
    codexFormat: false,
    claudeFormat: false,
    contextFile() {
      return opts.scope === 'project'
        ? path.join(opts.projectDir, 'AGENTS.md')
        : path.join(HOME, '.gemini', 'config', 'plugins', 'dbtools', 'rules', 'AGENTS.md');
    },
    reloadNote: 'Usa /agents o inicia una conversación para ver los agentes y skills.',
  },
};

// ---------------------------------------------------------------------------
// Instalación
// ---------------------------------------------------------------------------
function personaContent() {
  if (!fs.existsSync(PERSONA_SRC)) return '';
  return fs.readFileSync(PERSONA_SRC, 'utf8');
}

function getClaudeDesktopDirs() {
  const dirs = [];
  if (process.platform === 'win32') {
    if (process.env.APPDATA) {
      dirs.push(path.join(process.env.APPDATA, 'Claude'));
    }
    const localPackages = process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Packages') : null;
    if (localPackages && fs.existsSync(localPackages)) {
      try {
        for (const p of fs.readdirSync(localPackages)) {
          if (p.startsWith('Claude_')) {
            dirs.push(path.join(localPackages, p, 'LocalCache', 'Roaming', 'Claude'));
          }
        }
      } catch (_) {}
    }
  }
  return dirs;
}

function claudeAgentContent(name, content) {
  const { frontmatter, body } = splitFrontmatter(content);
  const description = frontmatterField(frontmatter, 'description');
  // En Claude Code / Desktop, el orquestador delega con 'Agent' y usa 'Skill'.
  // Los subagentes especialistas necesitan 'Skill' para sus runbooks.
  const toolsList = name === 'dbtools'
    ? ['Read', 'Grep', 'Glob', 'Bash', 'Agent', 'Skill', 'WebFetch', 'WebSearch']
    : ['Read', 'Grep', 'Glob', 'Bash', 'Skill', 'WebFetch', 'WebSearch'];
  const toolsYaml = toolsList.map((t) => `  - ${t}`).join('\n');
  const safeDesc = JSON.stringify(description);
  return [
    '---',
    `name: ${name}`,
    `description: ${safeDesc}`,
    'tools:',
    toolsYaml,
    '---',
    '',
    body,
    '',
  ].join('\n');
}

// Escapa un valor para una cadena básica TOML de una línea.
function tomlBasic(value) {
  return '"' + String(value)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '')
    .replace(/\n/g, '\\n') + '"';
}

// Codex: subagente TOML (name/description/sandbox read-only/developer_instructions).
function codexAgentContent(name, content) {
  const { frontmatter, body } = splitFrontmatter(content);
  const description = frontmatterField(frontmatter, 'description');
  return [
    `name = ${tomlBasic(name)}`,
    `description = ${tomlBasic(description)}`,
    'sandbox_mode = "read-only"',
    `developer_instructions = ${tomlBasic(body)}`,
    '',
  ].join('\n');
}

function installAntigravityPlugin() {
  if (opts.scope !== 'global') return;
  const pluginDir = path.join(HOME, '.gemini', 'config', 'plugins', 'dbtools');
  const manifestFile = path.join(pluginDir, 'plugin.json');
  const manifest = JSON.stringify({
    name: 'dbtools',
    version: '1.0.0',
    description: 'SQL Server Standard/Enterprise suite with 5 specialized skills and orchestrator persona'
  }, null, 2) + '\n';

  if (opts.overwrite || !fs.existsSync(manifestFile)) {
    if (opts.dryRun) {
      console.log(`  plugin manifest -> ${manifestFile}`);
    } else {
      fs.mkdirSync(pluginDir, { recursive: true });
      fs.writeFileSync(manifestFile, manifest);
      console.log(`  plugin manifest -> ${manifestFile}`);
    }
  }

  const configJsonPath = path.join(HOME, '.gemini', 'config', 'config.json');
  if (fs.existsSync(configJsonPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(configJsonPath, 'utf8'));
      if (!cfg.plugins) cfg.plugins = {};
      if (!cfg.plugins.dbtools || !cfg.plugins.dbtools.enabled) {
        cfg.plugins.dbtools = { enabled: true };
        if (opts.dryRun) {
          console.log(`  config.json -> habilitar plugin dbtools en ${configJsonPath}`);
        } else {
          fs.writeFileSync(configJsonPath, JSON.stringify(cfg, null, 2) + '\n');
          console.log(`  config.json -> habilitado plugin dbtools en ${configJsonPath}`);
        }
      }
    } catch (e) {
      console.log(`  [aviso] no se pudo actualizar config.json: ${e.message}`);
    }
  }
}

function installSkills(tool, toolId) {
  const dst = tool.skillsDir();
  if (!fs.existsSync(SKILLS_SRC)) {
    console.log(`  [aviso] no existe ${SKILLS_SRC}`);
    return 0;
  }
  const results = copyDirRecursive(SKILLS_SRC, dst, opts.overwrite);
  console.log(`  skills -> ${dst}  (${results.length} archivos)`);

  // Para Antigravity en modo global: copiar también a ~/.gemini/skills y ~/.gemini/antigravity-cli/skills
  if (toolId === 'antigravity' && opts.scope === 'global') {
    const sharedSkills = path.join(HOME, '.gemini', 'skills');
    copyDirRecursive(SKILLS_SRC, sharedSkills, opts.overwrite);
    const cliSkills = path.join(HOME, '.gemini', 'antigravity-cli', 'skills');
    if (fs.existsSync(path.join(HOME, '.gemini', 'antigravity-cli'))) {
      copyDirRecursive(SKILLS_SRC, cliSkills, opts.overwrite);
    }
  }

  // Para Claude en modo global: copiar también a las carpetas de Claude Desktop en Windows
  if (toolId === 'claude' && opts.scope === 'global') {
    for (const d of getClaudeDesktopDirs()) {
      const desktopSkills = path.join(d, 'skills');
      copyDirRecursive(SKILLS_SRC, desktopSkills, opts.overwrite);
      console.log(`  skills (Claude Desktop) -> ${desktopSkills}`);
    }
  }

  return results.length;
}

function installAgents(tool, toolId) {
  if (!tool.hasAgents) return 0;
  const dst = tool.agentsDir();
  if (!fs.existsSync(AGENTS_SRC)) {
    console.log(`  [aviso] no existe ${AGENTS_SRC}`);
    return 0;
  }
  let count = 0;
  for (const f of fs.readdirSync(AGENTS_SRC)) {
    if (!f.endsWith('.md')) continue;
    const src = path.join(AGENTS_SRC, f);
    const name = f.replace(/\.md$/, '');

    if (tool.antigravityFormat) {
      // En Antigravity los agentes se definen en agents/{name}/agent.md
      const agentFolder = path.join(dst, name);
      const agentFile = path.join(agentFolder, 'agent.md');
      if (!opts.overwrite && fs.existsSync(agentFile)) { count++; continue; }
      if (!opts.dryRun) {
        fs.mkdirSync(agentFolder, { recursive: true });
        const { frontmatter, body } = splitFrontmatter(fs.readFileSync(src, 'utf8'));
        const description = frontmatterField(frontmatter, 'description');
        const agentContent = [
          '---',
          `name: ${name}`,
          `description: ${JSON.stringify(description)}`,
          'mainAgent: true',
          'subagent: true',
          '---',
          '',
          `# ${name}`,
          '',
          body,
          '',
        ].join('\n');
        fs.writeFileSync(agentFile, agentContent);

        // Si es global y existe ~/.gemini/antigravity-cli, instalar también allí
        if (opts.scope === 'global' && fs.existsSync(path.join(HOME, '.gemini', 'antigravity-cli'))) {
          const cliAgentFolder = path.join(HOME, '.gemini', 'antigravity-cli', 'agents', name);
          fs.mkdirSync(cliAgentFolder, { recursive: true });
          fs.writeFileSync(path.join(cliAgentFolder, 'agent.md'), agentContent);
        }
      }
      count++;
      continue;
    }

    if (tool.codexFormat) {
      // Codex: subagentes y orquestador (dbtools) en formato TOML
      const outToml = path.join(dst, name + '.toml');
      if (!opts.overwrite && fs.existsSync(outToml)) { count++; continue; }
      if (!opts.dryRun) {
        fs.mkdirSync(dst, { recursive: true });
        fs.writeFileSync(outToml, codexAgentContent(name, fs.readFileSync(src, 'utf8')));
        // Crear alias sql-server-dbtools.toml para quien busque por prefijo sql-
        if (name === 'dbtools') {
          const aliasToml = path.join(dst, 'sql-server-dbtools.toml');
          fs.writeFileSync(aliasToml, codexAgentContent('sql-server-dbtools', fs.readFileSync(src, 'utf8')));
        }
      }
      count++;
      continue;
    }

    const out = path.join(dst, f);
    if (tool.claudeFormat) {
      // Escribir con frontmatter Claude (name/description/tools)
      if (!opts.overwrite && fs.existsSync(out)) continue;
      if (!opts.dryRun) {
        fs.mkdirSync(dst, { recursive: true });
        const agentContent = claudeAgentContent(name, fs.readFileSync(src, 'utf8'));
        fs.writeFileSync(out, agentContent);

        // Copiar también a Claude Desktop si existe
        if (opts.scope === 'global') {
          for (const d of getClaudeDesktopDirs()) {
            const dAgentDir = path.join(d, 'agents');
            fs.mkdirSync(dAgentDir, { recursive: true });
            fs.writeFileSync(path.join(dAgentDir, f), agentContent);
          }
        }
      }
    } else {
      copyFile(src, out, opts.overwrite);
    }
    count++;
  }

  // Activar multi_agent en ~/.codex/config.toml si es codex
  if (toolId === 'codex' && opts.scope === 'global') {
    const codexCfg = path.join(HOME, '.codex', 'config.toml');
    if (fs.existsSync(codexCfg) && !opts.dryRun) {
      try {
        let content = fs.readFileSync(codexCfg, 'utf8');
        if (!content.includes('multi_agent')) {
          if (content.includes('[features]')) {
            content = content.replace('[features]', '[features]\nmulti_agent = true');
          } else {
            content += '\n[features]\nmulti_agent = true\n';
          }
          fs.writeFileSync(codexCfg, content);
          console.log(`  config.toml -> habilitado multi_agent = true en ${codexCfg}`);
        }
      } catch (_) {}
    }
  }

  console.log(`  agents -> ${dst}  (${count} agentes)`);
  return count;
}

function installContext(tool, toolId) {
  if (typeof tool.contextFile !== 'function') return 0;
  const file = tool.contextFile();
  if (!file) return 0;
  const content = personaContent();
  if (!content) return 0;
  const block = `<!-- dbtools (instalado por dbtools-portable/install.js) -->\n\n${content}\n`;
  if (!opts.overwrite && fs.existsSync(file)) { console.log(`  contexto -> ${file}  (omitido, ya existe)`); return 0; }
  if (opts.dryRun) { console.log(`  contexto -> ${file}`); return 1; }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, block);
  console.log(`  contexto -> ${file}`);

  if (toolId === 'claude' && opts.scope === 'global') {
    for (const d of getClaudeDesktopDirs()) {
      const dContext = path.join(d, 'CLAUDE.md');
      fs.mkdirSync(path.dirname(dContext), { recursive: true });
      fs.writeFileSync(dContext, block);
      console.log(`  contexto (Claude Desktop) -> ${dContext}`);
    }
  }

  return 1;
}

function uninstallAntigravityPlugin() {
  if (opts.scope !== 'global') return;
  const pluginDir = path.join(HOME, '.gemini', 'config', 'plugins', 'dbtools');
  if (fs.existsSync(pluginDir)) {
    if (opts.dryRun) {
      console.log(`  plugin -> eliminar directorio ${pluginDir}`);
    } else {
      try {
        fs.rmSync(pluginDir, { recursive: true, force: true });
        console.log(`  plugin -> eliminado ${pluginDir}`);
      } catch (e) {
        console.log(`  [error] no se pudo eliminar ${pluginDir}: ${e.message}`);
      }
    }
  }

  const configJsonPath = path.join(HOME, '.gemini', 'config', 'config.json');
  if (fs.existsSync(configJsonPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(configJsonPath, 'utf8'));
      if (cfg.plugins && cfg.plugins.dbtools) {
        if (opts.dryRun) {
          console.log(`  config.json -> remover plugin dbtools de ${configJsonPath}`);
        } else {
          delete cfg.plugins.dbtools;
          fs.writeFileSync(configJsonPath, JSON.stringify(cfg, null, 2) + '\n');
          console.log(`  config.json -> removido plugin dbtools de ${configJsonPath}`);
        }
      }
    } catch (e) {
      console.log(`  [aviso] no se pudo actualizar config.json: ${e.message}`);
    }
  }
}

function uninstallSkills(tool, toolId) {
  const skillNames = getDbtoolsSkillNames();
  const dirs = [tool.skillsDir()];

  if (toolId === 'antigravity' && opts.scope === 'global') {
    dirs.push(path.join(HOME, '.gemini', 'skills'));
    const cliSkills = path.join(HOME, '.gemini', 'antigravity-cli', 'skills');
    if (fs.existsSync(cliSkills)) dirs.push(cliSkills);
  }

  if (toolId === 'claude' && opts.scope === 'global') {
    for (const d of getClaudeDesktopDirs()) {
      dirs.push(path.join(d, 'skills'));
    }
  }

  let count = 0;
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const name of skillNames) {
      const target = path.join(dir, name);
      if (fs.existsSync(target)) {
        if (opts.dryRun) {
          console.log(`  skills -> eliminar ${target}`);
        } else {
          try {
            fs.rmSync(target, { recursive: true, force: true });
            console.log(`  skills -> eliminado ${target}`);
          } catch (e) {
            console.log(`  [error] no se pudo eliminar ${target}: ${e.message}`);
          }
        }
        count++;
      }
    }
  }

  if (count === 0) {
    console.log(`  skills -> (ninguna skill de dbtools encontrada)`);
  }
  return count;
}

function uninstallAgents(tool, toolId) {
  if (!tool.hasAgents) return 0;
  const agentNames = getDbtoolsAgentNames();
  const dst = tool.agentsDir();
  let count = 0;

  if (tool.antigravityFormat) {
    const agentDirs = [dst];
    if (opts.scope === 'global') {
      const cliAgents = path.join(HOME, '.gemini', 'antigravity-cli', 'agents');
      if (fs.existsSync(cliAgents)) agentDirs.push(cliAgents);
    }

    for (const dir of agentDirs) {
      if (!fs.existsSync(dir)) continue;
      for (const name of agentNames) {
        const agentFolder = path.join(dir, name);
        if (fs.existsSync(agentFolder)) {
          if (opts.dryRun) {
            console.log(`  agents -> eliminar ${agentFolder}`);
          } else {
            try {
              fs.rmSync(agentFolder, { recursive: true, force: true });
              console.log(`  agents -> eliminado ${agentFolder}`);
            } catch (e) {
              console.log(`  [error] no se pudo eliminar ${agentFolder}: ${e.message}`);
            }
          }
          count++;
        }
      }
    }
  } else if (tool.codexFormat) {
    if (fs.existsSync(dst)) {
      const files = agentNames.map((n) => n + '.toml');
      files.push('sql-server-dbtools.toml');

      for (const f of files) {
        const target = path.join(dst, f);
        if (fs.existsSync(target)) {
          if (opts.dryRun) {
            console.log(`  agents -> eliminar ${target}`);
          } else {
            try {
              fs.rmSync(target, { force: true });
              console.log(`  agents -> eliminado ${target}`);
            } catch (e) {
              console.log(`  [error] no se pudo eliminar ${target}: ${e.message}`);
            }
          }
          count++;
        }
      }
    }
  } else {
    const agentDirs = [];
    if (fs.existsSync(dst)) agentDirs.push(dst);

    if (toolId === 'claude' && opts.scope === 'global') {
      for (const d of getClaudeDesktopDirs()) {
        const dAgentDir = path.join(d, 'agents');
        if (fs.existsSync(dAgentDir)) agentDirs.push(dAgentDir);
      }
    }

    for (const dir of agentDirs) {
      for (const name of agentNames) {
        const target = path.join(dir, name + '.md');
        if (fs.existsSync(target)) {
          if (opts.dryRun) {
            console.log(`  agents -> eliminar ${target}`);
          } else {
            try {
              fs.rmSync(target, { force: true });
              console.log(`  agents -> eliminado ${target}`);
            } catch (e) {
              console.log(`  [error] no se pudo eliminar ${target}: ${e.message}`);
            }
          }
          count++;
        }
      }
    }
  }

  if (count === 0) {
    console.log(`  agents -> (ningún agente de dbtools encontrado)`);
  }
  return count;
}

function uninstallContext(tool, toolId) {
  if (typeof tool.contextFile !== 'function') return 0;
  const file = tool.contextFile();
  let count = 0;

  const filesToCheck = [];
  if (file) filesToCheck.push(file);

  if (toolId === 'claude' && opts.scope === 'global') {
    for (const d of getClaudeDesktopDirs()) {
      filesToCheck.push(path.join(d, 'CLAUDE.md'));
    }
  }

  for (const f of filesToCheck) {
    if (!fs.existsSync(f)) continue;
    try {
      const content = fs.readFileSync(f, 'utf8');
      if (content.includes('<!-- dbtools')) {
        const cleaned = content.replace(/<!-- dbtools[\s\S]*?(?:$|(?=\n<!-- [^d]))/, '').trim();
        if (cleaned.length === 0) {
          if (opts.dryRun) {
            console.log(`  contexto -> eliminar ${f}`);
          } else {
            fs.rmSync(f, { force: true });
            console.log(`  contexto -> eliminado ${f}`);
          }
          count++;
        } else {
          if (opts.dryRun) {
            console.log(`  contexto -> limpiar bloque dbtools en ${f}`);
          } else {
            fs.writeFileSync(f, cleaned + '\n');
            console.log(`  contexto -> limpiado bloque dbtools en ${f}`);
          }
          count++;
        }
      }
    } catch (e) {
      console.log(`  [aviso] no se pudo procesar contexto ${f}: ${e.message}`);
    }
  }

  if (count === 0) {
    console.log(`  contexto -> (ningún archivo de contexto de dbtools encontrado)`);
  }
  return count;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
const opts = parseArgs(process.argv.slice(2));

console.log(`\ndbtools — ${opts.uninstall ? 'desinstalador' : 'instalador'} portable`);
console.log(`Alcance: ${opts.scope === 'project' ? `proyecto (${opts.projectDir})` : 'global (usuario ' + HOME + ')'}`);
console.log(`Modo:    ${opts.dryRun ? 'SIMULACIÓN (--dry-run)' : 'real'}`);
console.log(`Targets: ${opts.targets.map((t) => TOOLS[t].label).join(', ')}`);
console.log('');

if (opts.uninstall) {
  for (const id of opts.targets) {
    const tool = TOOLS[id];
    console.log(`== Desinstalando de ${tool.label} ==`);
    if (id === 'antigravity' && tool.isPlugin) {
      uninstallAntigravityPlugin();
    }
    uninstallSkills(tool, id);
    uninstallAgents(tool, id);
    uninstallContext(tool, id);
    console.log('');
  }
  console.log('Desinstalación finalizada.\n');
  process.exit(0);
}

for (const id of opts.targets) {
  const tool = TOOLS[id];
  console.log(`== ${tool.label} ==`);
  if (id === 'antigravity' && tool.isPlugin) {
    installAntigravityPlugin();
  }
  installSkills(tool, id);
  installAgents(tool, id);
  installContext(tool, id);
  console.log(`  (recarga: ${tool.reloadNote})`);
  console.log('');
}

console.log('Listo. Regla inquebrantable: solo lectura (SELECT + catálogo + DMVs).');
console.log('Usa cuentas de solo lectura (db_datareader/SELECT, ApplicationIntent=ReadOnly).\n');
