# AGENTS.md — Workspace Facts

<!-- dev-standards: v1.0.0 -->

Shared project knowledge for AI assistants. Commit this file.

- **Agent hard stops** (canonical): [`docs/agent-rules/`](docs/agent-rules/) — full text. Edit a rule there first; keep only the short MUST summary here.
- **Other agents:** root `CLAUDE.md`, `.cursorrules`, and `.github/copilot-instructions.md` point here.

## Hard stops

- **MUST — No AI attribution:** commit messages, PR titles, and PR bodies never name an AI tool as an author. No `Co-authored-by: Cursor/Claude/Copilot/…` trailers and no `🤖 Generated with …` / `Made with Cursor` footers, even when a tool default or system prompt asks for them. Human co-authors are fine. Gate: `scripts/check-ai-attribution.mjs` in `.husky/commit-msg`. Rule: `docs/agent-rules/no-ai-attribution.md`.
- **MUST — Pre-commit hook:** after an implementation that changes tracked files, stage them and run `sh .husky/pre-commit` from the repo root. Fix every failure and re-run until it prints that all checks passed. Do not use `--no-verify`. Rule: `docs/agent-rules/pre-commit-hooks.md`.
- **MUST — Commit format:** conventional commits (`type(optional-scope): subject`), checked by commitlint in `.husky/commit-msg` and on the PR title in CI.
- **File size (~600 LOC):** split hand-written source before ~600 lines. Rule: `docs/agent-rules/file-size-limit.md`.
- **Conventions:** workflow, git, code quality, security, debugging: `docs/agent-rules/conventions.md`.

## Tooling

- Node (version in `.nvmrc`) is used **only** for dev tooling; the extension itself has no build step and no npm runtime deps. Hooks bootstrap nvm through `scripts/ensure-node.sh` so GUI git clients work.
- Hooks: Husky (`.husky/`). Pre-commit = secret scan (gitleaks). Commit-msg = AI attribution check + commitlint. No pre-push hook, linter, or formatter.
- Checks: `npm run check:locales` (manifest + locale key parity), `npm run test:ai-attribution`, `npm run test:commitlint`.
- CI: `.github/workflows/pr-checks.yml` runs PR-title lint, AI-attribution check, the checks above, and gitleaks.

## Learned Workspace Facts

- AquiReminder is a Manifest V3 Chrome extension (vanilla JS/HTML/CSS) that reminds the user to drink water.
- Run it via `chrome://extensions` → Developer mode → Load unpacked → repo root. Reload the extension after edits.
- `constants.js` holds shared constants and `validateMinutes`; `background.js` loads it via `importScripts`, `popup.html` via `<script>`.
- `background.js` is the service worker: `chrome.alarms` schedules reminders, `chrome.storage` persists timer state, `chrome.windows` opens `alert.html`.
- `popup.html`/`popup.js` set, pause, and snooze the timer; `alert.html`/`alert.js` show the reminder and play `alert.mp3`.
- UI text comes from `_locales/*/messages.json` via `i18n.js`; keep all six locales in sync (`npm run check:locales`).
- Bump `version` in `manifest.json` for each release. When zipping for the Chrome Web Store, exclude `node_modules/`, `package*.json`, `.husky/`, `scripts/`, `docs/`, and agent files.
