# Localization bundles

Runtime UI strings for `vscode.l10n.t()`. Keys are the English source strings
exactly as they appear in `src/`; English needs no bundle because the extension
host skips bundle loading when the display language is `en`.

`package.nls.*.json` in the repository root is a separate mechanism, covering
only the command titles and setting descriptions declared in `package.json`.

## Adding a locale

Copy any existing bundle and translate the values. The filename must match the
VS Code display language exactly (lowercase, e.g. `pt-br`) — unlike
`package.nls.*.json`, the runtime lookup is an exact match with no `-`-stripping
fallback.

Keep every key present even if a value is left untranslated. A missing key still
resolves to the English source, but it also logs a warning on *every* call, and
the status bar counter runs on each keystroke while the real-time counter is on.

## Plural forms

`vscode.l10n.t()` has no plural support, so the counter units provide separate
singular and plural messages (`{0}code` / `{0}codes`). Languages that do not
inflect after a numeral — Turkish and Hungarian, for example — use the same
value for both.

## Intentionally untranslated

**The status bar counter labels are English in `ja` and `ko`** (`{0}codes`,
`Selected`, `Unsupported`). This is deliberate, not an oversight:

- Japanese mixes scripts natively, so short Latin technical terms read as
  precise rather than foreign — the same reason Japanese games label a button
  `GAME START`. Korean UI has a comparable tolerance for Latin-script labels.
- Both scripts are full-width, so translating these roughly doubles the width of
  the densest, most space-constrained part of the UI.

This does not generalize. Single-script languages such as French, Spanish and
Italian read leftover English as an untranslated defect, so they stay fully
translated. Decide per locale.

Prose — progress text, prompts and error messages — is translated in every
locale, including `ja` and `ko`. The split is short technical label vs. sentence.

## Report output

Strings written into the generated reports (`results.txt` / `.csv` / `.md`) and
the language values persisted in `results.json` are **not** localized and are not
routed through `l10n.t()`. Reports get committed to repositories and diffed
against previous runs, so their contents must not depend on the reader's display
language.
