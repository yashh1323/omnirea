---
name: omnirea
description: Two-tier autonomous reverse engineering framework. Routes between Tier 1 (fast CLI recon with zero token bloat) and Tier 2 (formal ReAgent decompilation and CPU emulation parity).
---

# OmniREA: Two-Tier Autonomous Reverse Engineering Framework

OmniREA is an intelligent reverse-engineering routing framework. It eliminates unnecessary MCP token bloat (saving up to 60% of LLM context) while guaranteeing mathematical and semantic parity when deep binary reconstruction is required.

---

## The Two-Tier Architecture

```
                    ┌───────────────────────────┐
                    │  Incoming Target / Binary │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
               ┌─────────────────────────────────────┐
               │ Tier 1: Fast CLI Recon (Zero-MCP)   │
               │  - Magic bytes, hashes, format      │
               │  - Windowed regex string search     │
               │  - Section layout & imports/exports │
               │  - ASAR / Zip / APK asset unpacking │
               └──────────────────┬──────────────────┘
                                  │
                  Can Tier 1 answer the question?
                         ├── YES ──► Output Confirmed Facts (0 MCP Overhead)
                         │
                         └── NO ──► ESCALATE TO TIER 2
                                         │
                                         ▼
               ┌─────────────────────────────────────┐
               │ Tier 2: Deep ReAgent Verification   │
               │  - Ghidra / IDA CFG & decompilation │
               │  - AST cross-file dataflow tracing  │
               │  - 11-signal parity verification    │
               │  - Unicorn CPU differential emu     │
               └─────────────────────────────────────┘
```

---

## When to Stay in Tier 1 (Fast Path)

Stay in **Tier 1** if the user asks for:
- File format, architecture, compiler version, or cryptographic hashes.
- Hardcoded API keys, authorization tokens, URLs, IP addresses, or endpoints.
- Electron ASAR bundle contents, directory trees, or package dependencies.
- Android APK manifest permissions or exported activities.
- High-level triage overview before committing to deep decompilation.

**Commands**: Use native shell tools (`omnirea scan`, `rg -uu`, `dumpbin`, `readelf`, `otool`, `strings`).

---

## When to Escalate to Tier 2 (Deep Path)

Escalate to **Tier 2** immediately if the user asks for:
- Reconstructing business logic into standalone clean-room C/C++, Rust, or Python.
- Decompiling obfuscated functions or analyzing complex control flow graphs (CFGs).
- Cryptographic algorithm recovery (AES S-boxes, custom XOR state machines).
- Mathematical proof of semantic equivalence between original and reconstructed code.
- Dynamic runtime hooks (Frida), headless debugging (GDB/Rizin), or Unicorn CPU emulation.

**Toolchain**: Invoke REA MCP tools (`open_binary`, `analyze_function`, `procedure_pseudo_code`, `trace_call_path`, `verify_reconstruction`).

---

## The Tri-Bucket Output Standard

Every OmniREA report must structure findings into three distinct buckets:
1. **Confirmed Facts**: Citing concrete proof (file path, line number, hex offset, or Evidence ID).
2. **Inferences**: Hypotheses deduced from observed naming conventions or call patterns.
3. **Residual Unknowns**: Unresolved gaps or code paths protected by encryption/packing.
