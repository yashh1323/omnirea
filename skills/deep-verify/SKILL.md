---
name: deep-verify
description: Tier-2 formal reverse engineering and code reconstruction verification engine. Incorporates ReAgent 11-signal parity and REA MCP tools.
---

# Tier-2: Deep Parity Verification Engine

Use this skill when clean-room code reconstruction, decompilation, or mathematical equivalence validation is required.

## The 11 Verification Signals

Reconstructed code must pass verification across all 11 signals before marked complete:

1. **CFG Topology**: Basic block count, branch conditions, and loop invariant parity.
2. **Calling Conventions**: Register usage (`rcx`/`rdx`/`r8`/`r9` vs System V ABI) and stack cleanup.
3. **Stack Layout**: Local variable offsets and buffer alignments.
4. **Memory Access**: Pointer arithmetic and struct field offsets.
5. **System Calls**: Exact order of Win32, POSIX, or Cocoa API invocations.
6. **Error States**: Return code parity and exception handler paths.
7. **Constants**: Magic numbers, cipher keys, and bitmask invariants.
8. **Endianness**: Multi-byte packing and bitwise rotations.
9. **Floating-Point**: Precision and IEEE-754 rounding modes.
10. **Branch Timing**: Control-flow side-channel parity.
11. **Differential CPU Emulation**: Executing original and reconstructed functions side-by-side in Unicorn Engine with randomized fuzz inputs to prove identical register/memory state transitions.

## Deliverable: CLONE_SPEC.md

Every Tier-2 task produces a `CLONE_SPEC.md` documenting the reconstructed algorithms with complete type signatures and test harnesses.
