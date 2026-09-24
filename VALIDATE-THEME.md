## Overview

This linter validates theme source for consistency and best practices.

When printing errors to stderr, consecutive messages are separated by a blank line and a line of underscores (`_______________________________________`) so multi-error output is easier to scan.

**Run from theme root:**
```bash
node validate-theme.js
```

**Run from any location** (specify theme path):
```bash
node validate-theme.js --path ./path/to/theme
node validate-theme.js -p ./path/to/theme
```

**Validate only specific files** (faster when only a few paths changed). Paths are relative to the theme root from `--path` (or the current directory if `--path` is omitted). Use a comma-separated list and/or repeat `--files`:

- Example: `node validate-theme.js --path ./path/to/theme --files snippets/foo.liquid,sections/bar.liquid`
- Example: `node validate-theme.js -p ./path/to/theme --files snippets/foo.liquid --files assets/baz.css`

Each path must be a regular file inside the theme root; absolute paths are OK only if they still lie under that root. Use paths as they appear under the theme (e.g. `snippets/foo.liquid`). The theme root must be the directory that contains Shopify-style folders (`snippets/`, `sections/`, `blocks/`, `assets/`, `templates/`, `config/`). Files listed outside those subtrees are not run through the Liquid/CSS/JS/JSON checks (except paths you pass explicitly, e.g. `config/settings_data.json`).

Programmatic use: `run(themePath, { files: ['snippets/foo.liquid', ...], ... })`.

Use inline guards to disable/enable specific checks within a file section:
- HTML: `<!-- validation-disable:checkConsoleDebug -->` ... `<!-- validation-enable:checkConsoleDebug -->`
- CSS/JS: `/* validation-disable:checkConsoleDebug */` ... `/* validation-enable:checkConsoleDebug */`
- Liquid: `{% comment %}validation-disable:checkConsoleDebug{% endcomment %}` ... `{% comment %}validation-enable:checkConsoleDebug{% endcomment %}`

Disable all checks in a region with `...-disable:all` / `...-enable:all`.

You can also ignore checks per file via glob patterns in `FILE_IGNORES` inside `validate-theme.cfg` (theme root) or defaults in `validate-theme.js`.


## Available checks

Each row reflects the **default** in `CONFIG` inside `validate-theme.js`; themes can override keys in `validate-theme.cfg`. Descriptions are short summaries only; see the matching `### check…` section for rules, scopes, and error formats.

| Check | Default status | Description |
|-------|----------------|-------------|
| `checkBtnSemantics` | Enabled | Ensures elements with the exact `btn` class are real controls or include `ignore-slide-tabindex` for accessibility. |
| `checkConsoleDebug` | Enabled | Flags `console.*` and `debugger` in assets and Liquid so production bundles avoid stray debugging calls. |
| `checkCssClassNaming` | Enabled | Requires kebab-case class names and rejects underscore-heavy tokens in Liquid and CSS files. |
| `checkCssEmptyRules` | Enabled | Detects empty CSS rule bodies in assets and `<style>` blocks while ignoring declarations supplied only via Liquid. |
| `checkCssHoverNotMobile` | Enabled | On each line, text before the first `:hover` must include `.not-mobile` so hover rules stay desktop-oriented. |
| `checkCssImportant` | Enabled (diff-only) | With `--diff-file`, warns on `!important` in **added** lines of `*.css` and `*.css.liquid` under `assets/`. |
| `checkCssPxRem` | Enabled | Discourages `px` for lengths **≥ 8** so spacing and type prefer `rem` or `em` in theme stylesheets. |
| `checkFontFamily` | Enabled | Disallows hardcoded `font-family` unless values use variables, Liquid, or allowlisted keywords and generics. |
| `checkHardcodedHexColors` | Enabled | Finds literal hex colors in Liquid, CSS, JS, and template `custom_css` where variables or Liquid should be used. |
| `checkHardcodedText` | Enabled | Flags customer-facing prose in snippets/sections Liquid that belongs in locale JSON instead of inline markup. |
| `checkHtmlCommentsInLiquid` | Enabled (diff-only) | With `--diff-file`, flags HTML `<!-- -->` comments on **added** lines in snippets, sections, and blocks Liquid. |
| `checkInlineStyles` | Disabled | When enabled, would restrict `style="..."` on Liquid tags to display, variables, Liquid, and a few composed patterns. |
| `checkJsonCustomCss` | Enabled | Scans `templates/*.json` `custom_css` fields for bad JSON, hex colors, and disallowed font stacks. |
| `checkJsTimers` | Enabled (diff-only) | With `--diff-file`, flags `setInterval` / `setTimeout` on **added** lines in `*.js` and `*.js.liquid` under `assets/`. |
| `checkSchemaLabelSentenceCase` | Enabled | Enforces sentence-case `label` strings in section and block `{% schema %}` JSON with documented naming exceptions. |
| `checkSettingsFavicon` | Enabled | Requires a non-empty favicon string in `config/settings_data.json` at `current.settings.favicon` or `current.favicon`. |
| `checkStyleStaticCssLines` | Enabled | Limits how many non-Liquid lines may appear inside a `<style>` block before static CSS should move to an asset file. |
| `checkTemplateSectionBlockCount` | Enabled | Caps repeated block `type` counts within a single section instance in template JSON to keep the editor manageable. |

