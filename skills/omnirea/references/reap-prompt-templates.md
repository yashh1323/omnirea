# REAP: Complete Investigation Templates & Intent Playbook

This reference provides the **complete, exhaustive collection of all 16 template domains and prompt patterns** from **REAP (REA Investigation Prompts)** by Joas A. Santos.

When the user asks to reverse engineer, inspect, decompile, clone, audit, or port any software, match their intent to the corresponding section below, adopt its prompt structure, query the relevant REA MCP tools, and format the response according to the REAP standard.

---

## The Non-Negotiable REAP Rules

1. **One Feature Per Pass**: Narrow requests get concrete call chains and byte addresses; broad requests get shallow overviews.
2. **Mandatory Evidence Citations**: Every conclusion must cite its proof (file, function name, hex address, byte offset, or Evidence ID).
3. **Tri-Bucket Deliverable Format**: Always separate findings into:
   - **Confirmed Facts**: Directly observed in decompiled code, AST, or binary bytes.
   - **Inferences**: Deduced hypotheses supported by observed patterns.
   - **Residual Unknowns**: Unresolved gaps or unverified code paths.
4. **Static-First Safety**: "Do not execute the application in this step" unless runtime scenario observation is explicitly required.
5. **Concrete Deliverable**: Conclude with a tangible artifact (`CLONE_SPEC.md`, standalone reader/parser script, test harness, or clean-room implementation).

---

## Complete Index of Templates

