# Playbook 02: Feature Tracing (Button to Effect)

## Intent & Triggers
Explain how a single feature works, trace from a UI click/button down to backend execution, or extract business logic rules.

## Routing Guidance
- **Web/Electron**: Tier 1 fast `rg -uu` for event listeners (`addEventListener`, `onClick`, IPC channels `ipcRenderer.send`).
- **Native GUI**: Tier 2 `trace_native_ui_action` and `trace_call_path` to map UI dispatch handlers to underlying Win32/Cocoa/GTK routines.

## Standard Prompt Template
> "Trace the flow from the action trigger `<button/event>` down to disk write or network transmission in `<target>`. Identify all intermediate functions, state variables mutated, and cryptographic transformations. For every claim, cite the function offset or line number."
