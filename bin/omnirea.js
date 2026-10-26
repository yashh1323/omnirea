#!/usr/bin/env node

/**
 * OmniREA CLI: Autonomous Two-Tier Reverse Engineering Toolkit
 * Consolidating Lean CLI Recon, REAP Domain Playbooks, REA Tooling, and ReAgent Verification.
 */

import fs from 'node:fs';
import path from 'node:path';
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
  omnirea scan <file|dir>     Fast Tier-1 magic header, format & architecture detection
  omnirea triage <file|dir>   Extract endpoints, keys, tokens & credentials
  omnirea playbooks          List all 16 integrated REAP domain playbooks
  omnirea doctor             Check local toolchain environment (CLI & disassemblers)
  omnirea version            Show current OmniREA version
  omnirea help               Show this help message

Options:
  --deep, -d                 Suggest Tier-2 escalation route and verification signals
  --json                     Output structured JSON for agent consumption
`);
}

function detectFormat(buffer) {
  if (buffer.length < 4) return { format: 'unknown', description: 'File too small' };
  
  // Magic bytes check
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

  // Check text / scripts
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
    ['01_binary_overview', 'High-level binary identification, headers, sections & imports'],
    ['02_native_api_investigation', 'System call tracing, Win32/POSIX API boundary inspection'],
    ['03_deep_function_analysis', 'Control flow graph (CFG), loops, decompilation & variables'],
    ['04_feature_tracing', 'Follow high-level user actions down to machine code routines'],
    ['05_cross_platform_call_path', 'Map execution flow between cross-platform layers (JS to C++)'],
    ['06_ui_action_tracing', 'Trace clicks, keypresses, and UI event listeners to business logic'],
    ['07_native_ui_state_observation', 'Inspect native widget trees, window hierarchies, and view models'],
    ['08_native_call_observation', 'Runtime API interception via Frida / dynamic hooks'],
    ['09_macho_deep_inspection', 'Deep dive into macOS/iOS Mach-O load commands, LC_LOAD_DYLIB'],
    ['10_cross_architecture_comparison', 'Differential analysis between x86_64 and ARM64 binaries'],
    ['11_swift_demangling_type_analysis', 'Recover Swift structs, classes, protocols and nominal types'],
    ['12_complete_apple_app_reconstruction', 'Full Apple bundle reconstruction (Assets, plists, Storyboards)'],
    ['13_apple_managed_boundary_analysis', 'Swift / Objective-C runtime bridge & selector mapping'],
    ['14_apple_runtime_reconciliation', 'Reconcile static disassembler findings with live runtime heap'],
    ['15_frida_dynamic_instrumentation', 'Automated Frida script injection and payload extraction'],
    ['16_debugger_session_orchestration', 'Headless GDB / Rizin / LLDB session automation']
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
    { name: 'Ripgrep (rg)', cmd: 'rg --version' },
    { name: 'Git', cmd: 'git --version' },
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
  console.log('\nDoctor evaluation complete.\n');
}

// CLI Arg Parsing
const args = process.argv.slice(2);
const command = args[0] || 'help';

switch (command) {
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
