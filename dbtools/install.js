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
const ROOT_DIR = path.resolve(BUNDLE_DIR, '..');
const HOME = os.homedir();

const KNOWN_TARGETS = ['opencode', 'kilocode', 'claude', 'gemini', 'codex', 'antigravity', 'copilot'];
const KNOWN_SUITES = ['dbtools', 'softarch', 'all'];

const SUITES = {
  dbtools: {
    name: 'dbtools',
    label: 'dbtools (SQL Server Suite)',
    skillsDir: path.join(BUNDLE_DIR, 'skills'),
    agentsDir: path.join(BUNDLE_DIR, 'agents'),
    personaFile: path.join(BUNDLE_DIR, 'orchestrator-prompt.md'),
    pluginName: 'dbtools',
    pluginDesc: 'SQL Server Standard/Enterprise suite with 5 specialized skills and orchestrator persona',
    knownSkills: [
      'dbtools',
      'sql-server-developer',
      'sql-server-administrator',
      'sql-server-tuning',
      'sql-server-audit-security',
      'sql-server-data-analyst',
    ],
    knownAgents: [
      'dbtools',
      'sql-server-developer',
      'sql-server-administrator',
      'sql-server-tuning',
      'sql-server-audit-security',
      'sql-server-data-analyst',
    ],
  },
  softarch: {
    name: 'softarch',
    label: 'softarch (Software Archaeologist)',
    skillsDir: path.join(ROOT_DIR, 'softarch', 'skills'),
    agentsDir: path.join(ROOT_DIR, 'softarch', 'agents'),
    personaFile: null,
    pluginName: 'softarch',
    pluginDesc: 'Software Archaeologist for legacy code investigation, intent recovery and risk analysis',
    knownSkills: [],
    knownAgents: ['softarch'],
  },
};

function getSuiteSkillNames(suiteKey) {
  const s = SUITES[suiteKey];
  if (!s) return [];
  const list = new Set(s.knownSkills);
  if (fs.existsSync(s.skillsDir)) {
    try {
      for (const entry of fs.readdirSync(s.skillsDir, { withFileTypes: true })) {
        if (entry.isDirectory()) list.add(entry.name);
      }
    } catch (_) {}
  }
  return Array.from(list);
}