**Diff-only:** `checkHtmlCommentsInLiquid`, `checkCssImportant`, and `checkJsTimers` do nothing until a diff map is provided (CLI `--diff-file` or API `run(..., { diff })`). See **Diff mode** and **Diff-only checks** below.

**Invalid schema JSON** inside `{% schema %}` is reported as **`schemaJsonInvalid`** (not a separate `CONFIG` toggle); it is always evaluated where schema blocks are parsed.


### checkHardcodedText

Scans `.liquid` files in `snippets/` and `sections/` for customer‑facing text nodes that should live in `locales/en.default.json`.

- What it flags: visible text between HTML tags, e.g. `>Some text<`, and the same kind of copy when it spans lines (e.g. an opening tag at the end of a line, then text-only lines, then a line that starts the closing tag). Spans that contain Liquid delimiters (`{%`, `{{`, `%}`, `}}`) or obvious JS/CSS/JSON snippets are ignored (they are not treated as locale strings). It also flags **standalone prose lines** (no `<`, `>`, or Liquid delimiters on the line) with at least two word-like tokens, e.g. copy between `{% if %}` / `{% unless %}` and the closing tag — excluding lines that look like developer comments (`Renders …`, `REF:`, etc.), assignments, or script/CSS.
- What it ignores automatically:
  - URLs and paths (`/`, `//`, `./`, `../`, `http://`, `https://`)
  - CSS selectors and technical tokens (e.g., `.class`, `#id`, `data-*`)
  - File names with common extensions (`.js`, `.css`, `.png`, etc.)
  - Text inside `{% schema %} ... {% endschema %}` blocks
  - Text within `{% comment %} ... {% endcomment %}` or `{% doc %} ... {% enddoc %}` (Shopify snippet documentation)
  - Lines that contain Liquid tags/expressions as the text
  - Attribute values like `alt`, `title`, `placeholder`, `aria-label` (use meaningful text there but not flagged here)
  - Technical/implementation fragments such as assignments (`location =`), DOM APIs (`querySelector`), routing keywords, etc.
  - Spans between `>` and `<` that are actually Liquid (`{%`, `{{`, `%}`, `}}`), JS/CSS/JSON snippets, schema.org keys, CSS selector lines, or `key: true|false` style config — not treated as locale strings

Error format:
- `[checkHardcodedText] Error: Text [Some text] must be moved to locales/en.default.json in {file}:{line}`

Notes:
- Multi-line Liquid tags/expressions are skipped while open.
- Multi-line HTML text capture does not start inside `<script>`, `<style>`, or `<noscript>` opening tags (avoids flagging JS/CSS bodies as translatable copy).
- You can suppress per region using the inline guards described above.


### checkHardcodedHexColors

Scans for hardcoded hex colors (`#xxx`, `#xxxxxx`, etc.) that should use CSS variables or Liquid instead.

**Applies to:**
- `.liquid` files in `snippets/` and `sections/` (including inline styles and style blocks)
- `.css` and `*.css.liquid` in `assets/`
- `.js` and `*.js.liquid` in `assets/`
- `custom_css` string fields inside `templates/*.json`

**What it allows:**
- CSS variables (e.g., `var(--color-primary)`)
- Liquid expressions (e.g., `{{ settings.color }}`)

**What it flags:**
- Any hex color literal not wrapped in `var()` or Liquid.

**What it ignores:**
- Hex colors inside `{% schema %} ... {% endschema %}` blocks (these are default values for theme settings, not display colors).

Error format:
- `[checkHardcodedHexColors] Error: Hardcoded hex color in {file}:{line}: {value}`
- `[checkHardcodedHexColors] Error: Hardcoded hex color in custom_css in {file}:{line}`


### checkFontFamily

Scans `.liquid` (in `snippets/`, `sections/`) and `.css`/`*.css.liquid` (in `assets/`) for hardcoded `font-family` declarations.

