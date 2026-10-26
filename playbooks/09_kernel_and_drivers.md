# Playbook 09: Kernel Drivers & IOCTL Attack Surface Analysis

## Intent & Triggers
Inspect Windows kernel drivers (`.sys`) or Linux kernel modules (`.ko`), map IOCTL dispatch routines, and audit trust boundaries between user and kernel mode.

## Checklist
1. Find `DriverEntry` / `init_module`.
2. Locate `MajorFunction[IRP_MJ_DEVICE_CONTROL]` handler.
3. Extract all valid IOCTL codes and buffered/direct/neither I/O transfer methods.
