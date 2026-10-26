# Playbook 05: Game Logic, Engine & Asset Recovery

## Intent & Triggers
Extract gameplay rules, calculate RNG formulas, recover 3D models/sprites, analyze save-game formats, or develop offline single-player modifications.

## Routing Guidance
- **Unity Games**: Fast inspection of `Assembly-CSharp.dll` via `il2cppdump` or `inspect_il2cpp_metadata`.
- **Unreal Games**: Triage `.pak` containers, map UE reflection objects, and dump `GNames` / `GUObjectArray`.
- **Custom Engines**: Locate main tick/update loop and analyze tick delta calculations.