function getSuiteAgentNames(suiteKey) {
  const s = SUITES[suiteKey];
  if (!s) return [];
  const list = new Set(s.knownAgents);
  if (fs.existsSync(s.agentsDir)) {
    try {
      for (const f of fs.readdirSync(s.agentsDir)) {
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
  console.log(`dbAgents — instalador y desinstalador portable de agentes y skills

Uso:
  node install.js [target...] [opciones]

targets:  opencode | kilocode | claude | gemini | codex | antigravity | copilot | all   (por defecto: all)

opciones:
  --suite <name>      suite a instalar: dbtools | softarch | all (por defecto: all)
  --global            instalar/desinstalar a nivel de usuario (por defecto)
  --project <dir>     instalar/desinstalar dentro de un proyecto
  --uninstall, -u     desinstalar skills, agentes y configuración
  --dry-run           solo previsualizar, sin modificar ni borrar
  --no-overwrite      no sobrescribir archivos existentes (solo instalación)
  --help, -h          esta ayuda

Ejemplos:
  node install.js                       # instalar todas las suites, global
  node install.js copilot               # instalar en GitHub Copilot
  node install.js --suite softarch      # instalar solo el agente softarch
  node install.js --suite dbtools       # instalar solo el equipo dbtools SQL Server
  node install.js claude -u             # desinstalar todo de Claude
  node install.js --suite softarch -u   # desinstalar solo softarch
  node install.js --project .           # instalar en proyecto actual
`);
}

function parseArgs(argv) {
  const opts = { targets: [], suites: [], scope: 'global', projectDir: null, dryRun: false, overwrite: true, uninstall: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === 'all') opts.targets = KNOWN_TARGETS.slice();
    else if (a === 'uninstall' || a === '--uninstall' || a === '-u') opts.uninstall = true;
    else if (a === 'copilot' || a === 'github-copilot') {
      if (!opts.targets.includes('copilot')) opts.targets.push('copilot');
    }
    else if (KNOWN_TARGETS.includes(a)) { if (!opts.targets.includes(a)) opts.targets.push(a); }
    else if (a === '--suite') {
      const suiteVal = argv[++i];
      if (suiteVal === 'all') opts.suites = ['dbtools', 'softarch'];
      else if (KNOWN_SUITES.includes(suiteVal)) opts.suites.push(suiteVal);
      else { console.error('Suite desconocida: ' + suiteVal); usage(); process.exit(2); }
    }
    else if (a === 'dbtools' || a === 'softarch') {
      if (!opts.suites.includes(a)) opts.suites.push(a);
    }
    else if (a === '--global') opts.scope = 'global';
    else if (a === '--project') { opts.scope = 'project'; opts.projectDir = path.resolve(argv[++i] || '.'); }
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--no-overwrite') opts.overwrite = false;
    else if (a === '--help' || a === '-h') { usage(); process.exit(0); }
    else { console.error('Argumento desconocido: ' + a); usage(); process.exit(2); }
  }
  if (opts.targets.length === 0) opts.targets = KNOWN_TARGETS.slice();
  if (opts.suites.length === 0) opts.suites = ['dbtools', 'softarch'];
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
  copilot: {
    label: 'GitHub Copilot',
    // GitHub Copilot en VS Code y CLI soporta instrucciones personalizadas en .github/copilot-instructions.md
    // y agentes personalizados / promts en .github/prompts/ o .github/agents/
    skillsDir() {
      return opts.scope === 'project'
        ? path.join(opts.projectDir, '.github', 'skills')
        : path.join(HOME, '.github', 'skills');
    },
    agentsDir() {
      return opts.scope === 'project'
        ? path.join(opts.projectDir, '.github', 'agents')
        : path.join(HOME, '.github', 'agents');
    },
    hasAgents: true,
    antigravityFormat: false,
    codexFormat: false,
    claudeFormat: false,
    contextFile() {
      return opts.scope === 'project'
        ? path.join(opts.projectDir, '.github', 'copilot-instructions.md')
        : path.join(HOME, '.github', 'copilot-instructions.md');
    },
    reloadNote: 'Recarga la ventana de VS Code o reinicia la sesión de GitHub Copilot.',
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

function installAntigravityPlugin(suite) {
  if (opts.scope !== 'global' || !suite.pluginName) return;
  const pluginDir = path.join(HOME, '.gemini', 'config', 'plugins', suite.pluginName);
  const manifestFile = path.join(pluginDir, 'plugin.json');
  const manifest = JSON.stringify({
    name: suite.pluginName,
    version: '1.0.0',
    description: suite.pluginDesc
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
      if (!cfg.plugins[suite.pluginName] || !cfg.plugins[suite.pluginName].enabled) {
        cfg.plugins[suite.pluginName] = { enabled: true };
        if (opts.dryRun) {
          console.log(`  config.json -> habilitar plugin ${suite.pluginName} en ${configJsonPath}`);
        } else {
          fs.writeFileSync(configJsonPath, JSON.stringify(cfg, null, 2) + '\n');
          console.log(`  config.json -> habilitado plugin ${suite.pluginName} en ${configJsonPath}`);
        }
      }
    } catch (e) {
      console.log(`  [aviso] no se pudo actualizar config.json: ${e.message}`);
    }
  }
}

function installSkills(tool, toolId, suite) {
  const dst = tool.skillsDir();
  if (!fs.existsSync(suite.skillsDir)) {
    return 0;
  }
  const results = copyDirRecursive(suite.skillsDir, dst, opts.overwrite);
  if (results.length > 0) {
    console.log(`  skills (${suite.name}) -> ${dst}  (${results.length} archivos)`);
  }

  // Para Antigravity en modo global: copiar también a ~/.gemini/skills y ~/.gemini/antigravity-cli/skills
  if (toolId === 'antigravity' && opts.scope === 'global' && results.length > 0) {
    const sharedSkills = path.join(HOME, '.gemini', 'skills');
    copyDirRecursive(suite.skillsDir, sharedSkills, opts.overwrite);
    const cliSkills = path.join(HOME, '.gemini', 'antigravity-cli', 'skills');
    if (fs.existsSync(path.join(HOME, '.gemini', 'antigravity-cli'))) {
      copyDirRecursive(suite.skillsDir, cliSkills, opts.overwrite);
    }
  }

  // Para Claude en modo global: copiar también a las carpetas de Claude Desktop en Windows
  if (toolId === 'claude' && opts.scope === 'global' && results.length > 0) {
    for (const d of getClaudeDesktopDirs()) {
      const desktopSkills = path.join(d, 'skills');
      copyDirRecursive(suite.skillsDir, desktopSkills, opts.overwrite);
      console.log(`  skills (${suite.name} Claude Desktop) -> ${desktopSkills}`);
    }
  }

  return results.length;
}

function installAgents(tool, toolId, suite) {
  if (!tool.hasAgents) return 0;
  const dst = tool.agentsDir();
  if (!fs.existsSync(suite.agentsDir)) {
    return 0;
  }
  let count = 0;
  for (const f of fs.readdirSync(suite.agentsDir)) {
    if (!f.endsWith('.md')) continue;
    const src = path.join(suite.agentsDir, f);
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
      // Codex: subagentes y orquestador en formato TOML
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
  if (toolId === 'codex' && opts.scope === 'global' && count > 0) {
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

  if (count > 0) {
    console.log(`  agents (${suite.name}) -> ${dst}  (${count} agentes)`);
  }
  return count;
}

function installContext(tool, toolId, suite) {
  if (typeof tool.contextFile !== 'function') return 0;
  if (!suite.personaFile || !fs.existsSync(suite.personaFile)) return 0;
  const file = tool.contextFile();
  if (!file) return 0;
  const content = fs.readFileSync(suite.personaFile, 'utf8');
  if (!content) return 0;
  const block = `<!-- ${suite.name} (instalado por dbAgents/install.js) -->\n\n${content}\n`;
  if (!opts.overwrite && fs.existsSync(file)) { console.log(`  contexto (${suite.name}) -> ${file}  (omitido, ya existe)`); return 0; }
  if (opts.dryRun) { console.log(`  contexto (${suite.name}) -> ${file}`); return 1; }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, block);
  console.log(`  contexto (${suite.name}) -> ${file}`);

  if (toolId === 'claude' && opts.scope === 'global') {
    for (const d of getClaudeDesktopDirs()) {
      const dContext = path.join(d, 'CLAUDE.md');
      fs.mkdirSync(path.dirname(dContext), { recursive: true });
      fs.writeFileSync(dContext, block);
      console.log(`  contexto (${suite.name} Claude Desktop) -> ${dContext}`);
    }
  }

  return 1;
}

function uninstallAntigravityPlugin(suite) {
  if (opts.scope !== 'global' || !suite.pluginName) return;
  const pluginDir = path.join(HOME, '.gemini', 'config', 'plugins', suite.pluginName);
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
      if (cfg.plugins && cfg.plugins[suite.pluginName]) {
        if (opts.dryRun) {
          console.log(`  config.json -> remover plugin ${suite.pluginName} de ${configJsonPath}`);
        } else {
          delete cfg.plugins[suite.pluginName];
          fs.writeFileSync(configJsonPath, JSON.stringify(cfg, null, 2) + '\n');
          console.log(`  config.json -> removido plugin ${suite.pluginName} de ${configJsonPath}`);
        }
      }
    } catch (e) {
      console.log(`  [aviso] no se pudo actualizar config.json: ${e.message}`);
    }
  }
}

function uninstallSkills(tool, toolId, suite) {
  const skillNames = getSuiteSkillNames(suite.name);
  if (skillNames.length === 0) return 0;
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
          console.log(`  skills (${suite.name}) -> eliminar ${target}`);
        } else {
          try {
            fs.rmSync(target, { recursive: true, force: true });
            console.log(`  skills (${suite.name}) -> eliminado ${target}`);
          } catch (e) {
            console.log(`  [error] no se pudo eliminar ${target}: ${e.message}`);
          }
        }
        count++;
      }
    }
  }

  return count;
}

