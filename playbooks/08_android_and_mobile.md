# Playbook 08: Android APK & Mobile Application Audit

## Intent & Triggers
Audit Android APKs, inspect AndroidManifest.xml, trace Java/Kotlin logic to JNI native libraries (`.so`), recover API keys, and bypass SSL pinning.

## Routing Guidance
- **Tier 1**: `unzip -q app.apk`, `apkanalyzer`, `jadx`, `apktool d`.
- **Tier 2**: `inspect_android_package`, `trace_android_references`, and `instrument_with_frida` for runtime hook bypass.
