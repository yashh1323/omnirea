---
name: lean-recon
description: Tier-1 fast-path reverse engineering rules. Zero MCP token overhead, instant CLI recon with ripgrep, dumpbin, readelf, and otool.
---

# Tier-1: Lean Reconnaissance Playbook

Use this skill for rapid, low-latency target analysis using host terminal utilities.

## Key Directives

1. **Zero MCP Overhead**: Do not launch or query MCP tool servers when native shell commands can answer the user's prompt in 1 turn.
2. **Windowed Extraction**: When searching strings, never dump whole files into context. Use windowed slicing:
   ```bash
   rg -o -U ".{0,100}api[_-]?key.{0,100}" target.bin
   ```
3. **Hidden Directory Discovery**: In modern web/Electron apps, always use `-uu` to unignore hidden build folders:
   ```bash
   rg -uu "process\.env|SECRET" ./dist/
   ```
4. **Format Triage**:
   - Windows: `dumpbin /headers /imports /exports target.exe`
   - Linux: `readelf -h -d -s target.bin`
   - macOS: `otool -hv -L target`