function uninstallAgents(tool, toolId, suite) {
  if (!tool.hasAgents) return 0;
  const agentNames = getSuiteAgentNames(suite.name);
  if (agentNames.length === 0) return 0;
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
            console.log(`  agents (${suite.name}) -> eliminar ${agentFolder}`);
          } else {
            try {
              fs.rmSync(agentFolder, { recursive: true, force: true });
              console.log(`  agents (${suite.name}) -> eliminado ${agentFolder}`);
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
      if (suite.name === 'dbtools') files.push('sql-server-dbtools.toml');

      for (const f of files) {
        const target = path.join(dst, f);
        if (fs.existsSync(target)) {
          if (opts.dryRun) {
            console.log(`  agents (${suite.name}) -> eliminar ${target}`);
          } else {
            try {
              fs.rmSync(target, { force: true });
              console.log(`  agents (${suite.name}) -> eliminado ${target}`);
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
            console.log(`  agents (${suite.name}) -> eliminar ${target}`);
          } else {
            try {
              fs.rmSync(target, { force: true });
              console.log(`  agents (${suite.name}) -> eliminado ${target}`);
            } catch (e) {
              console.log(`  [error] no se pudo eliminar ${target}: ${e.message}`);
            }
          }
          count++;
        }
      }
    }
  }

  return count;
}

