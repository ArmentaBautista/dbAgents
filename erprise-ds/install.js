#!/usr/bin/env node
'use strict';
/**
 * erprise-design-system — Instalador portable multi-herramienta
 * Instala el Plugin, las Skills (con references/ y resources/) y el Agente erprise-ds en:
 *   Google Antigravity, OpenCode, Kilo Code, GitHub Copilot, Claude Code, Gemini CLI y Codex CLI.
 *
 * Uso:
 *   node install.js [target...] [opciones]
 *
 * targets: antigravity | opencode | kilocode | copilot | claude | gemini | codex | all (por defecto: all)
 * opciones:
 *   --global            Instalar a nivel de usuario (por defecto)
 *   --project <dir>     Instalar dentro de un proyecto específico
 *   --uninstall, -u     Desinstalar plugin, skills y agente
 *   --dry-run           Previsualizar sin escribir ni borrar en disco
 *   --no-overwrite      No sobrescribir archivos existentes
 *   --help, -h          Mostrar ayuda
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const BUNDLE_DIR = __dirname;
const SKILLS_SRC = path.join(BUNDLE_DIR, 'skills');
const AGENTS_SRC = path.join(BUNDLE_DIR, 'agents');
const PLUGIN_JSON_SRC = path.join(BUNDLE_DIR, 'plugin.json');
const ASSETS_SRC = path.join(BUNDLE_DIR, 'assets');
const README_SRC = path.join(BUNDLE_DIR, 'README.md');
const AGENT_PERSONA_SRC = path.join(AGENTS_SRC, 'erprise-ds.md');
const HOME = os.homedir();

const KNOWN_TARGETS = ['antigravity', 'opencode', 'kilocode', 'copilot', 'claude', 'gemini', 'codex'];

function usage() {
  console.log(`erprise-design-system — Instalador portable del Sistema de Diseño ERPRISE

Uso:
  node install.js [target...] [opciones]

targets:  antigravity | opencode | kilocode | copilot | claude | gemini | codex | all (por defecto: all)

opciones:
  --global            Instalar a nivel de usuario (por defecto)
  --project <dir>     Instalar dentro de un proyecto específico
  --uninstall, -u     Desinstalar plugin, skills y agente
  --dry-run           Solo previsualizar, sin escribir ni borrar
  --no-overwrite      No sobrescribir archivos existentes
  --help, -h          Mostrar esta ayuda
`);
}

function parseArgs(argv) {
  const opts = { targets: [], scope: 'global', projectDir: null, dryRun: false, overwrite: true, uninstall: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === 'all') opts.targets = KNOWN_TARGETS.slice();
    else if (a === 'uninstall' || a === '--uninstall' || a === '-u') opts.uninstall = true;
    else if (a === 'copilot' || a === 'github-copilot') {
      if (!opts.targets.includes('copilot')) opts.targets.push('copilot');
    }
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

const opts = parseArgs(process.argv.slice(2));

function copyFile(src, dst, overwrite) {
  if (!fs.existsSync(src)) return 'missing';
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

function removeFile(file) {
  if (!fs.existsSync(file)) return false;
  if (opts.dryRun) return true;
  try {
    fs.rmSync(file, { force: true });
    return true;
  } catch (_) {
    return false;
  }
}

function removeDir(dir) {
  if (!fs.existsSync(dir)) return false;
  if (opts.dryRun) return true;
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    return true;
  } catch (_) {
    return false;
  }
}

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
    if (m) return m[1].trim();
  }
  return '';
}

function tomlBasic(value) {
  return '"' + String(value)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '')
    .replace(/\n/g, '\\n') + '"';
}

function getClaudeDesktopDirs() {
  const dirs = [];
  if (process.platform === 'win32') {
    if (process.env.APPDATA) dirs.push(path.join(process.env.APPDATA, 'Claude'));
    const localPackages = process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Packages') : null;
    if (localPackages && fs.existsSync(localPackages)) {
      try {
        for (const p of fs.readdirSync(localPackages)) {
          if (p.startsWith('Claude_')) dirs.push(path.join(localPackages, p, 'LocalCache', 'Roaming', 'Claude'));
        }
      } catch (_) {}
    }
  }
  return dirs;
}

const TOOLS = {
  antigravity: {
    label: 'Google Antigravity (Plugin + Skill + Agente)',
    install() {
      if (opts.scope === 'project') {
        const dstSkills = path.join(opts.projectDir, '.agents', 'skills');
        const res = copyDirRecursive(SKILLS_SRC, dstSkills, opts.overwrite);
        console.log(`  skills (workspace) -> ${dstSkills} (${res.length} archivos)`);

        const dstAgents = path.join(opts.projectDir, '.agents', 'agents');
        copyFile(AGENT_PERSONA_SRC, path.join(dstAgents, 'erprise-ds', 'agent.md'), opts.overwrite);
        copyFile(AGENT_PERSONA_SRC, path.join(dstAgents, 'erprise-design-system', 'agent.md'), opts.overwrite);
        console.log(`  agents (workspace) -> ${dstAgents}`);
        return;
      }

      // 1. Instalar como Plugin en ~/.gemini/config/plugins/erprise-design-system
      const pluginDir = path.join(HOME, '.gemini', 'config', 'plugins', 'erprise-design-system');
      copyFile(PLUGIN_JSON_SRC, path.join(pluginDir, 'plugin.json'), opts.overwrite);
      copyFile(README_SRC, path.join(pluginDir, 'README.md'), opts.overwrite);
      const assetsRes = copyDirRecursive(ASSETS_SRC, path.join(pluginDir, 'assets'), opts.overwrite);
      const pluginSkillsRes = copyDirRecursive(SKILLS_SRC, path.join(pluginDir, 'skills'), opts.overwrite);
      console.log(`  plugin -> ${pluginDir} (${pluginSkillsRes.length + assetsRes.length + 2} archivos)`);

      // Habilitar en config.json
      const configJsonPath = path.join(HOME, '.gemini', 'config', 'config.json');
      if (fs.existsSync(configJsonPath)) {
        try {
          const cfg = JSON.parse(fs.readFileSync(configJsonPath, 'utf8'));
          if (!cfg.plugins) cfg.plugins = {};
          if (!cfg.plugins['erprise-design-system'] || !cfg.plugins['erprise-design-system'].enabled) {
            cfg.plugins['erprise-design-system'] = { enabled: true };
            if (!opts.dryRun) fs.writeFileSync(configJsonPath, JSON.stringify(cfg, null, 2) + '\n');
            console.log(`  config.json -> habilitado plugin erprise-design-system`);
          }
        } catch (_) {}
      }

      // 2. Instalar en ~/.gemini/antigravity/skills y ~/.gemini/skills para descubrimiento
      const agySkillsDir = path.join(HOME, '.gemini', 'antigravity', 'skills');
      const agyRes = copyDirRecursive(SKILLS_SRC, agySkillsDir, opts.overwrite);
      copyDirRecursive(SKILLS_SRC, path.join(HOME, '.gemini', 'skills'), opts.overwrite);
      console.log(`  skills -> ${agySkillsDir} (${agyRes.length} archivos)`);

      // 3. Instalar Agente en ~/.gemini/config/agents/ y ~/.gemini/antigravity-cli/agents/
      if (fs.existsSync(AGENT_PERSONA_SRC)) {
        const raw = fs.readFileSync(AGENT_PERSONA_SRC, 'utf8');
        const { frontmatter, body } = splitFrontmatter(raw);
        const desc = frontmatterField(frontmatter, 'description');
        const agentContent = [
          '---',
          'name: erprise-ds',
          `description: ${JSON.stringify(desc)}`,
          'mainAgent: true',
          'subagent: true',
          '---',
          '',
          '# erprise-ds',
          '',
          body,
          '',
        ].join('\n');

        const agyAgentDirs = [
          path.join(HOME, '.gemini', 'config', 'agents', 'erprise-ds'),
          path.join(HOME, '.gemini', 'config', 'agents', 'erprise-design-system'),
        ];
        if (fs.existsSync(path.join(HOME, '.gemini', 'antigravity-cli'))) {
          agyAgentDirs.push(path.join(HOME, '.gemini', 'antigravity-cli', 'agents', 'erprise-ds'));
          agyAgentDirs.push(path.join(HOME, '.gemini', 'antigravity-cli', 'agents', 'erprise-design-system'));
        }

        for (const dir of agyAgentDirs) {
          if (!opts.dryRun) {
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(path.join(dir, 'agent.md'), agentContent);
          }
        }
        console.log(`  agents -> ~/.gemini/config/agents/erprise-ds`);

        // Regla global en ~/.gemini/config/rules/erprise-design-system.md
        const ruleFile = path.join(HOME, '.gemini', 'config', 'rules', 'erprise-design-system.md');
        if (!opts.dryRun) {
          fs.mkdirSync(path.dirname(ruleFile), { recursive: true });
          fs.writeFileSync(ruleFile, `<!-- erprise-ds (instalado por erprise-design-system/install.js) -->\n\n${raw}\n`);
        }
        console.log(`  rule -> ${ruleFile}`);
      }
    },
    uninstall() {
      if (opts.scope === 'project') {
        removeDir(path.join(opts.projectDir, '.agents', 'skills', 'erprise-design-system'));
        removeDir(path.join(opts.projectDir, '.agents', 'agents', 'erprise-ds'));
        removeDir(path.join(opts.projectDir, '.agents', 'agents', 'erprise-design-system'));
        console.log('  desinstalado del workspace');
        return;
      }
      removeDir(path.join(HOME, '.gemini', 'config', 'plugins', 'erprise-design-system'));
      removeDir(path.join(HOME, '.gemini', 'antigravity', 'skills', 'erprise-design-system'));
      removeDir(path.join(HOME, '.gemini', 'skills', 'erprise-design-system'));
      removeDir(path.join(HOME, '.gemini', 'config', 'agents', 'erprise-ds'));
      removeDir(path.join(HOME, '.gemini', 'config', 'agents', 'erprise-design-system'));
      removeFile(path.join(HOME, '.gemini', 'config', 'rules', 'erprise-design-system.md'));
      console.log('  desinstalado de Antigravity');
    },
    reloadNote: 'El plugin, skill y agente estarán disponibles en el siguiente turno o usando /agents.',
  },
  opencode: {
    label: 'OpenCode',
    install() {
      const dstSkills = opts.scope === 'project'
        ? path.join(opts.projectDir, '.opencode', 'skills')
        : path.join(HOME, '.config', 'opencode', 'skills');
      const res = copyDirRecursive(SKILLS_SRC, dstSkills, opts.overwrite);
      console.log(`  skills -> ${dstSkills} (${res.length} archivos)`);

      const dstAgents = opts.scope === 'project'
        ? path.join(opts.projectDir, '.opencode', 'agents')
        : path.join(HOME, '.config', 'opencode', 'agents');
      copyFile(AGENT_PERSONA_SRC, path.join(dstAgents, 'erprise-ds.md'), opts.overwrite);
      copyFile(AGENT_PERSONA_SRC, path.join(dstAgents, 'erprise-design-system.md'), opts.overwrite);
      console.log(`  agents -> ${dstAgents}`);
    },
    uninstall() {
      const dstSkills = opts.scope === 'project'
        ? path.join(opts.projectDir, '.opencode', 'skills', 'erprise-design-system')
        : path.join(HOME, '.config', 'opencode', 'skills', 'erprise-design-system');
      const dstAgents = opts.scope === 'project'
        ? path.join(opts.projectDir, '.opencode', 'agents')
        : path.join(HOME, '.config', 'opencode', 'agents');
      removeDir(dstSkills);
      removeFile(path.join(dstAgents, 'erprise-ds.md'));
      removeFile(path.join(dstAgents, 'erprise-design-system.md'));
      console.log('  desinstalado de OpenCode');
    },
    reloadNote: 'Reinicia la sesión para recargar skills y agentes.',
  },
  kilocode: {
    label: 'Kilo Code',
    install() {
      const dstSkills = opts.scope === 'project'
        ? path.join(opts.projectDir, '.kilo', 'skills')
        : path.join(HOME, '.kilo', 'skills');
      const res = copyDirRecursive(SKILLS_SRC, dstSkills, opts.overwrite);
      console.log(`  skills -> ${dstSkills} (${res.length} archivos)`);

      const dstAgents = opts.scope === 'project'
        ? path.join(opts.projectDir, '.kilo', 'agent')
        : path.join(HOME, '.config', 'kilo', 'agent');
      copyFile(AGENT_PERSONA_SRC, path.join(dstAgents, 'erprise-ds.md'), opts.overwrite);
      copyFile(AGENT_PERSONA_SRC, path.join(dstAgents, 'erprise-design-system.md'), opts.overwrite);
      console.log(`  agents -> ${dstAgents}`);
    },
    uninstall() {
      const dstSkills = opts.scope === 'project'
        ? path.join(opts.projectDir, '.kilo', 'skills', 'erprise-design-system')
        : path.join(HOME, '.kilo', 'skills', 'erprise-design-system');
      const dstAgents = opts.scope === 'project'
        ? path.join(opts.projectDir, '.kilo', 'agent')
        : path.join(HOME, '.config', 'kilo', 'agent');
      removeDir(dstSkills);
      removeFile(path.join(dstAgents, 'erprise-ds.md'));
      removeFile(path.join(dstAgents, 'erprise-design-system.md'));
      console.log('  desinstalado de Kilo Code');
    },
    reloadNote: 'Usa /reload o inicia una sesión nueva.',
  },
  copilot: {
    label: 'GitHub Copilot',
    install() {
      const dstSkills = opts.scope === 'project'
        ? path.join(opts.projectDir, '.github', 'skills')
        : path.join(HOME, '.github', 'skills');
      const res = copyDirRecursive(SKILLS_SRC, dstSkills, opts.overwrite);
      console.log(`  skills -> ${dstSkills} (${res.length} archivos)`);

      const dstAgents = opts.scope === 'project'
        ? path.join(opts.projectDir, '.github', 'agents')
        : path.join(HOME, '.github', 'agents');
      copyFile(AGENT_PERSONA_SRC, path.join(dstAgents, 'erprise-ds.md'), opts.overwrite);
      copyFile(AGENT_PERSONA_SRC, path.join(dstAgents, 'erprise-design-system.md'), opts.overwrite);
      console.log(`  agents -> ${dstAgents}`);

      const instrFile = opts.scope === 'project'
        ? path.join(opts.projectDir, '.github', 'copilot-instructions.md')
        : path.join(HOME, '.github', 'copilot-instructions.md');
      if (fs.existsSync(AGENT_PERSONA_SRC)) {
        const raw = fs.readFileSync(AGENT_PERSONA_SRC, 'utf8');
        copyFile(AGENT_PERSONA_SRC, instrFile, opts.overwrite);
        console.log(`  instrucciones -> ${instrFile}`);
      }
    },
    uninstall() {
      const dstSkills = opts.scope === 'project'
        ? path.join(opts.projectDir, '.github', 'skills', 'erprise-design-system')
        : path.join(HOME, '.github', 'skills', 'erprise-design-system');
      const dstAgents = opts.scope === 'project'
        ? path.join(opts.projectDir, '.github', 'agents')
        : path.join(HOME, '.github', 'agents');
      removeDir(dstSkills);
      removeFile(path.join(dstAgents, 'erprise-ds.md'));
      removeFile(path.join(dstAgents, 'erprise-design-system.md'));
      console.log('  desinstalado de GitHub Copilot');
    },
    reloadNote: 'Recarga la ventana de VS Code o reinicia la sesión de GitHub Copilot.',
  },
  claude: {
    label: 'Claude Code',
    install() {
      const dstSkills = opts.scope === 'project'
        ? path.join(opts.projectDir, '.claude', 'skills')
        : path.join(HOME, '.claude', 'skills');
      const res = copyDirRecursive(SKILLS_SRC, dstSkills, opts.overwrite);
      console.log(`  skills -> ${dstSkills} (${res.length} archivos)`);

      if (opts.scope === 'global') {
        for (const d of getClaudeDesktopDirs()) {
          copyDirRecursive(SKILLS_SRC, path.join(d, 'skills'), opts.overwrite);
        }
      }

      if (fs.existsSync(AGENT_PERSONA_SRC)) {
        const raw = fs.readFileSync(AGENT_PERSONA_SRC, 'utf8');
        const { frontmatter, body } = splitFrontmatter(raw);
        const desc = frontmatterField(frontmatter, 'description');
        const toolsYaml = ['Read', 'Write', 'Edit', 'Grep', 'Glob', 'Bash', 'Agent', 'Skill', 'WebFetch', 'WebSearch'].map(t => `  - ${t}`).join('\n');
        const claudeContent = ['---', 'name: erprise-ds', `description: ${JSON.stringify(desc)}`, 'tools:', toolsYaml, '---', '', body, ''].join('\n');

        const dstAgents = opts.scope === 'project'
          ? path.join(opts.projectDir, '.claude', 'agents')
          : path.join(HOME, '.claude', 'agents');

        if (!opts.dryRun) {
          fs.mkdirSync(dstAgents, { recursive: true });
          fs.writeFileSync(path.join(dstAgents, 'erprise-ds.md'), claudeContent);
          fs.writeFileSync(path.join(dstAgents, 'erprise-design-system.md'), claudeContent);
        }
        console.log(`  agents -> ${dstAgents}`);

        if (opts.scope === 'global') {
          for (const d of getClaudeDesktopDirs()) {
            const dAgentDir = path.join(d, 'agents');
            if (!opts.dryRun) {
              fs.mkdirSync(dAgentDir, { recursive: true });
              fs.writeFileSync(path.join(dAgentDir, 'erprise-ds.md'), claudeContent);
              fs.writeFileSync(path.join(dAgentDir, 'erprise-design-system.md'), claudeContent);
            }
          }
        }
      }
    },
    uninstall() {
      const dstSkills = opts.scope === 'project'
        ? path.join(opts.projectDir, '.claude', 'skills', 'erprise-design-system')
        : path.join(HOME, '.claude', 'skills', 'erprise-design-system');
      const dstAgents = opts.scope === 'project'
        ? path.join(opts.projectDir, '.claude', 'agents')
        : path.join(HOME, '.claude', 'agents');
      removeDir(dstSkills);
      removeFile(path.join(dstAgents, 'erprise-ds.md'));
      removeFile(path.join(dstAgents, 'erprise-design-system.md'));
      if (opts.scope === 'global') {
        for (const d of getClaudeDesktopDirs()) {
          removeDir(path.join(d, 'skills', 'erprise-design-system'));
          removeFile(path.join(d, 'agents', 'erprise-ds.md'));
          removeFile(path.join(d, 'agents', 'erprise-design-system.md'));
        }
      }
      console.log('  desinstalado de Claude Code');
    },
    reloadNote: 'Reinicia Claude Code para recargar skills y agentes.',
  },
  gemini: {
    label: 'Gemini CLI',
    install() {
      const dst = opts.scope === 'project'
        ? path.join(opts.projectDir, '.gemini', 'skills')
        : path.join(HOME, '.gemini', 'skills');
      const res = copyDirRecursive(SKILLS_SRC, dst, opts.overwrite);
      console.log(`  skills -> ${dst} (${res.length} archivos)`);
    },
    uninstall() {
      const dst = opts.scope === 'project'
        ? path.join(opts.projectDir, '.gemini', 'skills', 'erprise-design-system')
        : path.join(HOME, '.gemini', 'skills', 'erprise-design-system');
      removeDir(dst);
      console.log('  desinstalado de Gemini CLI');
    },
    reloadNote: 'Verifica con /skills list.',
  },
  codex: {
    label: 'Codex CLI (.agents/skills)',
    install() {
      const dstSkills = opts.scope === 'project'
        ? path.join(opts.projectDir, '.agents', 'skills')
        : path.join(HOME, '.agents', 'skills');
      const res = copyDirRecursive(SKILLS_SRC, dstSkills, opts.overwrite);
      console.log(`  skills -> ${dstSkills} (${res.length} archivos)`);

      if (fs.existsSync(AGENT_PERSONA_SRC)) {
        const raw = fs.readFileSync(AGENT_PERSONA_SRC, 'utf8');
        const { frontmatter, body } = splitFrontmatter(raw);
        const desc = frontmatterField(frontmatter, 'description');
        const codexToml = [
          `name = ${tomlBasic('erprise-ds')}`,
          `description = ${tomlBasic(desc)}`,
          'sandbox_mode = "workspace-write"',
          `developer_instructions = ${tomlBasic(body)}`,
          '',
        ].join('\n');

        const dstAgents = opts.scope === 'project'
          ? path.join(opts.projectDir, '.codex', 'agents')
          : path.join(HOME, '.codex', 'agents');

        if (!opts.dryRun) {
          fs.mkdirSync(dstAgents, { recursive: true });
          fs.writeFileSync(path.join(dstAgents, 'erprise-ds.toml'), codexToml);
          fs.writeFileSync(path.join(dstAgents, 'erprise-design-system.toml'), codexToml);
        }
        console.log(`  agents -> ${dstAgents}`);
      }
    },
    uninstall() {
      const dstSkills = opts.scope === 'project'
        ? path.join(opts.projectDir, '.agents', 'skills', 'erprise-design-system')
        : path.join(HOME, '.agents', 'skills', 'erprise-design-system');
      const dstAgents = opts.scope === 'project'
        ? path.join(opts.projectDir, '.codex', 'agents')
        : path.join(HOME, '.codex', 'agents');
      removeDir(dstSkills);
      removeFile(path.join(dstAgents, 'erprise-ds.toml'));
      removeFile(path.join(dstAgents, 'erprise-design-system.toml'));
      console.log('  desinstalado de Codex CLI');
    },
    reloadNote: 'Codex detecta automáticamente .agents/skills y .codex/agents.',
  },
};

console.log(`\nerprise-design-system — Instalador portable`);
console.log(`Acción:  ${opts.uninstall ? 'DESINSTALACIÓN' : 'INSTALACIÓN'}`);
console.log(`Alcance: ${opts.scope === 'project' ? `proyecto (${opts.projectDir})` : `global (${HOME})`}`);
console.log(`Modo:    ${opts.dryRun ? 'SIMULACIÓN (--dry-run)' : 'escritura real'}`);
console.log(`Targets: ${opts.targets.map((t) => TOOLS[t].label).join(', ')}\n`);

for (const id of opts.targets) {
  const tool = TOOLS[id];
  console.log(`== ${tool.label} ==`);
  if (opts.uninstall) {
    tool.uninstall();
  } else {
    tool.install();
  }
  console.log(`  (${tool.reloadNote})\n`);
}

console.log(opts.uninstall ? 'Desinstalación completada con éxito.\n' : 'Instalación completada con éxito.\n');
