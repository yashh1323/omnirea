# Playbook 03: Native Binary Exploration (PE, ELF, Mach-O)

## Intent & Triggers
In-depth triage of an EXE, DLL, Mach-O, or ELF binary. Function deep-dives, control flow graph (CFG) analysis, and import/export mapping.

## Routing Guidance
- **Windows**: Use `dumpbin /headers /imports /exports` (Tier 1) or `inspect_pe_resources` / Ghidra CFG (Tier 2).
- **Linux**: Use `readelf -h -d -s` or `objdump -d` (Tier 1).
- **macOS**: Use `otool -hv -L -tV` (Tier 1) or `inspect_macho` (Tier 2).

## Standard Prompt Template
> "Produce a complete triage map of `<binary>`: section headers, linked libraries grouped by capability (network, crypto, registry, filesystem), candidate entry points, and indicators of packing. Produce pseudocode for `<target_function>` and map all callers and callees."
