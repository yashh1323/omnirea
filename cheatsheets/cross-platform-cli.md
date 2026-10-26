# Cross-Platform CLI Command Parity Matrix

This reference provides exact, native CLI commands across **Windows**, **Linux**, and **macOS** for Tier-1 zero-MCP reverse engineering triage.

---

## 1. File Magic, Headers & Architecture

| Task | Windows (PowerShell / MSVC) | Linux (GNU / LLVM) | macOS (Darwin) |
|---|---|---|---|
| **Magic Bytes** | `Format-Hex -Path <bin> -Count 16` | `file <bin>` / `xxd -l 16 <bin>` | `file <bin>` / `xxd -l 16 <bin>` |
| **Arch / Headers** | `dumpbin /headers <bin.exe>` | `readelf -h <bin>` | `otool -hv <bin>` / `lipo -info <bin>` |
| **Load Commands** | `dumpbin /loadconfig <bin.exe>` | `readelf -l <bin>` | `otool -l <bin>` |
| **Section Layout** | `dumpbin /section:<name> <bin>` | `readelf -S <bin>` | `otool -l <bin> \| grep -A 5 "sectname"` |

---

## 2. Dynamic Dependencies & Linked Libraries

| Task | Windows | Linux | macOS |
|---|---|---|---|
| **Shared Libraries** | `dumpbin /dependents <bin.exe>` | `ldd <bin>` or `readelf -d <bin>` | `otool -L <bin>` |
| **Imported Symbols** | `dumpbin /imports <bin.exe>` | `nm -D -u <bin>` or `readelf -s <bin>` | `nm -u <bin>` |
| **Exported Symbols** | `dumpbin /exports <bin.dll>` | `nm -D --defined-only <bin>` | `nm -gU <bin>` |

---

## 3. High-Performance Windowed String Triage

Never run full `cat` or raw unconstrained `strings` on large binaries. Use regex window slicing (`.{0,150}NEEDLE.{0,150}`) to extract context:

### Ripgrep (All Platforms)
```bash
# Search hidden Vite / Webpack dot-folders with -uu
rg -uu "https?://" ./target-bundle/
rg -uu --max-count 10 "api[_-]?key" ./target-bundle/

# Windowed search for needle with 100 characters of surrounding context
rg -o -U ".{0,100}(secret|token|password).{0,100}" target.bin
```

### Windows PowerShell
```powershell
# Extract printable ASCII strings >= 6 chars
Select-String -Path target.bin -Pattern '[\x20-\x7E]{6,}' -AllMatches | 
  ForEach-Object { $_.Matches.Value } | 
  Select-String -Pattern 'http|key|token|api'
```

### Linux / macOS
```bash
# Minimum 6-char strings piped to grep
strings -n 6 target.bin | grep -Ei "token|bearer|api[_-]?key|secret"
```

---

## 4. Electron & Node.js Application Bundles

| Task | Command (Cross-Platform) |
|---|---|
| **List ASAR Content** | `npx asar list app.asar` |
| **Extract ASAR Bundle** | `npx asar extract app.asar ./dist` |
| **Inspect Preload IPC** | `rg -uu "(contextBridge|ipcRenderer\.send|ipcRenderer\.invoke)" ./dist/` |
| **Audit Fuses** | `npx @electron/fuses read --app /path/to/App` |

---

## 5. Android APK & Mobile Assets

| Task | Command (Cross-Platform) |
|---|---|
| **Unpack APK Zip** | `unzip -q app.apk -d ./extracted-apk` |
| **Decompile Manifest** | `apktool d -f -s -r app.apk -o ./apktool-out` |
| **Extract Native Libs** | `ls -la ./extracted-apk/lib/arm64-v8a/` |
| **Check Symbols in SO** | `nm -D ./extracted-apk/lib/arm64-v8a/libnative.so` |

---

## 6. Apple Mach-O, Plist & Swift Introspection

| Task | macOS Command | Cross-Platform Alternative |
|---|---|---|
| **Decode Info.plist** | `plutil -p Info.plist` | `python -m plistlib Info.plist` |
| **Demangle Swift** | `swift-demangle <symbol>` | `c++filt -n <symbol>` |
| **Check Code Signature**| `codesign -dvv <app>` | `jtool2 --sig <bin>` |
| **Check Entitlements** | `codesign -d --entitlements :- <app>` | `jtool2 --ent <bin>` |
