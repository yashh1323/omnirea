# Playbook 07: Firmware & Embedded IoT System Analysis

## Intent & Triggers
Triage router/MCU/IoT firmware images, unpack SquashFS / UBI / JFFS2 filesystems, and inspect bootloaders (U-Boot).

## Routing Guidance
- **Tier 1**: `binwalk -e <firmware.bin>`, strings analysis, and entropy plotting.
- **Tier 2**: `extract_firmware`, `inspect_firmware_regions`, and Ghidra base-address detection for raw memory dumps.
