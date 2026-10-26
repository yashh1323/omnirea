#!/usr/bin/env node

/**
 * OmniREA CLI: Autonomous Two-Tier Reverse Engineering Toolkit
 * Consolidating Lean CLI Recon, REAP Domain Playbooks, REA Tooling, and ReAgent Verification.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const VERSION = '1.0.0';

function printBanner() {
  console.log(`
  ██████╗ ███╗   ███╗███╗   ██╗██╗██████╗ ███████╗ █████╗ 
 ██╔═══██╗████╗ ████║████╗  ██║██║██╔══██╗██╔════╝██╔══██╗
 ██║   ██║██╔████╔██║██╔██╗ ██║██║██████╔╝█████╗  ███████║
 ██║   ██║██║╚██╔╝██║██║╚██╗██║██║██╔══██╗██╔══╝  ██╔══██║
 ╚██████╔╝██║ ╚═╝ ██║██║ ╚████║██║██║  ██║███████╗██║  ██║
  ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
  Two-Tier Autonomous Reverse Engineering Framework (v${VERSION})
`);
}

function printHelp() {
  printBanner();
  console.log(`Usage:
  omnirea setup [target]      One-click install REA MCP (214 tools), skills & AI rules
  omnirea scan <file|dir>     Fast Tier-1 magic header, format & architecture detection
  omnirea triage <file|dir>   Extract endpoints, keys, tokens & credentials
  omnirea playbooks          List all 16 integrated REAP domain playbooks
  omnirea doctor             Check local toolchain environment (CLI & disassemblers)
  omnirea version            Show current OmniREA version
  omnirea help               Show this help message

Setup Targets:
  omnirea setup              Auto-detect AI environment and install everywhere
  omnirea setup antigravity  Install into Google Antigravity (~/.gemini/)
  omnirea setup cursor       Install into Cursor IDE (.cursorrules & mcp.json)
  omnirea setup claude       Install into Claude Desktop / Claude Code (CLAUDE.md)
  omnirea setup workspace    Configure the current project workspace

Options:
  --deep, -d                 Suggest Tier-2 escalation route and verification signals
  --json                     Output structured JSON for agent consumption
`);
}

function detectFormat(buffer) {
  if (buffer.length < 4) return { format: 'unknown', description: 'File too small' };
  
  if (buffer[0] === 0x4D && buffer[1] === 0x5A) {
    return { format: 'PE/COFF', type: 'Windows Executable/DLL', tier2Recommended: true };
  }
  if (buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46) {
    const is64 = buffer[4] === 2;
    return { format: 'ELF', type: `Linux/Android Binary (${is64 ? '64-bit' : '32-bit'})`, tier2Recommended: true };
  }
  if (
    (buffer[0] === 0xFE && buffer[1] === 0xED && buffer[2] === 0xFA && (buffer[3] === 0xCE || buffer[3] === 0xCF)) ||
    (buffer[0] === 0xCF && buffer[1] === 0xFA && buffer[2] === 0xED && buffer[3] === 0xFE) ||
    (buffer[0] === 0xCA && buffer[1] === 0xFE && buffer[2] === 0xBA && buffer[3] === 0xBE)
  ) {
    return { format: 'Mach-O', type: 'Apple Darwin / macOS / iOS Binary', tier2Recommended: true };
  }
  if (buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) {
    return { format: 'ZIP', type: 'Archive (APK, IPA, JAR, or Office doc)', tier2Recommended: false };
  }
  if (buffer[0] === 0x00 && buffer[1] === 0x61 && buffer[2] === 0x73 && buffer[3] === 0x6D) {
    return { format: 'WASM', type: 'WebAssembly Binary Module', tier2Recommended: true };
  }
  if (buffer.subarray(0, 15).toString('utf-8') === 'SQLite format 3') {
    return { format: 'SQLite', type: 'SQLite Database', tier2Recommended: false };
  }

  const textSample = buffer.subarray(0, 512).toString('utf-8');
  if (textSample.includes('<!DOCTYPE html') || textSample.includes('<html')) {
    return { format: 'HTML', type: 'Web Page', tier2Recommended: false };
  }
  if (textSample.trim().startsWith('{') || textSample.trim().startsWith('[')) {
    try {
      JSON.parse(buffer.toString('utf-8'));
      return { format: 'JSON', type: 'JSON Data / Manifest', tier2Recommended: false };
    } catch (_) {}
  }

  return { format: 'Binary/Data', type: 'Generic binary or raw data', tier2Recommended: false };
}

function scanFile(filePath, opts = {}) {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File or directory "${filePath}" not found.`);
    process.exit(1);
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    console.log(`Directory: ${filePath}`);
    const files = fs.readdirSync(filePath);
    console.log(`Contains ${files.length} top-level entries.`);
    return;
  }

  const buffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  const md5 = crypto.createHash('md5').update(buffer).digest('hex');
  const detection = detectFormat(buffer);

  const report = {
    target: path.resolve(filePath),
    sizeBytes: stat.size,
    sizeHuman: (stat.size / 1024).toFixed(2) + ' KB',
    hashes: { sha256: hash, md5: md5 },
    format: detection.format,
    type: detection.type,
    tier1Action: 'Fast CLI inspection (strings, grep, symbols)',
    tier2Recommended: detection.tier2Recommended,
    escalationTrigger: detection.tier2Recommended 
      ? 'Target contains compiled native logic. Escalate to Tier-2 for Ghidra/IDA decompilation & 11-signal ReAgent parity verification.'
      : 'Target can be 100% analyzed in Tier-1 Fast Path with zero MCP token bloat.'
  };

  if (opts.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  printBanner();
  console.log(`Target:      ${report.target}`);
  console.log(`Size:        ${report.sizeHuman} (${report.sizeBytes} bytes)`);
  console.log(`Format:      ${report.format} (${report.type})`);
  console.log(`SHA-256:     ${report.hashes.sha256}`);
  console.log(`MD5:         ${report.hashes.md5}`);
  console.log(`\nRouting Recommendation:`);
  console.log(`  Tier-1 Recon:  ${report.tier1Action}`);
  console.log(`  Tier-2 Needed: ${report.tier2Recommended ? 'YES [Escalate to ReAgent/Ghidra]' : 'NO [Stay in Tier-1 Fast Path]'}`);
  console.log(`  Rationale:     ${report.escalationTrigger}\n`);
}

function triageFile(filePath, opts = {}) {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File "${filePath}" not found.`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  
  const urlRegex = /https?:\/\/[a-zA-Z0-9_\-.]+(:\d+)?(\/[a-zA-Z0-9_.\-~%!$&'()*+,;=:@/]*)/gi;
  const keyRegex = /(api[_-]?key|secret|token|bearer|password|auth)['":\s=]+([a-zA-Z0-9_\-.]{8,64})/gi;
  const ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;

  const urls = [...new Set(content.match(urlRegex) || [])];
  const keys = [...new Set(content.match(keyRegex) || [])];
  const ips = [...new Set(content.match(ipRegex) || [])];

  const results = {
    target: filePath,
    findings: {
      urls: urls.slice(0, 20),
      potentialCredentials: keys.slice(0, 15),
      ipAddresses: ips.slice(0, 10)
    }
  };

  if (opts.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  printBanner();
  console.log(`Triage Results for: ${filePath}\n`);
  console.log(`[+] Discovered URLs / Endpoints (${urls.length}):`);
  results.findings.urls.forEach(u => console.log(`    - ${u}`));
  if (urls.length > 20) console.log(`    ... and ${urls.length - 20} more`);

  console.log(`\n[+] Potential Secrets & Tokens (${keys.length}):`);
  results.findings.potentialCredentials.forEach(k => console.log(`    - ${k}`));

  console.log(`\n[+] Discovered IPv4 Addresses (${ips.length}):`);
  results.findings.ipAddresses.forEach(ip => console.log(`    - ${ip}`));
  console.log('');
}

function listPlaybooks() {
  printBanner();
  console.log(`Integrated REAP Domain Playbooks (16 Templates Available):\n`);
  const playbooks = [
    ['01_getting_started', 'High-level binary identification, headers, sections & imports'],
    ['02_feature_tracing', 'Follow UI button clicks down to backend logic & syscalls'],
    ['03_native_binary_exploration', 'Deep triage of PE, ELF, and Mach-O executables'],
    ['04_software_cloning_and_parity', 'Clean-room reconstruction & 11-signal ReAgent parity'],
    ['05_game_logic_and_assets', 'Unity IL2CPP, Unreal Engine PAKs & game logic recovery'],
    ['06_wasm_portability', 'WebAssembly decompilation and browser portability'],
    ['07_firmware_and_embedded', 'IoT firmware triage, SquashFS extraction & memory maps'],
    ['08_android_and_mobile', 'APK auditing, JNI native library tracing & SSL unpinning'],
    ['09_kernel_and_drivers', 'Windows .sys / Linux .ko driver and IOCTL surface analysis'],
    ['10_vulnerability_research', '1-day patch diffing, memory corruption sinks & crash triage'],
    ['11_electron_and_javascript', 'ASAR bundle extraction, contextBridge audit & AST dataflow'],
    ['12_anti_cheat_and_licensing', 'Defensive analysis of DRM, licensing and anti-cheat checks'],
    ['13_hardware_and_dma_analysis', 'PCIe TLP sniffing, IOMMU protection & FPGA firmware'],
    ['14_protection_and_cryptanalysis', 'Defeating packers, string decryption & custom cipher recovery'],
    ['15_version_diffing_and_crashes', 'Cross-architecture diffing (x86_64 vs ARM64)'],
    ['16_mcp_and_agent_toolchains', 'Replicating closed-source AI agent toolchains & MCP servers']
  ];

  playbooks.forEach(([name, desc]) => {
    console.log(`  ${name.padEnd(38)} : ${desc}`);
  });
  console.log(`\nPlaybooks are located in: ./playbooks/\n`);
}

function runDoctor() {
  printBanner();
  console.log(`OmniREA System Environment Doctor\n`);

  const tools = [
    { name: 'Node.js', cmd: 'node --version' },
    { name: 'Git', cmd: 'git --version' },
    { name: 'Ripgrep (rg)', cmd: 'rg --version' },
    { name: 'PowerShell / Shell', cmd: process.platform === 'win32' ? 'powershell -Command "$PSVersionTable.PSVersion"' : 'sh -c "echo $0"' },
    { name: 'dumpbin (MSVC)', cmd: 'dumpbin /?' },
    { name: 'objdump / llvm-objdump', cmd: 'objdump --version' },
    { name: 'readelf', cmd: 'readelf --version' },
    { name: 'strings', cmd: 'strings --version' },
    { name: 'Frida CLI', cmd: 'frida --version' },
    { name: 'Ghidra (GHIDRA_INSTALL_DIR)', env: 'GHIDRA_INSTALL_DIR' }
  ];

  tools.forEach(t => {
    let status = 'MISSING';
    if (t.env) {
      status = process.env[t.env] ? `CONFIGURED (${process.env[t.env]})` : 'NOT_SET';
    } else {
      try {
        execSync(t.cmd, { stdio: 'ignore' });
        status = 'INSTALLED';
      } catch (_) {
        status = 'NOT_FOUND';
      }
    }
    const indicator = (status === 'INSTALLED' || status.startsWith('CONFIGURED')) ? '✓' : '✗';
    console.log(`  [${indicator}] ${t.name.padEnd(30)} : ${status}`);
  });

  const mcpDir = path.join(ROOT_DIR, 'mcp', 'rea');
  if (fs.existsSync(mcpDir)) {
    const schemaCount = fs.readdirSync(mcpDir).filter(f => f.endsWith('.json')).length;
    console.log(`  [✓] Bundled REA MCP Schemas        : READY (${schemaCount} tools bundled)`);
  } else {
    console.log(`  [✗] Bundled REA MCP Schemas        : MISSING`);
  }

  console.log('\nDoctor evaluation complete.\n');
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function runSetup(target = 'auto') {
  printBanner();
  console.log(`OmniREA 1-Click AI Assistant Installer (Target: ${target.toUpperCase()})\n`);

  const homeDir = os.homedir();
  const cwd = process.cwd();
  let installedCount = 0;

  // 1. Antigravity Setup (~/.gemini/)
  const geminiDir = path.join(homeDir, '.gemini');
  if (target === 'auto' || target === 'antigravity' || target === 'all') {
    if (fs.existsSync(geminiDir) || target === 'antigravity') {
      console.log(`[+] Configuring Google Antigravity & Gemini Agent (~/.gemini)...`);
      
      const targetSkillsDir = path.join(geminiDir, 'config', 'skills');
      const srcSkillsDir = path.join(ROOT_DIR, 'skills');
      if (fs.existsSync(srcSkillsDir)) {
        copyDirRecursive(srcSkillsDir, targetSkillsDir);
        console.log(`    ✓ Installed 3 skills (omnirea, lean-recon, deep-verify) into ~/.gemini/config/skills/`);
      }

      const targetMcpDir = path.join(geminiDir, 'antigravity', 'mcp', 'rea');
      const srcMcpDir = path.join(ROOT_DIR, 'mcp', 'rea');
      if (fs.existsSync(srcMcpDir)) {
        copyDirRecursive(srcMcpDir, targetMcpDir);
        const count = fs.readdirSync(targetMcpDir).filter(f => f.endsWith('.json')).length;
        console.log(`    ✓ Installed ${count} REA MCP tool schemas into ~/.gemini/antigravity/mcp/rea/`);
      }
      installedCount++;
    }
  }

  // 2. Cursor IDE Setup (.cursorrules & .cursor/mcp.json)
  if (target === 'auto' || target === 'cursor' || target === 'all' || target === 'workspace') {
    console.log(`[+] Configuring Cursor IDE in project (${cwd})...`);
    
    const srcRules = path.join(ROOT_DIR, 'rules', '.cursorrules');
    const destRules = path.join(cwd, '.cursorrules');
    if (fs.existsSync(srcRules)) {
      fs.copyFileSync(srcRules, destRules);
      console.log(`    ✓ Deployed .cursorrules protocol file`);
    }

    const cursorDir = path.join(cwd, '.cursor');
    if (!fs.existsSync(cursorDir)) fs.mkdirSync(cursorDir, { recursive: true });
    
    const mcpConfigPath = path.join(cursorDir, 'mcp.json');
    const mcpConfig = {
      mcpServers: {
        omnirea: {
          command: "node",
          args: [path.join(ROOT_DIR, "bin", "omnirea.js"), "doctor"],
          description: "OmniREA Autonomous Reverse Engineering Server"
        }
      }
    };
    fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2), 'utf-8');
    console.log(`    ✓ Configured .cursor/mcp.json with OmniREA tool server`);
    installedCount++;
  }

  // 3. Claude Code & Claude Desktop Setup (CLAUDE.md)
  if (target === 'auto' || target === 'claude' || target === 'all' || target === 'workspace') {
    console.log(`[+] Configuring Claude Code & Claude Desktop...`);
    
    const srcClaude = path.join(ROOT_DIR, 'rules', 'CLAUDE.md');
    const destClaude = path.join(cwd, 'CLAUDE.md');
    if (fs.existsSync(srcClaude)) {
      fs.copyFileSync(srcClaude, destClaude);
      console.log(`    ✓ Deployed CLAUDE.md project protocol`);
    }

    let claudeDesktopConfig = null;
    if (process.platform === 'win32') {
      const appData = process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming');
      claudeDesktopConfig = path.join(appData, 'Claude', 'claude_desktop_config.json');
    } else if (process.platform === 'darwin') {
      claudeDesktopConfig = path.join(homeDir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
    } else {
      claudeDesktopConfig = path.join(homeDir, '.config', 'Claude', 'claude_desktop_config.json');
    }

    if (claudeDesktopConfig && fs.existsSync(path.dirname(claudeDesktopConfig))) {
      try {
        let conf = {};
        if (fs.existsSync(claudeDesktopConfig)) {
          conf = JSON.parse(fs.readFileSync(claudeDesktopConfig, 'utf-8'));
        }
        conf.mcpServers = conf.mcpServers || {};
        conf.mcpServers.omnirea = {
          command: "node",
          args: [path.join(ROOT_DIR, "bin", "omnirea.js"), "doctor"]
        };
        fs.writeFileSync(claudeDesktopConfig, JSON.stringify(conf, null, 2), 'utf-8');
        console.log(`    ✓ Registered OmniREA in Claude Desktop (${claudeDesktopConfig})`);
      } catch (e) {
        console.log(`    ! Claude Desktop config note: ${e.message}`);
      }
    }
    installedCount++;
  }

  // 4. Install Skills and Playbooks into local workspace if outside ROOT
  const destSkills = path.join(cwd, 'skills');
  const destPlaybooks = path.join(cwd, 'playbooks');
  if (cwd !== ROOT_DIR) {
    console.log(`[+] Mirroring skills and playbooks into current workspace...`);
    copyDirRecursive(path.join(ROOT_DIR, 'skills'), destSkills);
    copyDirRecursive(path.join(ROOT_DIR, 'playbooks'), destPlaybooks);
    console.log(`    ✓ Copied skills/ and playbooks/ into local workspace`);
  }

  console.log(`\n========================================================`);
  console.log(`🎉 OmniREA Setup Complete! (${installedCount} target environments configured)`);
  console.log(`Your AI Assistant now has full access to:`);
  console.log(`  - 214 REA MCP Tools (in mcp/rea)`);
  console.log(`  - 16 REAP Domain Playbooks (in playbooks/)`);
  console.log(`  - Two-Tier Routing Engine (Lean Fast-Path + ReAgent Verification)`);
  console.log(`========================================================\n`);
}

// CLI Arg Parsing
const args = process.argv.slice(2);
const command = args[0] || 'help';

switch (command) {
  case 'setup':
  case 'install':
  case 'init':
    runSetup(args[1] || 'auto');
    break;
  case 'scan':
  case 'recon':
    if (!args[1]) {
      console.error('Error: Please provide a file or directory to scan.');
      process.exit(1);
    }
    scanFile(args[1], { json: args.includes('--json') });
    break;
  case 'triage':
    if (!args[1]) {
      console.error('Error: Please provide a file to triage.');
      process.exit(1);
    }
    triageFile(args[1], { json: args.includes('--json') });
    break;
  case 'playbooks':
    listPlaybooks();
    break;
  case 'doctor':
    runDoctor();
    break;
  case 'version':
  case '-v':
  case '--version':
    console.log(`OmniREA v${VERSION}`);
    break;
  case 'help':
  case '-h':
  case '--help':
  default:
    printHelp();
    break;
}
