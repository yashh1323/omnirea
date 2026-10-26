# ReAgent Integration: Autonomous C/C++ Reversal, Parity & Differential Verification

This reference documents how **REA** (Reverse Engineer Anything) combines with **ReAgent** (`auto-re-agent`) to provide an end-to-end binary analysis and automated C/C++ source code reconstruction pipeline.

---

## Tool Synergy: The Unified Reversal Pipeline

```
           ┌──────────────────────────────────────────────┐
           │        Phase 1: Broad Triage & Scoping       │
           │     REA (213 MCP Tools) + REAP Templates     │
           │  (open_binary, search_strings, xrefs, CFG)   │
           └──────────────────────┬───────────────────────┘
                                  │ Target Address & Manifest
                                  ▼
           ┌──────────────────────────────────────────────┐
           │        Phase 2: Dependency Planning          │
           │       re-agent plan --address <HEX>          │
           │    (Exports ordered function manifests)      │
           └──────────────────────┬───────────────────────┘
                                  │ Ordered Targets
                                  ▼
           ┌──────────────────────────────────────────────┐
           │   Phase 3: Autonomous Reverser ↔ Checker     │
           │      ReAgent Fix Loop + REAP Prompts         │
           │    (Iterative C/C++ source reconstruction)   │
           └──────────────────────┬───────────────────────┘
                                  │ Candidate Code
                                  ▼
           ┌──────────────────────────────────────────────┐
           │     Phase 4: Multi-Stage Validation Gates    │
           │  1. 11-Signal Parity Engine (re-agent parity)│
           │  2. Isolated Build & Test Candidate Overlay  │
           │  3. Differential Emulation (Unicorn Engine)  │
           │  4. REA Evidence & Obligation Ledger         │
           └──────────────────────────────────────────────┘
```

---

## 1. When to Use Which Tool

| Task | Primary Engine | Tool / Command |
| :--- | :--- | :--- |
| **Broad Binary / App Exploration** | REA | `open_binary`, `binary_overview`, `search_strings`, `search_bytes` |
| **Electron, ASAR, WASM, Android APKs** | REA | `analyze_javascript_application`, `inspect_android_package`, `inspect_wasm_artifact` |
| **Network & Dynamic Scenario Tracing** | REA | `inspect_web_network_capture`, `capture_browser_scenario` |
| **Function Dependency & Call Ordering** | ReAgent | `re-agent plan --address <HEX> --output manifest.json` |
| **Autonomous C/C++ Code Generation** | ReAgent | `re-agent reverse --address <HEX>` (Reverser $\leftrightarrow$ Checker loop) |
| **Structural Code Similarity Scoring** | ReAgent | `re-agent parity --address <HEX>` (11-signal engine: Green/Yellow/Red) |
| **Sandboxed Compilation & Unit Testing** | ReAgent | Candidate Overlays (`build_commands`, `test_commands`) |
| **Byte-for-Byte Differential Emulation** | ReAgent | `re-agent benchmark` (Unicorn x86/x64 vs candidate outputs) |
| **Formal Evidence & Audit Trails** | REA + ReAgent | `build_reconstruction_obligation_ledger` + `re-agent evidence` |

---

## 2. The 11-Signal Parity Rules

When evaluating reversed C/C++ functions against decompiled assembly/P-code, apply ReAgent's 11-signal parity rules:

1. **Missing Source Check**: Flags if function body has no implementation (`RED`).
2. **Stub Marker Check**: Detects unreachable stub markers like `NOTSA_UNREACHABLE` (`RED`).
3. **Trivial Stub Check**: Catches trivial wrappers around `plugin::Call*` with no control flow (`RED`).
4. **Asm-vs-Source Ratio**: Flags if assembly has $>80$ instructions but candidate has $<12$ lines (`RED`).
5. **Plugin Call Density**: Detects heavy reliance on direct plugin hooks vs genuine logic (`YELLOW`).
6. **Virtual Dispatch Mismatch**: Verifies vtable index and `thiscall` convention matching.
7. **Control-Flow Complexity**: Compares branch and loop counts between Ghidra CFG and candidate code.
8. **Callee Count Check**: Verifies that calls made in candidate match the observed callee count within tolerance.
9. **Constant Return Check**: Verifies integer and enum return constants match binary literals.
10. **Floating-Point Asm Matching**: Ensures FP instructions (FPU/SSE) correspond to source float math.
11. **Type Layout & Struct Alignment**: Verifies struct member offsets against observed memory accesses.

---

## 3. Sandboxed Candidate Overlays & Testing Gates

ReAgent protects the active source tree by building inside a disposable directory:

```yaml
# re-agent.yaml
validation:
  copy_project: true
  project_root: .
  build_commands:
    - [cmake, -S, "{overlay_root}", -B, "{overlay_root}/build"]
    - [cmake, --build, "{overlay_root}/build"]
  test_commands:
    - [ctest, --test-dir, "{overlay_root}/build", --output-on-failure]
```

Placeholders:
- `{candidate_file}`: Path to the newly written C/C++ candidate file.
- `{overlay_root}`: Sandboxed duplicate of the project root.
- `{source_file}`: Path to original source file being replaced.

---

## 4. Differential Verification (Unicorn Emulation)

For critical functions where logic must match byte-for-byte:
1. ReAgent executes the original binary function inside an emulated CPU context (**Unicorn Engine**).
2. Runs the newly compiled candidate function with identical register and memory arguments.
3. Compares return values and memory side-effects across deterministic input cases (`cases.json`).
4. Only marks function `PASS` when outputs match across all boundary conditions.