- Allowed values:
  - CSS variables (contain `var(`)
  - Liquid expressions (`{{ ... }}` or `{% ... %}`)
  - Keywords: `inherit`, `initial`, `unset`, `revert`, `revert-layer`
  - Generic families: `serif`, `sans-serif`, `monospace`, `cursive`, `fantasy`, `system-ui`, `ui-serif`, `ui-sans-serif`, `ui-monospace`, `ui-rounded`, `emoji`, `math`, `fangsong`
  - Approved custom fonts: `Linearicons-Free`, `Round_Monogram_Right`, `Round_Monogram_Left`, `Round_Monogram_Center`

- What it flags:
  - Any `font-family: ...;` where at least one comma‑separated token is not in the allowlists above and is not Liquid/CSS variable.

Error format:
- `[checkFontFamily] Error: Hardcoded font family in {file}:{line}: {value}`


### checkConsoleDebug

Scans `.liquid` (in `snippets/`, `sections/`) and `.js`/`*.js.liquid` (in `assets/`) for debugging statements.

- What it flags: occurrences of `console.log`, `console.debug`, or `debugger`.

Error format:
- `[checkConsoleDebug] Error: Debugging statement in {file}:{line}: {full line}`


### checkCssClassNaming

Validates CSS class names in both markup and styles for the project convention: **kebab-case** with allowed breakpoint prefixes (`large--`, `medium-down--`, etc.). It flags:

- **Single underscore** between non-underscore characters (e.g. `foo_bar`), and  
- **Double underscore** `__` (BEM-style element separators, e.g. `ask-expert__inner`).

Two hyphens `--` in breakpoint-style names (e.g. `large--product-title`) are **not** treated as `__` and are allowed.

- In `.liquid` (snippets/sections/blocks):
  - Parses `class="..."` attributes.
  - Splits out static segments, ignoring Liquid blocks (`{{ ... }}`, `{% ... %}`) and variables.
  - Flags any static class token that violates the rule above.

- In `.css`/`*.css.liquid` (assets/):
  - Scans static CSS selectors in each line and flags class selectors that violate the same rule.

Error format:
- `[checkCssClassNaming] Error: CSS class name '{className}' does not follow kebab-case (no __ or _) in {file}:{line}`


### checkJsonCustomCss

Scans JSON template files (`templates/*.json`) for hardcoded `font-family` values inside any `custom_css` string field.

- What it flags:
  - Hardcoded `font-family` values not allowed by the `checkFontFamily` rules

- What it allows:
  - CSS variables (e.g., `var(--color-primary)`)
  - Liquid expressions (e.g., `{{ settings.color_primary }}`)

Note: Hex colors in `custom_css` are flagged by `checkHardcodedHexColors` instead.

Error format:
- `[checkJsonCustomCss] Error: Hardcoded font family in custom_css in {file}:{line}: {value}`

Notes:
- The line number is approximated by locating the next `"custom_css"` key occurrence in the raw JSON text.


## Diff mode (`--diff-file`)

When you pass a unified diff (CLI: `--diff-file path/to/changes.patch`, API: `run(themePath, { diff: parseUnifiedDiff(text) })`):

- **Most errors** are filtered to **added lines only** (lines beginning with `+` in hunks for paths under the theme), so PR-style runs focus on new/changed code.
- **`checkTemplateSectionBlockCount`**, **`checkSettingsFavicon`**, and **`schemaJsonInvalid`** (invalid JSON inside `{% schema %}`) are **not** limited to the diff: they are always reported when applicable, even if the patch does not touch those files.

### Line-scoped checks with a diff

When a diff map is present, these checks only emit on **added** lines (same line filter as other content checks): **`checkCssEmptyRules`**, **`checkCssPxRem`**, **`checkCssHoverNotMobile`**, **`checkBtnSemantics`**, **`checkStyleStaticCssLines`** (the reported line points at the opening `<style>` of the block). Without a diff, they run on the whole theme as usual.

### Diff-only checks

These run **only when a diff map is provided**; without `--diff-file`, they do nothing (legacy HTML comments or timers elsewhere are not flagged).

- **`checkHtmlCommentsInLiquid`** — in `snippets/`, `sections/`, `blocks/` Liquid: flags `<!-- ... -->` on **added** lines (excludes `<!-- validation-disable:` / `<!-- validation-enable:`). Prefer `{% comment %}`.
- **`checkCssImportant`** — in `assets/*.css` and `*.css.liquid`: flags `!important` on **added** lines (after stripping Liquid on the line).
- **`checkJsTimers`** — in `assets/*.js` and `*.js.liquid`: flags `setInterval(` / `setTimeout(` on **added** lines.

