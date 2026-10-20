# Working conventions

General conventions for any agent or human working in this repo. Repo-specific naming, API, and layout conventions belong in their own section at the end (or a separate file listed in `README.md`).

## Workflow

- Restate the goal before a non-trivial change. When a business rule is unclear, ask with concrete options instead of guessing.
- Break multi-step work into small steps and finish each one (builds, tests pass) before the next.
- Prefer editing existing files over creating new ones. Follow the patterns already in the code.
- Do not refactor unrelated code in the same change.
- Never say something is done, tested, or passing unless you ran it. If a step was skipped, say so.

## Git

- The main branch is deployable. Work on feature branches and merge through PRs.
- Commit messages and PR titles are conventional commits: `type(optional-scope): subject` (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `build`, `perf`, `revert`, `style`). Enforced by commitlint in the local commit-msg hook.
- No AI attribution anywhere in git history ([no-ai-attribution.md](no-ai-attribution.md)).
- Never force-push or rewrite shared branches. Never use `--no-verify`.
- Git history is the project log. Do not keep a hand-appended changelog of every change in a shared file (it conflicts on every merge); release notes are fine.

## Code quality

- Validate data read from `chrome.storage` and messages before using it.
- Keep hand-written files under ~600 lines ([file-size-limit.md](file-size-limit.md)).
- Remove dead code instead of commenting it out.

## Security

- Never print, log, commit, or paste secrets. Redact them in examples and logs.
- Least privilege and short-lived tokens by default.
- Request only the Chrome permissions the extension actually uses.

## Debugging

- Compare against a working reference first (config, package.json, environment, deploy structure) before reading runtime code.
- Reproduce, then isolate one component at a time.
- Gather logs, steps, and the timeline of recent changes before proposing a fix.
- Fix the root cause; if you ship a workaround, say so and note what the real fix would be.

## Communication

- Be concise and specific. Give commands and file paths, not general advice.
- When several options are valid, recommend one and give the trade-off in a sentence.
- Be explicit about uncertainty and limitations.

## Repo-specific conventions

- Flat layout: each extension page is a `name.html` + `name.js` pair at the repo root (`popup`, `alert`); `background.js` is the service worker; shared styles in `styles.css`.
- Every user-visible string goes through `_locales/<lang>/messages.json` and `i18n.js`. Add a new key to **all** locales (de, en, es, fi, fr, tr) in the same change.
- Plain browser JavaScript, no bundler, no npm runtime dependencies. `package.json` is dev tooling only.
