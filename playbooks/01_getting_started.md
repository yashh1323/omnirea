# Playbook 01: Getting Started & Unfamiliar Application Triage

## Intent & Triggers
Use when encountering an unfamiliar application, binary, or bundle for the first time. The goal is rapid orientation without getting bogged down in decompilation.

## Routing Guidance
- **Tier 1 (Fast Path)**: Run `omnirea scan <file>` to detect magic bytes, format, architecture, and hashes. Run strings extraction or `rg -uu` on text assets.
- **Tier 2 (Deep Path)**: If the binary is packed, obfuscated, or native C/C++, call `open_binary` and `binary_overview` in REA MCP.

## Standard Prompt Template
> "Map the main components, entry points, and the three most interesting features worth investigating first in `<target>`. Keep it concise, provide SHA-256 and architecture facts, and state explicit evidence for each claim."

## Tri-Bucket Deliverable Format
- **Confirmed Facts**: File format, architecture, linked libraries, high-confidence entry points.
- **Inferences**: Hypothesized purpose of main subsystems based on exported names.
- **Residual Unknowns**: Unidentified sections, encrypted blobs, or packed routines.
