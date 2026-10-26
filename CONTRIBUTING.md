# Contributing to OmniREA

Thank you for your interest in contributing to **OmniREA**! We welcome contributions ranging from bug fixes, documentation improvements, new domain playbooks, and additional Tier-1 fast recon modules.

## How to Contribute

### 1. Reporting Issues
- Check the [existing issues](https://github.com/yashh1323/omnirea/issues) first to avoid duplicates.
- Use our [Bug Report Template](https://github.com/yashh1323/omnirea/issues/new?template=bug_report.md) or [Feature Request Template](https://github.com/yashh1323/omnirea/issues/new?template=feature_request.md).
- Provide minimal reproduction steps, target environment (OS, Node version), and relevant terminal output.

### 2. Development Setup
Clone the repository and run doctor checks:

```bash
git clone https://github.com/yashh1323/omnirea.git
cd omnirea
npm test
```

### 3. Running Benchmarks
Run the local machine performance suite:
```bash
npm run bench
```

### 4. Adding or Updating Playbooks
- Domain playbooks reside under `playbooks/` with numerical prefixes (`01-system-init.md`, `12-web-apis-recon.md`).
- Ensure playbooks adhere to the tri-bucket evidence classification:
  - `[PROVEN]`: Verified by memory dumps, runtime logs, or register states.
  - `[HIGH-CONFIDENCE]`: Strong static analysis or cross-referenced AST.
  - `[HYPOTHESIS]`: Unverified initial hypothesis requiring Tier-2 escalation.

### 5. Pull Request Guidelines
1. Fork the repo and create a new feature branch (`git checkout -b feature/my-new-playbook`).
2. Keep PRs focused on a single feature or bug fix.
3. Ensure `npm test` and `npm run bench` pass without regression.
4. Submit your pull request with a descriptive title and summary.

## Code of Conduct
Please review our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.
