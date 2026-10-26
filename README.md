# OmniREA: Two-Tier Autonomous Reverse Engineering Framework

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![NPM Version](https://img.shields.io/badge/npm-v1.0.0-cb3837.svg)](https://www.npmjs.com/package/omnirea)
[![Architecture](https://img.shields.io/badge/Architecture-Two--Tier%20Hybrid-orange.svg)](#the-two-tier-architecture)
[![Upstream Heritage](https://img.shields.io/badge/Ancestors-398k%2B%E2%98%85%20Combined-yellow.svg)](#acknowledgments--upstream-projects)

</div>

---

## Table of Contents
- [The Actual Problem](#the-actual-problem)
- [The Two-Tier Architecture](#the-two-tier-architecture)
- [Empirical Benchmarks (Local Machine Measurements)](#empirical-benchmarks-local-machine-measurements)
- [1-Click Turnkey AI Assistant Setup](#1-click-turnkey-ai-assistant-setup)
- [Manual Copy-and-Paste MCP Configuration](#manual-copy-and-paste-mcp-configuration)
- [3 Ready-to-Paste Agent Magic Prompts](#3-ready-to-paste-agent-magic-prompts)
- [Standalone Terminal Commands](#standalone-terminal-commands)
- [The Two Tiers in Detail](#the-two-tiers-in-detail)
- [The 16 REAP Domain Playbooks](#the-16-reap-domain-playbooks)
- [Output Standard: The Tri-Bucket Format](#output-standard-the-tri-bucket-format)
- [Acknowledgments & Upstream Projects](#acknowledgments--upstream-projects)
- [License](#license)

---

## The Actual Problem

Most AI reverse engineering setups right now hit one of two walls:

1. **The MCP Token Dump**: You load an MCP server with 200+ tools. Before your agent even reads the first byte of your binary, **372,000 tokens of JSON schema** are dumped into the prompt. Turns get sluggish, queries cost \$0.10 to \$0.30 each, and the context window runs out of room before you reach the actual logic.
2. **The Dumb Grep Trap**: You strip away all tools and rely entirely on `strings` and `grep`. It works great for finding an unencrypted API key in two seconds—until you hit obfuscated control flow, custom XOR ciphers, or an ARM64-to-x86 bridge where regex simply cannot tell you if two functions do the same thing.

**OmniREA exists to stop picking between those extremes.** 

It sets up an intelligent **Two-Tier Pipeline**: 80% of routine triage (unpacking ASARs, checking headers, finding strings, dumping PE exports) runs locally through fast terminal commands with **zero tool schema overhead**. When you hit a routine that actually needs decompilation, CFG analysis, or register-level proof, the agent escalates to Tier 2 with Ghidra and Unicorn CPU emulation.

```mermaid
flowchart TD
    Target[Target Binary / APK / Electron / Bundle] --> Router{Complexity & Task Check}
    
    subgraph Tier1 [Tier 1: Fast Path - Zero-MCP CLI]
        Router -->|Triage / Strings / Endpoints / Version| FastPath[Native Terminal Recon]
        FastPath --> TriageDone[Fast Answers: 0 MCP Token Overhead, ~1-2 Turns]
    end
    
    subgraph Tier2 [Tier 2: Deep Path - ReAgent + REA MCP]
        Router -->|Decompilation / CFG / Structs / Cryptanalysis| Escalate[Escalate to Heavy Engine]
        Escalate --> MCP[REA MCP + IDA / Ghidra / Frida]
        MCP --> Parity[11-Signal Parity Verification & Differential Emulation]
    end
    
    TriageDone -.->|Need Formal Proof?| Escalate
```

---

## Empirical Benchmarks (Local Machine Measurements)

Measured directly on Windows 11 (AMD Ryzen 7, Node.js v22) across real binary and source targets. Anyone can verify and reproduce these measurements locally by running `npm run bench`:

| Operation & Target | Monolithic Heavy REA MCP | OmniREA Tier-1 Fast Path | Measured Difference |
| :--- | :---: | :---: | :---: |
| **Tool Schema Prompt Overhead** | 836.9 KB JSON (~372,600 tokens) | **0.0 KB (0 tokens)** | **100% token elimination** |
| **PE Binary Triage (`cmd.exe` - 339 KB)** | Ingests 213 tool schemas + disassembler | **61.8 – 78.8 ms** (`omnirea scan`) | **Instant (<80ms)** (structured JSON payload) |
| **Credential & Endpoint Triage (`server.js`)** | Ingests 213 tool schemas + AST relations | **60.2 – 77.7 ms** (`omnirea triage`) | **Instant (<80ms)** (structured JSON payload) |
| **Payload Size Delivered to AI** | Megabytes of tool schemas & AST nodes | **261 – 1,543 bytes structured JSON** | **99.9% smaller payload** |

*All timings are 5-pass local performance averages measured with `performance.now()` in Node.js via `scripts/benchmark.mjs`.*

---

## 1-Click Turnkey AI Assistant Setup

You can wire OmniREA directly into **Google Antigravity**, **Cursor IDE**, **Claude Code**, or **Claude Desktop** with one command:

```bash
# Auto-detects your environment and installs everything:
npx omnirea setup
```

Or target your specific setup explicitly:
```bash
npx omnirea setup antigravity   # Copies 213 REA tool schemas + 3 skills to ~/.gemini/
npx omnirea setup cursor        # Deploys .cursorrules & configures .cursor/mcp.json
npx omnirea setup claude        # Deploys CLAUDE.md & configures claude_desktop_config.json
npx omnirea setup workspace     # Configures the current repository directory
```

### What gets installed:
1. **213 REA Tool Schemas**: Bundled directly in `mcp/rea/`. Covers PE resources, AST dataflow, Frida scripts, Mach-O loaders, and Android APK inspection.
2. **3 Agent Skills**: Installed into your agent's brain (`omnirea`, `lean-recon`, `deep-verify`).
3. **9 In-Depth Domain Reference Manuals**: Located in `skills/omnirea/references/` (covering Android, Electron, PE/ELF/Mach-O, Frida, and ReAgent).
4. **16 REAP Domain Playbooks**: Pre-formatted tactical workflows for games, firmware, kernel drivers, and WebAssembly.
5. **AI Behavioral Rules**: `.cursorrules` and `CLAUDE.md` to force the AI to triage with fast CLI tools first before firing up heavy disassemblers.

---

## Manual Copy-and-Paste MCP Configuration

If you prefer to configure your AI assistant manually rather than using `npx omnirea setup`:

### Cursor IDE (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "rea": {
      "command": "npx",
      "args": ["-y", "@morluto/rea"],
      "description": "OmniREA Live Reverse Engineering Server (213 Tools)"
    }
  }
}
```

### Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "rea": {
      "command": "npx",
      "args": ["-y", "@morluto/rea"]
    }
  }
}
```

### Google Antigravity & Gemini CLI
Copy the bundled `mcp/rea/` directory directly into:
* Windows: `%USERPROFILE%\.gemini\antigravity\mcp\rea`
* macOS/Linux: `~/.gemini/antigravity/mcp/rea`

---

## 3 Ready-to-Paste Agent Magic Prompts

Copy and paste these prompts directly into Cursor, Claude, or Antigravity for instant results:

### 1. Instant Application Triage
```markdown
Analyze the main components, entry points, and high-confidence attack surface of <target>. 
Separate your findings into Confirmed Facts (with Evidence IDs), Inferences, and Residual Unknowns. 
Do not execute the binary.
```

### 2. Secret & Endpoint Hunting
```markdown
Scan <target> for hardcoded credentials, authorization headers, private API routes, and cloud storage URLs. 
Provide the exact string window with 50 characters of surrounding context and file offsets.
```

### 3. Clean-Room Algorithmic Reconstruction
```markdown
Decompile the logic of <target_function> from <target_binary> and reconstruct it in clean-room Python. 
Generate a CLONE_SPEC.md document verifying behavioral equivalence against the 11 ReAgent parity signals, 
including register calling conventions and differential CPU emulation output.
```

---

## Standalone Terminal Commands

If you don't use an AI agent, you can run the CLI tools directly:

```bash
# Detect file magic, architecture, format, and hashes
npx omnirea scan ./target-binary.exe

# Extract leaked API keys, tokens, endpoints, and IPs in <1s
npx omnirea triage ./app.asar

# Tier-2: 11-signal ReAgent formal parity audit & constraint solver
npx omnirea verify ./bundle.js

# Audit your machine for disassemblers, compilers, and toolchains
npx omnirea doctor

# List all 16 domain playbooks
npx omnirea playbooks
```

---

## The Two Tiers in Detail

### Tier 1: Fast CLI Reconnaissance (Zero MCP Overhead)
Most reverse engineering tasks are reconnaissance. Tier 1 handles:
* **Magic Byte Identification**: Instant PE, ELF, Mach-O, WASM, SQLite, and ZIP detection.
* **Windowed String Extraction**: Never dumps entire files into context. Uses regex window slicing (`.{0,100}NEEDLE.{0,100}`) to capture surrounding code context without token blowup.
* **Hidden Folder Discovery**: Uses `rg -uu` to uncover hidden `.vite/` and `.webpack/` build trees in Electron apps.
* **Cross-Platform Matrix**: Includes native commands for Windows PowerShell (`dumpbin`, `Select-String`), Linux (`readelf`, `nm`), and macOS (`otool`, `plutil`).

👉 *See [cheatsheets/cross-platform-cli.md](cheatsheets/cross-platform-cli.md) for the complete command cheat sheet.*

### Tier 2: Deep Formal Verification (ReAgent + REA MCP)
When you need to decompile an obfuscated function or prove that clean-room Python or C++ code behaves identically to the original binary:
* **Live REA MCP Server**: Interacts directly with `@morluto/rea` (213 tools).
* **The 11 ReAgent Verification Signals**:
  1. CFG topology & loop invariants
  2. Calling convention & register usage
  3. Stack frame layout & local variable offsets
  4. Memory read/write access patterns
  5. API call sequence order
  6. Return code & exception handling parity
  7. Cryptographic constant matching
  8. Endianness & bit-shifting precision
  9. Floating-point rounding parity
  10. Dynamic timing & branching consistency
  11. Unicorn CPU differential emulation (fuzzing registers side-by-side)
* **Deliverable Artifact**: Produces a structured `CLONE_SPEC.md` with complete type signatures, data structures, and equivalence test harnesses.

👉 *See [skills/deep-verify/SKILL.md](skills/deep-verify/SKILL.md) for full verification protocol details.*

---

## The 16 REAP Domain Playbooks

| # | Playbook | Focus Area |
|---|---|---|
| **01** | [`01_getting_started.md`](playbooks/01_getting_started.md) | First look at an unfamiliar app, attack surface & entry points |
| **02** | [`02_feature_tracing.md`](playbooks/02_feature_tracing.md) | Follow UI button clicks down to backend logic & syscalls |
| **03** | [`03_native_binary_exploration.md`](playbooks/03_native_binary_exploration.md) | Deep triage of PE, ELF, and Mach-O executables |
| **04** | [`04_software_cloning_and_parity.md`](playbooks/04_software_cloning_and_parity.md) | Clean-room reconstruction & 11-signal ReAgent parity |
| **05** | [`05_game_logic_and_assets.md`](playbooks/05_game_logic_and_assets.md) | Unity IL2CPP, Unreal Engine PAKs & game logic recovery |
| **06** | [`06_wasm_portability.md`](playbooks/06_wasm_portability.md) | WebAssembly decompilation and browser portability |
| **07** | [`07_firmware_and_embedded.md`](playbooks/07_firmware_and_embedded.md) | IoT firmware triage, SquashFS extraction & memory maps |
| **08** | [`08_android_and_mobile.md`](playbooks/08_android_and_mobile.md) | APK auditing, JNI native library tracing & SSL unpinning |
| **09** | [`09_kernel_and_drivers.md`](playbooks/09_kernel_and_drivers.md) | Windows `.sys` / Linux `.ko` driver and IOCTL surface analysis |
| **10** | [`10_vulnerability_research.md`](playbooks/10_vulnerability_research.md) | 1-day patch diffing, memory corruption sinks & crash triage |
| **11** | [`11_electron_and_javascript.md`](playbooks/11_electron_and_javascript.md) | ASAR bundle extraction, contextBridge audit & AST dataflow |
| **12** | [`12_anti_cheat_and_licensing.md`](playbooks/12_anti_cheat_and_licensing.md) | Defensive analysis of DRM, licensing, and anti-cheat checks |
| **13** | [`13_hardware_and_dma_analysis.md`](playbooks/13_hardware_and_dma_analysis.md) | PCIe TLP sniffing, IOMMU protection & FPGA firmware |
| **14** | [`14_protection_and_cryptanalysis.md`](playbooks/14_protection_and_cryptanalysis.md) | Defeating packers, string decryption & custom cipher recovery |
| **15** | [`15_version_diffing_and_crashes.md`](playbooks/15_version_diffing_and_crashes.md) | Cross-architecture diffing (x86_64 vs ARM64) |
| **16** | [`16_mcp_and_agent_toolchains.md`](playbooks/16_mcp_and_agent_toolchains.md) | Replicating closed-source AI agent toolchains & MCP servers |

---

## Output Standard: The Tri-Bucket Format

Every OmniREA report strictly separates findings into:
1. **Confirmed Facts**: Observed directly in decompiled AST, binary bytes, or headers (citing byte offsets or Evidence IDs).
2. **Inferences**: Hypotheses deduced from observed patterns or naming conventions.
3. **Residual Unknowns**: Unverified code paths, packed blobs, or remaining gaps.

---

## Acknowledgments & Upstream Projects

OmniREA is built upon the pioneering work of four open-source projects. For detailed attributions, see [ATTRIBUTIONS.md](ATTRIBUTIONS.md). All upstream licenses are respected under the MIT License:

* **[morluto/rea](https://github.com/morluto/rea)** (MIT License): Created the original 207-tool Reverse Engineering Anything MCP server and evidence bundle architecture.
* **[Dryxio/reagent](https://github.com/Dryxio/reagent)** (MIT License): Developed the 11-signal parity framework, formal C/C++ reconstruction loop, and Unicorn differential CPU emulation.
* **[JoasASantos/REA-Prompts](https://github.com/JoasASantos/REA-Prompts)** (MIT License): Authored the original 16 REAP investigation prompt templates and the tri-bucket reporting standard.
* **[aicodeking/leanrea](https://github.com/aicodeking/leanrea)** (MIT License): Proved that fast-path zero-MCP CLI reconnaissance saves 38% wall time and 60% tokens on triage queries.

---

## Contributing

Contributions, domain playbooks, and improvements are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before opening a pull request.

---

## License

OmniREA is open-source software licensed under the [MIT License](LICENSE). See [ATTRIBUTIONS.md](ATTRIBUTIONS.md) for third-party acknowledgments.
