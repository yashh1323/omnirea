# Playbook 11: Electron, Node.js & Web Bundle Reconstruction

## Intent & Triggers
Extract `app.asar` bundles, inspect preload scripts, analyze IPC message handlers (`contextBridge`), beautify minified JS, and extract hidden endpoints.

## High-Performance Pattern
- **Tier 1**: Use `npx asar extract app.asar ./dist` followed by `rg -uu "ipcRenderer|ipcMain"`.
- **Tier 2**: Use `analyze_javascript_application` in REA MCP to build AST dataflow graphs across hundreds of files.
