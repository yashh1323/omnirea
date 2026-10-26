# Reverse Engineering MCP Servers, Agent Toolchains & Clean-Room Offline Replication

This reference documents the systematic methodology for reverse engineering Model Context Protocol (MCP) servers, AI agent CLIs, and developer toolchains, decoupling them from proprietary cloud lock-in, and synthesizing 100% offline, local-first, zero-token clean-room replicas.

---

## Architecture: The Reversal & Clean-Room Replication Pipeline

```
           ┌────────────────────────────────────────────────────────┐
           │        Phase 1: Target Discovery & Extraction          │
           │  (npm cache / npx staging / pip wheels / binary entry) │
           └───────────────────────────┬────────────────────────────┘
                                       │ Raw Bundles / Minified JS / Binaries
                                       ▼
           ┌────────────────────────────────────────────────────────┐
           │        Phase 2: Protocol & Tool Schema Extraction      │
           │  (JSON-RPC 2.0 stdio, ListTools, Input Schemas, AST)   │
           └───────────────────────────┬────────────────────────────┘
                                       │ Tool Contracts & Handlers
                                       ▼
           ┌────────────────────────────────────────────────────────┐
           │        Phase 3: Cloud Decoupling & Flag Discovery      │
           │  (Auth gates, hidden --dry-run/--plan-from flags,      │
           │   remote API telemetry & prompt payloads)              │
           └───────────────────────────┬────────────────────────────┘
                                       │ Decoupled Local Logic
                                       ▼
           ┌────────────────────────────────────────────────────────┐
           │        Phase 4: Clean-Room Zero-Cloud Synthesis        │
           │  (Standalone stdio JSON-RPC server, schema parity,     │
           │   zero external cloud keys, $0 token replay)           │
           └───────────────────────────┬────────────────────────────┘
                                       │ Replicated Engine
                                       ▼
           ┌────────────────────────────────────────────────────────┐
           │        Phase 5: Conformance & Parity Verification      │
           │  (Official CLI linters, dry-run replay, live E2E test) │
           └────────────────────────────────────────────────────────┘
```

---

## 1. Phase 1: Target Discovery & Package Acquisition

Proprietary or cloud-gated MCP servers are typically distributed via package registries (`npm`, `PyPI`) or invoked dynamically via `npx` / `uvx`.