| # | Section | Key Intent & Triggers |
|---|---|---|
| **1** | [Getting Started](#1-getting-started) | First look at an unfamiliar app, introductory tracing |
| **2** | [Feature Tracing (Any Program)](#2-feature-tracing-any-program) | Explain one feature, trace button to effect, recover logic rule |
| **3** | [Native Binary Exploration](#3-native-binary-exploration) | Triage map, function deep-dive, file format RE, wire protocol/serialization extraction |
| **4** | [Software & Feature Cloning](#4-software--feature-cloning) | Clean-room `CLONE_SPEC.md`, feature clone, validation with `verify_reconstruction`, UI/UX cloning |
| **5** | [Games](#5-games) | Gameplay logic recovery, speed/difficulty rules, engine/asset pipeline, offline single-player mod |
| **6** | [Game Portability to WASM](#6-game-portability-to-wasm) | Port game to browser, WASM port plan, headless simulation core extraction |
| **7** | [Firmware & Embedded](#7-firmware--embedded) | Firmware image triage, MCU/IoT binary analysis, embedded protocol & OTA update review |
| **8** | [Android](#8-android) | APK audit, Java/Kotlin to JNI native tracing, storage/crypto/secrets, obfuscated/packed triage |
| **9** | [Kernel Analysis](#9-kernel-analysis) | Driver inspection (.sys/.ko), IOCTL attack surface enumeration, syscall subsystem behavior |
| **10** | [Vulnerability Research](#10-vulnerability-research) | Trust-boundary audit, untrusted input sink hunt, patch diffing (1-day), crash triage, data handling audit |
| **11** | [Electron & JavaScript](#11-electron--javascript) | Electron anatomy, IPC & contextBridge security review, minified JS tracing, web feature mapping, site clone |
| **12** | [Anti-Cheat & Protection Research](#12-anti-cheat--protection-research) | Detection surface mapping, testing own protections, DRM/licensing flow analysis |
| **13** | [DMA & Hardware-Assisted Research](#13-dma--hardware-assisted-cheat-research-defensive) | PCIe/IOMMU memory restrictions, DMA cheat toolchain analysis, detection-gap analysis, FPGA firmware |
| **14** | [Software Cracking & Protection Research](#14-software-cracking-research) | Documenting validation algorithms (no bypass), crackme/CTF solving, protection diffing |
| **15** | [Version Comparison & Crash Work](#15-version-comparison--crash-work) | Version diffing with `compare_application_versions` |
| **16** | [Long-Running Investigations](#16-long-running-investigations) | Resuming investigations, `INVESTIGATION.md`, tracking residual unknowns |
| **17** | [CLI & MCP Server Agent Toolchains](#17-cli--mcp-server-agent-toolchains) | MCP server JSON-RPC extraction, CLI flag & dry-run recovery, cloud bypass, zero-token clean-room local replicas |
| — | [The Wildcard Prompt](#wildcard-prompt-start-here) | General, ambiguous, or multi-faceted targets |

---

## 1. Getting Started

### 1.1 First Look at an Unfamiliar App
* **User Intent**: User supplies a new program and wants a quick overview.
* **Template Pattern**:
  Map the main components, entry points, and the three most interesting features worth investigating first. Keep it short and cite evidence for each claim.
* **Tools**: `open_binary`, `binary_overview`, `analyze_javascript_application`.

### 1.2 Trace an Action Flow (e.g. Export / Save)
* **User Intent**: User wants to follow an action like "Export CSV" from trigger to disk write.
* **Template Pattern**:
  Trace the flow from the action trigger down to the file write or network transmission. Show where output files are created, which fields they contain, and the functions that prove each step.

---

## 2. Feature Tracing (Any Program)

### 2.1 Explain One Feature
* **User Intent**: Understand how a specific capability works in any desktop or mobile app.
* **Template Pattern**:
  Identify entry points, functions involved, data flow, dependencies, and observable effects. For every conclusion, cite file, function, address, or snippet. Separate confirmed facts from inferences. Do not execute the binary.

### 2.2 Trace a Button to Its Effect
* **User Intent**: Trace from UI click to backend result.
* **Template Pattern**:
  Start at the `<button name>` handler and trace what happens until the result is written, sent, or displayed. Name every module or function on the path and explain its responsibility.

### 2.3 Recover a Rule and Rebuild It
* **User Intent**: Extract business logic and write a minimal working replica.
* **Template Pattern**:
  Find the rule controlling `<behaviour>`. Write the rule in plain words, build a minimal standalone version in `<language>`, and provide test inputs proving equivalence.

---

## 3. Native Binary Exploration

### 3.1 Executable Understanding
* **User Intent**: In-depth triage of an EXE, DLL, Mach-O, or ELF binary.
* **Template Pattern**:
  Identify format, architecture, runtime, linked libraries, interesting strings, and candidate entry points. Group components by capability. State available analysis engines and limitations.

### 3.2 Function Deep-Dive
* **User Intent**: Understand one complex function or algorithm.
* **Template Pattern**:
  Produce decompiled pseudocode, caller and callee hierarchies, data structures read/written, and every global touched. Annotate each finding with the address range proving it.
* **Tools**: `analyze_function`, `procedure_pseudo_code`, `procedure_callers`, `procedure_callees`, `xrefs`.

### 3.3 Imports, Strings, and Triage Map
* **User Intent**: Map capabilities and attack surface of a binary.
* **Template Pattern**:
  Generate a triage map: section layout, linked imports grouped by capability (network, filesystem, crypto, process/thread, registry/IPC), strings with addresses, candidate entry points, and flags for packing or obfuscation.

### 3.4 File-Format Reverse Engineering
* **User Intent**: Decouple a proprietary file extension or format.
* **Template Pattern**:
  Describe the file structure field by field (offsets, sizes, types, endianness), show where each field is parsed in code, and write a standalone Python/TypeScript parser script that prints a sample file.

### 3.5 Protocol / Serialization Extraction
* **User Intent**: Reverse engineer wire formats or IPC payloads.
* **Template Pattern**:
  Recover wire format used for network or IPC traffic. Show marshal/unmarshal routines with addresses, list every field, and produce a struct/proto definition plus sample message.

---

## 4. Software & Feature Cloning

### 4.1 Full Application Clone (Clean-Room Behavioral)
* **User Intent**: Build a spec to re-implement an app cleanly from scratch.
* **Template Pattern**:
  Produce `CLONE_SPEC.md` covering: all user-visible features, state machines, inputs/outputs, edge cases, file/network protocols, persistence layout, and error behaviors. Cite evidence for every requirement; mark unconfirmed items as UNKNOWN. Do not copy proprietary code.

### 4.2 Clone One Feature into User's Project
* **User Intent**: Re-implement a single feature in TypeScript, Python, Go, Rust, or C#.
* **Template Pattern**:
  Recover exact behavior: trigger, inputs, transformations, outputs, side effects, and failure modes. Implement from scratch matching behavior, with tests derived from recovered rules.

### 4.3 Validate a Clone Against the Original
* **User Intent**: Compare user's re-implementation against target binary.
* **Template Pattern**:
  Compare implementation with observed behavior using `evaluate_reconstruction_coverage` and `compare_source_to_bundle`. Check results, error states, and limits. Present passing cases and divergences.

### 4.4 UI/UX Behavior Cloning Without Assets
* **User Intent**: Replicate interaction model, shortcuts, and layout without copying branding.
* **Template Pattern**:
  Document interaction model: layout logic, keyboard shortcuts, command dispatch, undo/redo semantics, and clipboard formats. Recreate behavior in user's framework matching documented semantics.

---

## 5. Games

### 5.1 Gameplay Logic Recovery
* **User Intent**: Understand movement, physics, scoring, or spawning.
* **Template Pattern**:
  Recover gameplay logic from binary and test against original. For each mechanic, show function, constants, and update loop proving the rule.

### 5.2 Speed / Difficulty Curves
* **User Intent**: Extract pacing, difficulty scaling, or drop rates.
* **Template Pattern**:
  Extract exact rule and constants controlling speed/difficulty progression over time. Build standalone version with adjustable parameters.

### 5.3 Engine & Asset Pipeline Map
* **User Intent**: Identify game engine and asset serialization.
* **Template Pattern**:
  Identify engine, render loop, update/tick cycle, level/asset serialization, and gameplay data locations. Map pipeline step by step.

### 5.4 Single-Player Mod & Value Locating
* **User Intent**: Locate data tables for offline single-player experimentation.
* **Template Pattern**:
  Locate code controlling stats, spawn rates, or economy in offline game. Show data tables and functions with addresses.

---

## 6. Game Portability to WASM

### 6.1 Port a Native Game to Browser
* **User Intent**: Evaluate game for WASM compilation.
* **Template Pattern**:
  Map: main loop, frame pacing, rendering backend (OpenGL/DirectX/SDL/Vulkan), filesystem/save paths, threading, and audio. Classify each as: portable as-is, needs shim, or must be rewritten.

### 6.2 Build the Port Plan
* **User Intent**: Create step-by-step roadmap for web port.
* **Template Pattern**:
  Deliver toolchain choice (Emscripten vs manual recompile), required shims (GL->WebGL, SDL->SDL2-compat), IndexedDB save migration, performance risk mitigations, and milestones.

### 6.3 Headless Simulation Core Extraction
* **User Intent**: Extract pure simulation logic compiled to WASM.
* **Template Pattern**:
  Isolate pure simulation logic (physics, AI, rules) from rendering/OS calls. Implement logic core in C/Rust compiled to WASM with test harness replaying recorded inputs.

---

## 7. Firmware & Embedded

### 7.1 Firmware Image Triage
* **User Intent**: Inspect `.bin`, `.img`, or flash dump.
* **Template Pattern**:
  Identify container format, extract partitions (SquashFS, JFFS2, UBI), map regions to architecture/load addresses, locate kernel/rootfs, and list init scripts.

### 7.2 MCU / IoT Binary Analysis
* **User Intent**: Inspect ARM Cortex-M, ESP32, AVR, or MIPS firmware.
* **Template Pattern**:
  Find vector table and reset handler, reconstruct memory map from literal pools and peripheral base addresses, identify RTOS fingerprints, and map driver loops.

### 7.3 Embedded Protocol & OTA Update Review
* **User Intent**: Recover network endpoints, credentials, and update integrity checks.
* **Template Pattern**:
  Recover network stack usage (endpoints, ports), OTA update verification (URL, signature check, flash write), and hardcoded credential material.

---

## 8. Android

### 8.1 Audit an APK
* **User Intent**: Static security and privacy audit of an Android app.
* **Template Pattern**:
  List declared permissions, exported components, tracking SDKs, domains, and local storage mechanisms. Cite class, method, or file for every finding.

### 8.2 Trace a Feature Through Java/Kotlin and Native Code
* **User Intent**: Follow Android feature across JNI boundaries.
* **Template Pattern**:
  Trace UI entry point (Activity/Composable) $\rightarrow$ Java/Kotlin call chain $\rightarrow$ JNI boundaries (`RegisterNatives`) $\rightarrow$ `.so` native functions $\rightarrow$ final sink (HTTP, storage).

### 8.3 Storage, Crypto, and Secrets Review
* **User Intent**: Verify encryption at rest, keystores, and hardcoded secrets.
* **Template Pattern**:
  Determine storage mechanism (SharedPreferences, SQLite, Room, Keystore). Recover embedded crypto routines (hardcoded keys, obfuscation) with class/method evidence.

### 8.4 Obfuscated / Packed App Triage
* **User Intent**: Unpack or analyze heavily protected APK.
* **Template Pattern**:
  Identify packer/protector fingerprints, map statically visible vs runtime-deferred code, and propose minimal safe steps to reach real dex/native code.

---

## 9. Kernel Analysis

### 9.1 Driver Inspection (Windows .sys / Linux .ko)
* **User Intent**: Understand kernel driver responsibilities and dispatch tables.
* **Template Pattern**:
  Identify target OS version, driver entry/init routine, device objects, dispatch table, IOCTL codes with buffer validations, registered callbacks, and external memory accesses. Static only.

### 9.2 IOCTL Attack-Surface Enumeration
* **User Intent**: Audit driver control codes for vulnerabilities.
* **Template Pattern**:
  Enumerate all IOCTL codes handled: handler functions, input/output buffer validation (probe methods, size checks), and unsafe memory copies. Rank handlers by risk.

### 9.3 Kernel Subsystem / Syscall Behavior
* **User Intent**: Trace system call execution flow.
* **Template Pattern**:
  Trace from syscall dispatch entry to parsing routines, bounds checks, data structures populated, and error paths. Cite addresses for each step.

---

## 10. Vulnerability Research

### 10.1 Trust-Boundary Audit
* **User Intent**: Identify potential security vulnerabilities.
* **Template Pattern**:
  Review input origins, sensitive operations, code paths, preconditions, and impact. Distinguish hypotheses from confirmed vulnerabilities with evidence.

### 10.2 Sink Hunt from Untrusted Input
* **User Intent**: Source-to-sink vulnerability tracing.
* **Template Pattern**:
  List untrusted inputs (sockets, files, IPC, command-line) and follow each to dangerous sinks (`memcpy`, `strcpy`, `system`, `exec`, dynamic loading, deserialization). Show validation between source and sink.

### 10.3 Patch Diffing (1-Day to Incomplete-Fix Hunting)
* **User Intent**: Compare vulnerable vs patched binary.
* **Template Pattern**:
  Diff security-relevant functions: what check was added, where else the pattern exists unfixed, and whether all callers are protected.

### 10.4 Crash Triage to Root Cause
* **User Intent**: Diagnose crash dump or reproduction log.
* **Template Pattern**:
  Relate error/registers to functions involved, formulate hypotheses, cite supporting evidence, and propose minimal experiment to validate the cause.

### 10.5 Data Handling & Privacy Audit
* **User Intent**: Trace how personal/sensitive data is processed.
* **Template Pattern**:
  Locate where sensitive data is stored or transmitted. Verify encryption at rest and in transit, and list concrete risks with evidence.

---

## 11. Electron & JavaScript

### 11.1 Electron App Anatomy
* **User Intent**: Full map of an Electron application.
* **Template Pattern**:
  Locate JS files and `app.asar`. Map main, renderer, preload scripts, and IPC channels. Trace target feature from UI to implementation.

### 11.2 IPC & contextIsolation Security Review
* **User Intent**: Audit Electron IPC security.
* **Template Pattern**:
  Enumerate `ipcMain` handlers and `contextBridge` exposed channels. Check arguments and flag unvalidated paths to `shell.openExternal`, `child_process`, or `fs`.

### 11.3 Minified / Bundled JS Feature Tracing
* **User Intent**: Reverse engineer webpack/minified bundles.
* **Template Pattern**:
  Identify module boundaries, recover readable function names, follow data flow from UI to network/storage effect, and cite bundle offsets.

### 11.4 Web Feature Mapping
* **User Intent**: Observe website feature in browser.
* **Template Pattern**:
  Map network requests, scripts, and state changes involved in a web feature. Summarize client-side vs server-side responsibilities.

### 11.5 Website Clone (Structure + Behavior)
* **User Intent**: Rebuild web interface cleanly.
* **Template Pattern**:
  Recover page structure, client routes, API calls per view, and state management pattern. Rebuild equivalent with user's assets and styling.

---

## 12. Anti-Cheat & Protection Research

### 12.1 Map an Anti-Cheat's Detection Surface
* **User Intent**: Defensive study of game security services.
* **Template Pattern**:
  Identify what driver enumerates (processes, handles, callbacks), integrity checks performed, kernel hooks, and telemetry payloads sent out.

### 12.2 Test My Own Product's Protections
* **User Intent**: Assess security of user's own software.
* **Template Pattern**:
  Locate license check, integrity checks, anti-debug/anti-VM tricks, and trace failed check behaviors. Report easily bypassable vs load-bearing checks with fixes.

### 12.3 DRM / License Flow Analysis
* **User Intent**: Document entitlement checks for interoperability.
* **Template Pattern**:
  Document licensing flow: entitlement validation, local/remote checks, disk state, and offline behavior. Report facts with evidence.

---

## 13. DMA & Hardware-Assisted Cheat Research (Defensive)

### 13.1 DMA Memory Access on Target Platform
* **User Intent**: Defensive hardware security research.
* **Template Pattern**:
  Explain how platform restricts PCIe reads (IOMMU, Thunderbolt ACLs, kernel DMA protection), what anti-cheat enumerates (PCIe topology, BARs), and check effectiveness.

### 13.2 Analyze DMA Cheat Toolchain Sample
* **User Intent**: Malware/threat research on physical memory reader sample.
* **Template Pattern**:
  Document how sample accesses physical memory, locates target process (PEB walking, page-table traversal), and anti-detection techniques. Static analysis only.

### 13.3 Detection-Gap Analysis for Own Product
* **User Intent**: Harden application against external memory readers.
* **Template Pattern**:
  Evaluate application reaction to physical memory access: integrity checks, sensitive value predictability, and propose hardening (memory layout randomization, value obfuscation).

### 13.4 FPGA / Microcontroller Device Firmware Study
* **User Intent**: Reverse engineer PCIe/USB MCU firmware dump.
* **Template Pattern**:
  Identify MCU/FPGA soft-core, host communication protocol, memory-read primitives, and enumeration-hiding tricks.

---

## 14. Software Cracking Research

### 14.1 Keygen-Repair Style Analysis (Document, Don't Bypass)
* **User Intent**: Document validation routine without patching.
* **Template Pattern**:
  Find validation routine for license/serial. Decompile algorithm, identify input encoding, checksum/transform steps, and branch addresses. Write test harness exercising algorithm. Do not patch or bypass checks.

### 14.2 Crackme / CTF Challenge Solving
* **User Intent**: Solve reverse engineering puzzle/CTF.
* **Template Pattern**:
  Enumerate entry points, strings, imports, and packers. Identify flag-checking logic, decompile it, and derive correct input with full address-to-instruction proof.

### 14.3 Protection-Diffing Between Versions
* **User Intent**: Track security hardening between versions.
* **Template Pattern**:
  Compare protected app v1 and v2. Identify added integrity checks, anti-debug tricks, and changed validation paths.

---

## 15. Version Comparison & Crash Work

### 15.1 Compare Two Application Versions
* **User Intent**: Diff two versions of a binary or application.
* **Template Pattern**:
  Compare old and new versions using `compare_application_versions` and `compare_bundles`. Identify functional changes, API shifts, dependency changes, and security fixes.

---

## 16. Long-Running Investigations

### 16.1 Continue Where You Left Off
* **User Intent**: Resume an unfinished investigation.
* **Template Pattern**:
  Review existing evidence and session notes. Query `audit_residual_unknowns` to list unproven hypotheses. Prioritize next passes to reduce uncertainty and update `INVESTIGATION.md`.

---

## 17. CLI & MCP Server Agent Toolchains

### 17.1 MCP Server Disassembly & Tool Contract Extraction
* **User Intent**: Deconstruct a proprietary or packaged MCP server (`npm`, `pip`, binary) to discover its tool names, input schemas, handler logic, and data flow.
* **Template Pattern**:
  Analyze the MCP server package entry point. Extract all registered tool names, their Zod/JSON input schemas, parameter descriptions, and response formats. Map handler dispatchers to local functions or external cloud endpoints.
* **Tools**: `analyze_javascript_application`, `inspect_artifact`, `search_strings`.

### 17.2 Cloud Dependency Decoupling & Offline Bypasses
* **User Intent**: Break cloud lock-in by discovering hidden testing flags, bypassing mandatory API keys, and recovering prompt templates.
* **Template Pattern**:
  Decompile CLI argument parsers and network dispatchers. Identify hidden flags (e.g., `--dry-run`, `--mock`, `--plan-from`), trace environment variable overrides, and extract embedded prompt templates/schemas so cloud LLM dependencies can be replaced by local agent skills.

### 17.3 Clean-Room Zero-Cloud Server Synthesis
* **User Intent**: Build a 100% offline, local-first, zero-token replacement MCP server conforming to the discovered tool contract.
* **Template Pattern**:
  Synthesize a standalone, dependency-free stdio JSON-RPC 2.0 MCP server implementing the extracted tool specifications. Implement deterministic execution engines (e.g., Playwright automation, compiler) that run locally with $0 token cost on replay.

### 17.4 Target Verification & Conformance Testing
* **User Intent**: Validate that the clean-room replica is indistinguishable from the original toolchain.
* **Template Pattern**:
  Run official ecosystem linters and validators against generated plans/outputs. Perform dry-run and live end-to-end execution against a reference application to prove 100% functional parity and resilience.

---

## Wildcard Prompt (Start Here)

* **User Intent**: Any general, ambiguous, or multi-faceted reverse-engineering request.
* **Template Pattern**:
  Discover available tools, start with static analysis, trace down to responsible functions, separate facts from hypotheses in Tri-Bucket format, and conclude with behavioral specification and verification tests.
