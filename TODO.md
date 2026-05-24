# Pre-publication TODO

## Critical

- [x] **Fix hardcoded dark theme** (`toonEditorProvider.ts:134-147`)
  The extension forces Catppuccin Macchiato dark colors regardless of the user's VS Code theme.
  Users with light or high-contrast themes get an unusable dark view.
  Fix: use `var(--vscode-editor-background)`, `var(--vscode-editor-foreground)` etc., or add
  `.vscode-light` / `.vscode-high-contrast` CSS overrides using the body classes VS Code injects.

- [x] **Show an error/empty state in the webview** (`toonParser.ts:42-44`)
  Parse failures silently return empty sections; users see a blank page with no explanation.
  Fix: return a structured error from `parseToon` (or throw) and render a visible "Could not
  parse TOON file" message in `buildHtml`.

## High

- [x] **Fix cross-platform compile script** (`package.json:49`)
  `rm -rf out` fails on Windows. Replace with a Node.js one-liner:
  ```
  node -e "require('fs').rmSync('out', { recursive: true, force: true })"
  ```
  or add `rimraf` as a dev dependency.

- [x] **Exclude unnecessary files from VSIX** (`.vscodeignore`)
  `example.png`, `icon.svg`, and `package-lock.json` are currently bundled into the `.vsix`.
  Add them to `.vscodeignore`.

- [x] **Add CHANGELOG.md**
  The VS Code Marketplace shows a Changelog tab; a missing file looks unfinished.

- [x] **Improve marketplace metadata** (`package.json`)
  - Add `keywords` array (improves search discoverability)
  - Add `galleryBanner` (`{ "color": "#1e1e2e", "theme": "dark" }`)
  - Add `bugs` URL
  - Consider changing `categories` from `["Other"]` to `["Formatters"]`

## Medium

- [x] **Replace `'unsafe-inline'` CSP with a nonce** (`toonEditorProvider.ts:132`)
  VS Code webview security best practices recommend generating a per-load nonce and using
  `style-src 'nonce-{value}'`. Risk is low here (scripts are disabled), but this is the
  documented pattern and will satisfy the Marketplace security scanner.

- [x] **Handle top-level scalar TOON values** (`toonParser.ts:51-63`)
  Scalar values at the top level (strings, numbers, booleans) are silently skipped.
  At minimum, document this as intentional; ideally render them in a "scalars" properties
  section or show a note in the webview.

- [x] **Clarify first-column-as-key behaviour** (`toonEditorProvider.ts:56,84`)
  Column 0 is unconditionally rendered as a dim key column and excluded from numeric
  detection. If a table's first column contains numbers, they appear as left-aligned
  plain text. Decide if this is intentional and document it, or make the heuristic smarter.

- [x] **Remove `retainContextWhenHidden: true`** (`toonEditorProvider.ts:13`)
  This keeps the webview process alive in memory when the tab is hidden. For a pure
  read-only renderer, recreating the HTML is cheap. Removing this option (the default
  is `false`) reduces memory use.

## Low / Nice to have

- [ ] **Add tests**
  No test files exist. At minimum, unit-test `parseToon` with valid files, empty input,
  and malformed input. Use `@vscode/test-electron` or `vitest` for the parser logic.

- [x] **Add ESLint**
  Add `eslint` + `@typescript-eslint/eslint-plugin` and an `npm run lint` script for
  consistent code style and catch common mistakes in CI.

- [x] **Verify the GitHub repository URL is public** (`package.json:10`)
  `https://github.com/medvekoma/lookatoon` — confirm the repo exists and is public before
  submitting to the Marketplace, as the URL appears on the extension page.