### checkTemplateSectionBlockCount

Reads each OS 2.0 template JSON under `templates/*.json`.

- For each **section instance** in `sections` (each key is one instance on that template), counts how many blocks of each `type` appear under that instance only.
- Counts include **nested** `blocks` on block objects (still the same section instance).
- If any `type` reaches **`maxPerType` or more** (default **10**), emits an error. Counts are **not** summed across different section instances: ten blocks of type `slide` in section `a` and ten in section `b` is allowed.

**Configuration** (`validate-theme.cfg` in the theme root, merged into `CONFIG`):

```json
{
  "CONFIG": {
    "checkTemplateSectionBlockCount": {
      "enabled": true,
      "maxPerType": 8
    }
  }
}
```

- `maxPerType`: minimum count of the same block `type` within one section instance that triggers an error (default **10**).

Error format:

- `[checkTemplateSectionBlockCount] Error: Section instance "…" (section-type): block type "…" appears N times (threshold M). Review whether this should be implemented with Shopify metaobjects instead of many repeated blocks of the same type. in {file}:{line}`

The reported line is approximated as the first line in the raw JSON where that section instance id appears (after `"sections"`).


### checkSchemaLabelSentenceCase

Validates string values for the `"label"` key inside `{% schema %} … {% endschema %}` JSON in **`sections/*.liquid`** and **`blocks/*.liquid`** only.

- **Validation rule (simple):** only the first word may be capitalized; remaining words should be lowercase.
- **Exceptions:** words in the internal exception list (e.g. `PLP`, `PDP`, `V2`, `Mobile`, `Tablet`, `Desktop`, `CTA`, etc.) are allowed with non-lowercase casing. Text inside **single or double quotes** (e.g. `'View All'`, `"Add"`) and inside **balanced parentheses** (e.g. `3 (items)`, `Date (count down from)`) is ignored by this check.
- **Configurable exceptions:** add extra words under `CONFIG.checkSchemaLabelSentenceCase.exceptionWords` in `validate-theme.cfg`; they are merged with the built-in defaults.
- **Skipped:** labels whose value starts with **`t:`** (Shopify translation keys).

Invalid JSON inside the schema block is reported under the **`schemaJsonInvalid`** error type (counted separately).

### checkStyleStaticCssLines

Inside **`<style>`** tags in Liquid under `snippets/`, `sections/`, and `blocks/`, counts **physical lines** of the file that contain **no** Liquid (`{{`, `{{-`, `{%`, `{%-`). If that count **exceeds** `maxLines` (default **30** in `validate-theme.js`; override in `validate-theme.cfg`) before the closing `</style>`, the block should move static CSS to an asset stylesheet.

Note: a long opening tag (e.g. `<nav …>`) with nothing after its closing `>` can start the multiline hardcoded-text capture with an empty interior; the next line (`<style>`) must not leave the `<style>` depth tracker stuck open. The same applies when the captured “interior” is only Liquid (e.g. `{% if … %}`) before a `<style>` line: the line is reprocessed after trimming the interior, so the extra `<style>` open from the first pass is undone.

Lines that belong to a **multiline** Liquid tag or output (opened with `{%` or `{{` on a previous line without its closing `%}` / `}}` on that line) are **not** counted toward this limit, because filter chains and tag bodies often span lines without `{{` / `{%` on every line. The scanner also ignores `>` **inside** Liquid when locating the end of the opening `<style …>` tag, so comparisons such as `{% if x > 1 %}` or `{{ y > 0 }}` in attributes do not truncate the tag early.

### checkCssEmptyRules

Flags **empty CSS rule bodies** such as `body {}` or `body {   }` after stripping Liquid and one-line `/* … */` comments, in:

- `assets/*.css` and `assets/*.css.liquid`
- contents of **`<style>`** in the same Liquid paths as `checkStyleStaticCssLines`

### checkCssPxRem

In the same places as `checkCssEmptyRules`, flags **`px`** lengths where the numeric value is **≥ 8** (use `rem` / `em` instead). **`1px`** through **`7px`** are allowed (hairlines and small offsets).

### checkCssHoverNotMobile

**Line-based:** on each line (after stripping Liquid), if the line contains **`:hover`**, the text **before the first `:hover`** must contain **`.not-mobile`**. Intended for desktop-only hover; multiline selectors or comma-separated selectors on one line can false-positive or false-negative.

### checkBtnSemantics