function uninstallContext(tool, toolId, suite) {
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

  const prefix = `<!-- ${suite.name}`;
  for (const f of filesToCheck) {
    if (!fs.existsSync(f)) continue;
    try {
      const content = fs.readFileSync(f, 'utf8');
      if (content.includes(prefix)) {
        const pattern = new RegExp(`${prefix}[\\s\\S]*?(?:$|(?=\\n<!-- [^${suite.name.charAt(0)}]))`);
        const cleaned = content.replace(pattern, '').trim();
        if (cleaned.length === 0) {
          if (opts.dryRun) {
            console.log(`  contexto (${suite.name}) -> eliminar ${f}`);
          } else {
            fs.rmSync(f, { force: true });
            console.log(`  contexto (${suite.name}) -> eliminado ${f}`);
          }
          count++;
        } else {
          if (opts.dryRun) {
            console.log(`  contexto (${suite.name}) -> limpiar bloque en ${f}`);
          } else {
            fs.writeFileSync(f, cleaned + '\n');
            console.log(`  contexto (${suite.name}) -> limpiado bloque en ${f}`);
          }
          count++;
        }
      }
    } catch (e) {
      console.log(`  [aviso] no se pudo procesar contexto ${f}: ${e.message}`);
    }
  }

  return count;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
const opts = parseArgs(process.argv.slice(2));

console.log(`\ndbAgents — ${opts.uninstall ? 'desinstalador' : 'instalador'} portable`);
console.log(`Suites:  ${opts.suites.map((s) => SUITES[s].label).join(', ')}`);
console.log(`Alcance: ${opts.scope === 'project' ? `proyecto (${opts.projectDir})` : 'global (usuario ' + HOME + ')'}`);
console.log(`Modo:    ${opts.dryRun ? 'SIMULACIÓN (--dry-run)' : 'real'}`);
console.log(`Targets: ${opts.targets.map((t) => TOOLS[t].label).join(', ')}`);
console.log('');

if (opts.uninstall) {
  for (const id of opts.targets) {
    const tool = TOOLS[id];
    console.log(`== Desinstalando de ${tool.label} ==`);
    for (const suiteKey of opts.suites) {
      const suite = SUITES[suiteKey];
      if (id === 'antigravity' && tool.isPlugin) {
        uninstallAntigravityPlugin(suite);
      }
      uninstallSkills(tool, id, suite);
      uninstallAgents(tool, id, suite);
      uninstallContext(tool, id, suite);
    }
    console.log('');
  }
  console.log('Desinstalación finalizada.\n');
  process.exit(0);
}

for (const id of opts.targets) {
  const tool = TOOLS[id];
  console.log(`== ${tool.label} ==`);
  for (const suiteKey of opts.suites) {
    const suite = SUITES[suiteKey];
    if (id === 'antigravity' && tool.isPlugin) {
      installAntigravityPlugin(suite);
    }
    installSkills(tool, id, suite);
    installAgents(tool, id, suite);
    installContext(tool, id, suite);
  }
  console.log(`  (recarga: ${tool.reloadNote})`);
  console.log('');
}

console.log('Listo. Regla inquebrantable: solo lectura y análisis no destructivo.');
console.log('Todas las sugerencias se generan como scripts o documentación para el usuario.\n');
