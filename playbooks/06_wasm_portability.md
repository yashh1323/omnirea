# Playbook 06: WebAssembly (WASM) Portability & Decompilation

## Intent & Triggers
Decompile `.wasm` modules, recover memory layout, identify imported host functions (WASI/Emscripten), or port desktop simulation cores to the browser.

## Toolchain
- **Tier 1**: `wasm-objdump`, `wasm2wat` for text representation.
- **Tier 2**: `inspect_wasm_artifact` and `compare_wasm_interfaces` for full AST and interface recovery.