In `snippets/`, `sections/`, and `blocks/` Liquid: if a tag is **not** `<a>`, `<button>`, or `<input>` but a **`class`** attribute contains an **exact** class token **`btn`** (whitespace-separated; not `btn-wrap`, `btn-primary`, etc.), the same attribute must include the exact token **`ignore-slide-tabindex`**, or the control should be an **`<a>`**, **`<button type="button">`**, or **`<input>`**. Skips when the class value is entirely Liquid.

### checkSettingsFavicon

Requires **`config/settings_data.json`** to parse as JSON and define a **non-empty string** favicon at **`current.settings.favicon`** or **`current.favicon`** (Shopify may export either shape from the theme editor).


## Disabled checks (documented for completeness)

Checks that default to **Disabled** are listed in **Available checks** above. The following subsection documents behavior if you turn them on in `validate-theme.cfg`.

### checkInlineStyles (disabled)
- Would scan inline `style="..."` in `.liquid` and only allow:
  - Any `display: ...`
  - CSS variable assignments (e.g., `--x: value`)
  - Values that are entirely a CSS var (`var(--...)`)
  - Pure Liquid values (`{{ ... }}`)
  - Liquid plus optional CSS unit (e.g., `{{ size }}px`)
  - Sequences composed only of CSS vars and/or Liquid tags
- Anything else would be reported as `[checkInlineStyles]` with the offending value.


## File-level ignores

Inside `validate-theme.js`, `FILE_IGNORES` contains glob patterns mapping to either:
- an array of check names to ignore for matching files, or
- the string `"all"` to ignore every check for those files.

Example entries (actual values live in the script):
```js
{
  'templates/page.*.json': ['checkTemplateSectionBlockCount'],
  'sections/test-hardcoded-text.liquid': ['checkHardcodedText'],
  'assets/photoswipe.css': ['checkCssClassNaming']
}
```


## Notices (attribute text audit)

Some attribute values (e.g. `alt`, `title`, `placeholder`, `aria-label`, `data-*`) may contain hardcoded text that could need translation. These are reported as **notices** for human or AI review, not as errors. Notices do not cause validation to fail.

**Suppress workflow:** After confirming a notice is not an issue, add it to `SUPPRESSED_NOTICES` in `validate-theme.cfg` so it is not shown again:

1. Run validation and review notices.
2. Run: `node validate-theme.js --path ./theme --suppress-notices` to add all current notices to the suppress list.
3. Or add a single notice: `node validate-theme.js --suppress-notice "snippets/foo.liquid|div|aria-label|Close"`

To restore a notice: remove its entry from `SUPPRESSED_NOTICES` in the config.

Notice format: `[notice] (add to ignore) Text in {attr} may need translation in {file}:{line}: "{value}"` — the `(add to ignore)` part is a terminal hyperlink; in supported terminals, Ctrl+click / Cmd+click adds that notice to the suppress list.

**Protocol handler setup (one-time):** If Ctrl+click / Cmd+click opens "Get an app to open this link" instead of suppressing the notice, register the protocol handler:

- **Windows:** Run `powershell -ExecutionPolicy Bypass -File scripts\register-suppress-protocol.ps1` from the project directory.
- **macOS:** Run `./scripts/register-suppress-protocol-mac.sh`, then open the created app once (`open ValidateThemeSuppress.app`) or move it to `~/Applications/`.

This registers `validate-theme-suppress:` so the OS invokes the handler script. Requires Node.js. The validator writes the last theme path to `~/.validate-theme-last-path` on each run so the handler knows which theme's config to update.


## Output and exit code

- When no issues are found: `Validation completed! No errors found.`
- When issues exist: prints a total count, a summary per check type, and exits with code `2`.


## Running tests

Tests use Node.js built-in test runner (`node:test`). Run all tests:

```bash
node --test tests/
```

Tests set `VALIDATE_THEME_SKIP_CONFIG=1` so no `validate-theme.cfg` is created in fixture directories. The validator only creates the config file when run as a CLI (not in test mode).

Or a specific file:
```bash
node --test tests/validate-theme.test.js
```

Test structure:
- `tests/fixtures/` contains per-check fixtures; each has `positive/` (code that should trigger the check) and `negative/` (similar code that should not).
- Tests assert that positive fixtures produce the expected errors and negative fixtures produce none for that check type.


## Tips

- Prefer translations for customer‑visible strings via `{{ t 'key' }}` and maintain entries in `locales/en.default.json`.
- Use CSS variables or Liquid for design tokens (colors, fonts) instead of hardcoding values.
- Use inline guards judiciously and keep them temporary.