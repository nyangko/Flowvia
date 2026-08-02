# Semantic Release Setup

This document explains how Flowvia uses automated semantic versioning and releases.

## Overview

Flowvia uses [semantic-release](https://github.com/semantic-release/semantic-release) to automate:
- Version number calculation based on commit messages
- CHANGELOG.md generation
- GitHub release creation
- Git tag creation

Docker image publishing is a **separate, parallel** pipeline (see below) — it is not currently driven by the version tags semantic-release creates.

## How It Works

### 1. Commit Messages Drive Versioning

When you commit code using conventional commits, the commit type determines the version bump:

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `feat:` | Minor (1.0.0 → 1.1.0) | New features |
| `fix:` | Patch (1.0.0 → 1.0.1) | Bug fixes |
| `perf:` | Patch (1.0.0 → 1.0.1) | Performance improvements |
| `refactor:` | Patch (1.0.0 → 1.0.1) | Code refactoring |
| `feat!:` or `BREAKING CHANGE:` | Major (1.0.0 → 2.0.0) | Breaking changes |
| `docs:`, `style:`, `test:`, `chore:` | No bump | Non-code changes |

### 2. The Actual Workflow Chain

The workflows are **not** chained "tests → release → tag → docker build". They're chained via GitHub Actions `workflow_run` triggers, each gated on the parent's `conclusion == 'success'`, like this:

```
push to master/main
  → Run Tests (test.yml)
    → E2E Tests (e2e-tests.yml)                    [workflow_run: "Run Tests"]
      → Build and Push Docker Image (docker.yml)      [workflow_run: "E2E Tests"]
      → Deploy static content to Pages (pages.yml)     [workflow_run: "E2E Tests"]
        → Release (release.yml)                          [workflow_run: "Deploy static content to Pages"]
          → runs semantic-release
```

Step by step:

1. **`test.yml` ("Run Tests")** runs directly on `push` to `master`/`main` (and on pull requests).
2. **`e2e-tests.yml` ("E2E Tests")** triggers via `workflow_run` when "Run Tests" completes, but only runs if that run's conclusion was `success` (it also runs directly on pull requests).
3. Once "E2E Tests" completes with `success`, **two workflows fire in parallel**, both watching "E2E Tests" via `workflow_run`:
   - **`docker.yml` ("Build and Push Docker Image")** — builds and pushes the Docker image.
   - **`pages.yml` ("Deploy static content to Pages")** — builds and deploys the app to GitHub Pages.
4. **`release.yml` ("Release")** triggers via `workflow_run` only when "Deploy static content to Pages" completes with `success`. This is the workflow that actually runs `semantic-release`, which:
   - Analyzes commits since the last release
   - Calculates the new version (if any)
   - Updates `package.json` files in all workspace packages
   - Generates `CHANGELOG.md`
   - Creates a git tag (e.g., `v1.2.0`) and commits with `[skip ci]`
   - Pushes the tag and creates a GitHub release

**Important:** `docker.yml` is triggered by "E2E Tests" completing, in parallel with the Pages deploy — it does **not** wait for, or depend on, `release.yml` / semantic-release / the git tag. The Docker image build happens *independently of* the version bump, not after it.

### 3. Docker Image Tagging Is Currently Branch/SHA-Based, Not Version-Based

`docker.yml` contains `docker/metadata-action` tag rules that look like they produce semver tags (`{{version}}`, `{{major}}.{{minor}}`, `{{major}}`) gated on:

```yaml
enable=${{ github.event_name == 'push' && startsWith(github.ref, 'refs/tags/v') }}
```

This condition can **never be true** under the workflow's actual triggers (`workflow_run` / `workflow_dispatch` only — the workflow has no `push` trigger at all). It's dead code, most likely left over from an earlier design where this workflow triggered directly on tag pushes. In practice every run falls through to the `type=ref,event=branch` / `type=sha` / `latest` rules instead, so images actually get tagged with the branch name, a branch-prefixed short SHA, and `latest` (on the default branch) — never `1.2.0`, `1.2`, or `1`.

If version-tagged Docker images are wanted, either add a `push: tags: ["v*"]` trigger to `docker.yml` (or re-trigger it from `release.yml` after a version is published) and fix the `enable` condition to match. Worth cleaning up either way, since the current condition is unreachable.

### 4. Multiple Package Versioning

Flowvia is a monorepo with multiple packages. All packages are versioned together:
- Root `package.json`
- `packages/flowvia-lib/package.json`
- `packages/flowvia-app/package.json`
- `packages/flowvia-backend/package.json`

The `scripts/update-version.js` script syncs version numbers across all packages.

## Configuration Files

### `.releaserc.json`

Main semantic-release configuration:
- Defines which branches trigger releases (`master`, `main`)
- Configures commit analysis rules
- Sets up changelog generation
- Defines which files to commit
- No npm-publishing plugin is configured — this project does not publish to npm as part of the release

### `.github/workflows/release.yml`

GitHub Actions workflow that:
- Triggers via `workflow_run` when "Deploy static content to Pages" completes (only runs semantic-release if that run's conclusion was `success`), or via manual `workflow_dispatch`
- Executes semantic-release
- Uses only `GITHUB_TOKEN` for GitHub API access — there is no `NPM_TOKEN` and no npm publish step

### `.github/workflows/docker.yml`

GitHub Actions workflow that:
- Triggers via `workflow_run` when "E2E Tests" completes (only builds if that run's conclusion was `success`), or via manual `workflow_dispatch`
- Runs independently of, and in parallel with, the Pages deploy / Release chain
- Currently tags images by branch/SHA/`latest` only (see above — the semver tag rules are unreachable dead code)

### `scripts/update-version.js`

Node.js script that updates version numbers in all package.json files simultaneously.

## Example Release Flow

### Scenario: Adding a New Feature

```bash
# Make your changes
git add .
git commit -m "feat(connector): add multi-point connector routing"
git push origin master
```

**Result:**
- "Run Tests" runs and passes
- "E2E Tests" runs and passes
- In parallel: "Build and Push Docker Image" pushes an image tagged `master`, `master-<sha>`, and `latest`; "Deploy static content to Pages" deploys the app
- Once the Pages deploy succeeds, "Release" runs semantic-release, which detects the `feat:` commit
- Version bumps from 1.0.5 → 1.1.0
- CHANGELOG.md updated with new entry
- Git tag `v1.1.0` created
- GitHub release created
- (The Docker image published earlier in this run was **not** retagged with `1.1.0` — see the Docker tagging note above)

### Scenario: Fixing a Bug

```bash
git commit -m "fix(export): resolve image export quality issue"
git push origin master
```

**Result:**
- Version bumps from 1.1.0 → 1.1.1
- Patch release created

### Scenario: Breaking Change

```bash
git commit -m "feat(api)!: redesign node creation API

BREAKING CHANGE: createNode() now requires nodeType parameter"
git push origin master
```

**Result:**
- Version bumps from 1.1.1 → 2.0.0
- Major release created with breaking change highlighted

### Scenario: Documentation Update

```bash
git commit -m "docs: update installation instructions"
git push origin master
```

**Result:**
- No version bump
- No release created
- Changes still merged to master
- Tests, E2E tests, Docker build, and Pages deploy still run as normal (none of them depend on semantic-release)

## Manual Testing Locally

You can test semantic-release locally without publishing:

```bash
# Dry run (no changes made)
npx semantic-release --dry-run

# See what version would be released
npx semantic-release --dry-run --no-ci
```

## Troubleshooting

### No Release Created

Check if:
- Commits follow conventional commit format
- Commits include version-bumping types (`feat`, `fix`, etc.)
- "Run Tests" → "E2E Tests" → "Deploy static content to Pages" all completed with `success` (Release only triggers off the Pages deploy's `workflow_run` completion — not directly off tests passing)
- You're on the `master` or `main` branch

### Version Not Updated

Ensure:
- `scripts/update-version.js` has execute permissions
- Script is referenced in `.releaserc.json` under `@semantic-release/exec`

### Docker Image Not Tagged With the Version Number

This is expected given the current wiring — `docker.yml` triggers off "E2E Tests" completing, not off the release's git tag, and its semver tag rules are gated on a `push`-to-tag event that never occurs given its actual triggers. See "Docker Image Tagging Is Currently Branch/SHA-Based, Not Version-Based" above for how to fix this if version-tagged images are needed.

## Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Semantic Release Documentation](https://semantic-release.gitbook.io/semantic-release/)
- [Keep a Changelog](https://keepachangelog.com/)

## Maintaining This System

### Updating Semantic Release

```bash
npm update semantic-release @semantic-release/changelog @semantic-release/git @semantic-release/exec
```

### Adding New Commit Types

Edit `.releaserc.json` under `releaseRules` to add custom commit type behaviors.

### Changing Release Branch

Edit `.releaserc.json` and `.github/workflows/release.yml` to target different branches.
