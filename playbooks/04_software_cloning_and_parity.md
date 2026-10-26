# Playbook 04: Clean-Room Software Cloning & Parity Verification

## Intent & Triggers
Reconstruct an algorithm, protocol parser, or complete feature in clean-room C, Rust, TypeScript, or Python, with proof of semantic equivalence.

## The 11-Signal ReAgent Parity Framework (Tier 2)
When reconstructing native code, verify against the 11 formal signals:
1. CFG topology & loop invariants
2. Register & calling convention parity
3. Stack frame layout & local variable offsets
4. Memory read/write access patterns
5. Win32 / POSIX API call ordering
6. Return code & exception handling parity
7. Cryptographic constant matching
8. Endianness & bit-shifting precision
9. Floating-point rounding parity
10. Dynamic timing & branching consistency
11. Differential CPU emulation output (Unicorn Engine)

## Deliverable: CLONE_SPEC.md
Every cloning pass must produce a `CLONE_SPEC.md` containing data structures, function signatures, state machines, and unit tests proving equivalence.
