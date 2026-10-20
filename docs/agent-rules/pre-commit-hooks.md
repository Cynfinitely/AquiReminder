# Pre-commit hook — HARD STOP

After an implementation that changes tracked files, run the Husky pre-commit hook and fix every failure before calling the work done.

From the repo root, with the change staged:

```bash
sh .husky/pre-commit
```

The hook scans staged files only. Unstaged work is invisible to it. It runs a secret scan (gitleaks, when installed). This repo has no linter or formatter wired in.

## Do

```text
Stage the files that belong in the change
Run sh .husky/pre-commit
Fix the reported failure (secret scan)
Re-stage anything the fix rewrote
Run the hook again until it prints "All checks passed"
```

## Do not

```text
❌ Finish while the hook is red
❌ Skip with --no-verify
❌ Treat a sandbox xargs or PATH failure as a product bug — rerun the hook outside the sandbox
```

Commit messages still have to pass `.husky/commit-msg` (conventional commit header + no AI attribution) when a commit is created.