### Locating Staged and Cached Bundles
* **Node / npx cache** (Windows):
  `$env:LOCALAPPDATA\npm-cache\_npx\<hash>\node_modules\<package-name>\`
* **Node / npm global** (Windows):
  `$env:APPDATA\npm\node_modules\<package-name>\`
* **Python virtual environments / pip cache**:
  `~/.cache/pip` or `.venv/Lib/site-packages/<package>/`
* **Package Extraction**:
  If the package is not cached locally, pull and unpack without running scripts:
  ```bash
  npm pack <package-name>@<version>
  tar -xzf <package-name>-<version>.tgz
  ```

---

## 2. Phase 2: Protocol & Tool Schema Extraction

MCP servers communicate over standard JSON-RPC 2.0 via `stdio` or Server-Sent Events (`SSE`). Extracting the server contract requires identifying tool definitions, input schemas, and handler entry points.

### 2.1 Identifying Server Construction
Search for MCP SDK initializers:
* `@modelcontextprotocol/sdk`:
  `new McpServer({ name: ..., version: ... })` or `new Server({ name: ... }, { capabilities: { tools: ... } })`
* Handler registrations:
  `server.tool("tool_name", ...)` or `server.setRequestHandler(ListToolsRequestSchema, ...)`

### 2.2 Recovering Tool Input Schemas
Examine Zod (`z.object({...})`) or JSON Schema definitions:
* **Tool Name**: Exact string registered in the protocol.
* **Description**: The prompt instructions given to the LLM.
* **Parameter Schema**: Field names, types, descriptions, default values, and required constraints.
* **Return Format**: Text, JSON, or embedded resource objects (`{ content: [{ type: "text", text: ... }] }`).

### 2.3 Handler Decompilation
Locate the dispatcher matching tool names to implementations:
* Identify whether execution happens locally (e.g., executing shell commands, launching Playwright, reading files) or delegates to an upstream HTTP/REST endpoint.
* Map all outbound HTTP endpoints, headers, payload formats, and authentication tokens.

---

## 3. Phase 3: Cloud Decoupling & Flag Discovery

Commercial agent tools often route logic through proprietary backend APIs for paywalled LLM processing. Reverse engineering reveals bypasses and offline execution capabilities.

### 3.1 Uncovering Hidden and Undocumented CLI Flags
Decompile CLI argument parsers (`commander`, `yargs`, `argparse`):
* Look for testing flags: `--dry-run`, `--offline`, `--mock`, `--local-only`, `--fixture`.
* Look for input substitution flags: `--plan-from <file>`, `--input-schema <file>`, `--skip-auth`.
* Trace environment variables: `MOCK_SERVER`, `DEBUG_PAYLOADS`, `API_BASE_URL`.

### 3.2 Decoupling Cloud API Dependencies
When an agent tool delegates reasoning (e.g. test plan generation, PRD extraction, code summarization) to a remote cloud API:
1. **Analyze Prompt Templates**: Extract prompt strings and system messages embedded in the client bundle.
2. **Identify Output Formats**: Inspect response validation schemas (e.g., Zod schemas defining expected API response JSON).
3. **Re-implement via Local Agent Skills**: Replace remote API calls with native LLM prompts inside the AI client (Claude, Antigravity, Cursor) or deterministic local parsers.
4. **Preserve Execution Engines**: Keep the client-side deterministic runners (Playwright, Puppeteer, AST walkers) while replacing the paywalled orchestrator.

---

## 4. Phase 4: Clean-Room Zero-Cloud Server Synthesis

Create a completely independent, zero-dependency, local-first MCP server that mirrors the tool contract exactly.

### 4.1 Zero-Dependency JSON-RPC 2.0 Engine
To avoid dependency bloat and guarantee high performance across diverse operating systems:
* Implement stdio JSON-RPC framing natively using `readline`:
  ```javascript
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });

  rl.on('line', (line) => {
    if (!line.trim()) return;
    try {
      const request = JSON.parse(line);
      handleRpc(request);
    } catch (e) {
      sendError(null, -32700, "Parse error");
    }
  });
  ```
* Handle mandatory MCP initialization cycles:
  - `initialize`: Return protocol version, server capabilities (`tools: {}`), and server info.
  - `notifications/initialized`: Acknowledge client readiness.
  - `tools/list`: Return exact replicated tool definitions and schemas.
  - `tools/call`: Dispatch to local handler functions and return standardized MCP content blocks.

### 4.2 Local Execution Engine Best Practices
* **Fuzzy & Resilient Element Locators**: Avoid strict CSS selectors that break across dynamic builds. Use semantic hierarchies: exact text $\rightarrow$ ARIA label / title $\rightarrow$ placeholder $\rightarrow$ fuzzy regex matching.
* **Accessibility-First Surface Crawler**: Combine DOM visibility checks (`getBoundingClientRect()`, computed style) with accessibility tree snapshots (`page.accessibility.snapshot()`) to eliminate false-negative element detection (e.g. `position: fixed` modals).
* **Deterministic Replay**: Ensure test/task plans can be re-executed repeatedly with zero token consumption ($0.00 cost per run).

---

## 5. Phase 5: Conformance & Parity Verification

To prove that the clean-room replica is indistinguishable from and functionally superior to the proprietary original:

1. **Schema Linter Parity**:
   Run the target ecosystem's official linter or test validator against the replica's output:
   ```bash
   node <official-cli> lint --plan-from replica-plan.json
   # Verify: 100% valid, 0 problems
   ```
2. **Dry-Run Conformance**:
   Run the official CLI in dry-run mode to confirm schema compatibility:
   ```bash
   node <official-cli> run --dry-run --plan-from replica-plan.json
   ```
3. **Live Target Verification**:
   Execute the clean-room engine against a live target application (e.g., local web app):
   - Measure execution speed, step pass rate, and resilience against UI updates.
   - Verify self-healing behavior under locator failure.
   - Verify negative assertions and screenshot captures.

---

## 6. Case Study: TestSprite $\rightarrow$ Auto-QA Clean-Room Replication

| Dimension | Proprietary Target (`@testsprite/*`) | Clean-Room Replica (`auto-qa`) |
| :--- | :--- | :--- |
| **Tool Pipeline** | Cloud-tethered 6-tool MCP server | Local-first 7-tool MCP server (`mcp-server.js`) |
| **Authentication** | Mandatory cloud API key & subscription | Zero authentication required, 100% local |
| **Token Cost** | Paywalled per generation & replay | **$0.00 replay** via declarative deterministic runner |
| **Native Compilation** | Proprietary internal format | Compiles to standard `@playwright/test` `.spec.ts` |
| **Engine Locators** | Rigid keyword matching | Resilient fuzzy matching, ARIA fallback, textarea support |
| **Offline Verification** | Blocked without internet | Validated against official TestSprite CLI linter & SprintDesk |
