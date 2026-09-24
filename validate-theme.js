// USAGE: 
// Run from theme root:        `node validate-theme.js`
// Run from any location:       `node validate-theme.js --path ./path/to/theme` or `node validate-theme.js -p ./path/to/theme`
// Only specific files (paths relative to theme root, comma-separated or repeat --files):  `node validate-theme.js -p ./theme --files snippets/a.liquid,sections/b.liquid`
// Diff mode: `--diff-file` filters most errors to added lines only; `checkTemplateSectionBlockCount` still applies to all `templates/*.json` (see VALIDATE-THEME.md).
// On added lines only when a diff is provided: checkHtmlCommentsInLiquid, checkCssImportant, checkJsTimers.
// Write notices (text in attributes for human/AI audit) to file:  `node validate-theme.js --notices-file notices.txt`
// Suppress notices (add to ignore list after confirming they are not issues):  `node validate-theme.js --suppress-notices` or `node validate-theme.js --suppress-notice "rel|firstWord|attr|value"`
// Skip creating validate-theme.cfg when missing (used by tests):  `node validate-theme.js --skip-config --path ./theme`
//
// Example to exclude parts of a file from validation:
// HTML:   <!-- validation-disable:checkConsoleDebug --> ... <!-- validation-enable:checkConsoleDebug -->
// CSS/JS: /* validation-disable:checkConsoleDebug */ ... /* validation-enable:checkConsoleDebug */
// Liquid: {% comment %}validation-disable:checkConsoleDebug{% endcomment %} ... {% comment %}validation-enable:checkConsoleDebug{% endcomment %}
//
// Example to disable all checks in part of a file:
// <!-- validation-disable:all --> or /* validation-disable:all */ or {% comment %}validation-disable:all{% endcomment %}
//
// To disable checks in a file use FILE_IGNORES in validate-theme.cfg (project root)

const fs = require('fs');
const os = require('os');
const path = require('path');

const DEFAULT_SCHEMA_LABEL_EXCEPTION_WORDS = [
  'desktop', 'mobile', 'tablet', 'pdp', 'plp', 'hp', 'v2', 'cta',
  'css', 'id', 'url', 'api', 'html', 'svg', 'mp4', 'atc', 'sku',
  'seo', 'gwp', 'json', 'csv', 'pdf', 'faq', 'dns', 'ssl', 'vat', 'h1',
  'roi', 'rpm', 'php', 'uid', 'uuid', 'sql', 'recommendations',
  'youtube', 'vimeo', 'home', 'collection', 'product', 'article', 'blog'
];

const DEFAULT_CFG = {
  CONFIG: {
    checkHardcodedText: { enabled: true },
    checkHardcodedHexColors: { enabled: true },
    checkFontFamily: {
      enabled: true,
      allowedFontKeywords: ['inherit', 'initial', 'unset', 'revert', 'revert-layer'],
      allowedGenericFamilies: ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded', 'emoji', 'math', 'fangsong'],
      allowedCustomFonts: ['Linearicons-Free', 'Round_Monogram_Right', 'Round_Monogram_Left', 'Round_Monogram_Center']
    },
    checkConsoleDebug: { enabled: true },
    checkCssClassNaming: { enabled: true },
    checkInlineStyles: { enabled: false },
    checkJsonCustomCss: { enabled: true },
    checkHtmlCommentsInLiquid: { enabled: true },
    checkCssImportant: { enabled: true },
    checkJsTimers: { enabled: true },
    checkTemplateSectionBlockCount: { enabled: true, maxPerType: 10 },
    checkSchemaLabelSentenceCase: { enabled: true, exceptionWords: [...DEFAULT_SCHEMA_LABEL_EXCEPTION_WORDS] },
    checkStyleStaticCssLines: { enabled: true, maxLines: 30 },
    checkCssEmptyRules: { enabled: true },
    checkCssPxRem: { enabled: true },
    checkCssHoverNotMobile: { enabled: true },
    checkBtnSemantics: { enabled: true },
    checkSettingsFavicon: { enabled: true },
  },
  FILE_IGNORES: {
    'templates/page.*.json': ['checkTemplateSectionBlockCount'],
  },
  SUPPRESSED_NOTICES: []
};

function parsePathArg() {
  const args = process.argv.slice(2);
  const pathIndex = args.findIndex(a => a === '--path' || a === '-p');
  if (pathIndex === -1) return process.cwd();
  const value = args[pathIndex + 1];
  if (!value || value.startsWith('-')) {
    console.error('Error: --path or -p requires a directory path.');
    process.exit(1);
  }
  const resolved = path.resolve(process.cwd(), value);
  if (!fs.existsSync(resolved)) {
    console.error(`Error: Path does not exist: ${resolved}`);
    process.exit(1);
  }
  const stat = fs.statSync(resolved);
  if (!stat.isDirectory()) {
    console.error(`Error: Path is not a directory: ${resolved}`);
    process.exit(1);
  }
  return resolved;
}

function parseDiffFileArg() {
  const args = process.argv.slice(2);
  const idx = args.findIndex(a => a === '--diff-file');
  if (idx === -1) return null;
  const value = args[idx + 1];
  if (!value || value.startsWith('-')) {
    console.error('Error: --diff-file requires a file path.');
    process.exit(1);
  }
  const resolved = path.resolve(process.cwd(), value);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    console.error(`Error: Diff file does not exist or is not a file: ${resolved}`);
    process.exit(1);
  }
  return resolved;
}

function parseNoticesFileArg() {
  const args = process.argv.slice(2);
  const idx = args.findIndex(a => a === '--notices-file');
  if (idx === -1) return null;
  const value = args[idx + 1];
  if (!value || value.startsWith('-')) {
    console.error('Error: --notices-file requires a file path.');
    process.exit(1);
  }
  return path.resolve(process.cwd(), value);
}

function parseSuppressNoticesArg() {
  return process.argv.slice(2).includes('--suppress-notices');
}

function parseSuppressNoticeArg() {
  const args = process.argv.slice(2);
  const idx = args.findIndex(a => a === '--suppress-notice');
  if (idx === -1) return null;
  let value = args[idx + 1];
  if (!value || value.startsWith('-')) {
    console.error('Error: --suppress-notice requires a notice key (e.g. "snippets/foo.liquid|div|title|Title").');
    process.exit(1);
  }
  try {
    value = decodeURIComponent(value);
  } catch (_) {
    // use as-is if decoding fails
  }
  return value;
}

/** Resolves userPath to an absolute path inside themeRoot, or null if outside / invalid. */
function resolvePathInsideTheme(themeRoot, userPath) {
  const root = path.resolve(themeRoot);
  const trimmed = String(userPath || '').trim();
  if (!trimmed) return null;
  const abs = path.isAbsolute(trimmed) ? path.resolve(trimmed) : path.resolve(root, trimmed);
  const rel = path.relative(root, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return abs;
}

/**
 * CLI: --files path1,path2  and/or repeated --files path3
 * Paths are relative to the theme root (--path), unless absolute and still inside the theme.
 * Returns null if --files was never passed (validate entire theme).
 */
function parseFilesArg() {
  const args = process.argv.slice(2);
  const paths = [];
  let used = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--files') {
      used = true;
      const val = args[i + 1];
      if (!val || val.startsWith('-')) {
        console.error('Error: --files requires path(s) (comma-separated, theme-relative, or repeat --files).');
        process.exit(1);
      }
      val.split(',').forEach((p) => {
        const t = p.trim();
        if (t) paths.push(t);
      });
      i++;
    }
  }
  if (used && paths.length === 0) {
    console.error('Error: --files requires at least one non-empty path.');
    process.exit(1);
  }
  return used ? paths : null;
}

function resolveListedThemeFiles(themeRoot, rawPaths) {
  const rootResolved = path.resolve(themeRoot);
  const resolvedList = [];
  const seen = new Set();
  for (const raw of rawPaths) {
    const abs = resolvePathInsideTheme(rootResolved, raw);
    if (!abs) {
      throw new Error(`File path is not inside the theme directory: ${raw}`);
    }
    const key = path.resolve(abs);
    if (seen.has(key)) continue;
    seen.add(key);
    if (!fs.existsSync(key)) {
      throw new Error(`File does not exist: ${raw}`);
    }
    if (!fs.statSync(key).isFile()) {
      throw new Error(`Not a regular file: ${raw}`);
    }
    resolvedList.push(key);
  }
  return resolvedList;
}

/** Error types that are always reported when using --diff-file (full-theme checks; not limited to added lines). */
const DIFF_FILTER_EXEMPT_ERROR_TYPES = new Set([
  'templateSectionBlockCount',
  'settingsFavicon',
  'schemaJsonInvalid',
]);

function parseUnifiedDiff(diffText) {
  const result = new Map();
  const blocks = diffText.split(/^diff --git /m).filter(Boolean);
  for (const block of blocks) {
    const firstLine = block.split('\n')[0];
    const match = firstLine.match(/^a\/(.+?)\s+b\/(.+)$/);
    if (!match) continue;
    const filePath = match[2].replace(/\\/g, '/');
    if (!result.has(filePath)) result.set(filePath, new Set());
    const addedLines = result.get(filePath);
    const lines = block.split('\n');
    let newLineNum = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const hunkMatch = line.match(/^@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
      if (hunkMatch) {
        newLineNum = parseInt(hunkMatch[3], 10);
        continue;
      }
      if (line.startsWith('+') && !line.startsWith('+++')) {
        addedLines.add(newLineNum);
        newLineNum++;
      } else if (line.startsWith(' ') || line === '') {
        newLineNum++;
      }
    }
  }
  return result;
}

function filterErrorsByDiff(errors, addedLinesByFile) {
  return errors.filter((e) => {
    if (DIFF_FILTER_EXEMPT_ERROR_TYPES.has(e.type)) return true;
    const rel = e.rel.replace(/\\/g, '/');
    const fileLines = addedLinesByFile.get(rel);
    if (!fileLines) return false;
    return fileLines.has(e.line);
  });
}

function filterNoticesByDiff(notices, addedLinesByFile) {
  return notices.filter((n) => {
    const rel = n.rel.replace(/\\/g, '/');
    const fileLines = addedLinesByFile.get(rel);
    if (!fileLines) return false;
    return fileLines.has(n.line);
  });
}

const SKIP_CONFIG_CREATE = process.argv.includes('--skip-config') || process.env.VALIDATE_THEME_SKIP_CONFIG === '1';
const THEME_ROOT = parsePathArg();

function getConfigPath(themeRoot) {
  return path.join(themeRoot, 'validate-theme.cfg');
}

function getLastThemePathFile() {
  return path.join(os.homedir(), '.validate-theme-last-path');
}

function writeLastThemePath(themeRoot) {
  try {
    const normalized = path.resolve(themeRoot);
    fs.writeFileSync(getLastThemePathFile(), normalized, 'utf8');
  } catch (_) {
    // ignore; protocol handler will fallback
  }
}

function loadConfig(themeRoot) {
  const cfgPath = getConfigPath(themeRoot);
  if (!fs.existsSync(cfgPath)) {
    if (SKIP_CONFIG_CREATE) {
      return { CONFIG: { ...DEFAULT_CFG.CONFIG }, FILE_IGNORES: { ...DEFAULT_CFG.FILE_IGNORES }, SUPPRESSED_NOTICES: [] };
    }
    fs.writeFileSync(cfgPath, JSON.stringify(DEFAULT_CFG, null, 2), 'utf8');
    return { CONFIG: { ...DEFAULT_CFG.CONFIG }, FILE_IGNORES: { ...DEFAULT_CFG.FILE_IGNORES }, SUPPRESSED_NOTICES: [] };
  }
  let raw;
  try {
    raw = fs.readFileSync(cfgPath, 'utf8');
  } catch (e) {
    console.error(`Error reading ${cfgPath}:`, e.message);
    process.exit(1);
  }
  const cleaned = stripJsonCommentsSafe(raw);
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error(`Error parsing ${cfgPath}:`, e.message);
    process.exit(1);
  }
  const CONFIG = { ...DEFAULT_CFG.CONFIG };
  if (parsed.CONFIG) {
    for (const k of Object.keys(parsed.CONFIG)) {
      CONFIG[k] = { ...(CONFIG[k] || {}), ...parsed.CONFIG[k] };
    }
  }
  const FILE_IGNORES =
    parsed.FILE_IGNORES && typeof parsed.FILE_IGNORES === 'object'
      ? { ...DEFAULT_CFG.FILE_IGNORES, ...parsed.FILE_IGNORES }
      : { ...DEFAULT_CFG.FILE_IGNORES };
  const SUPPRESSED_NOTICES = Array.isArray(parsed.SUPPRESSED_NOTICES) ? parsed.SUPPRESSED_NOTICES : [];
  return { CONFIG, FILE_IGNORES, SUPPRESSED_NOTICES };
}

const { CONFIG, FILE_IGNORES, SUPPRESSED_NOTICES: SUPPRESSED_NOTICES_LIST } = loadConfig(THEME_ROOT);
const SUPPRESSED_NOTICES_SET = new Set(SUPPRESSED_NOTICES_LIST || []);

function refreshSuppressedNoticesSet(themeRoot) {
  const resolved = path.resolve(themeRoot);
  const { SUPPRESSED_NOTICES } = loadConfig(resolved);
  SUPPRESSED_NOTICES_SET.clear();
  (SUPPRESSED_NOTICES || []).forEach((k) => {
    try {
      SUPPRESSED_NOTICES_SET.add(decodeURIComponent(k));
    } catch (_) {
      SUPPRESSED_NOTICES_SET.add(k);
    }
  });
}

let ROOT;
let SNIPPETS_DIR;
let SECTIONS_DIR;
let BLOCKS_DIR;
let ASSETS_DIR;
let TEMPLATES_DIR;
let CONFIG_DIR;

function initializePaths(rootPath) {
  ROOT = rootPath;
  SNIPPETS_DIR = path.join(ROOT, 'snippets');
  SECTIONS_DIR = path.join(ROOT, 'sections');
  BLOCKS_DIR = path.join(ROOT, 'blocks');
  ASSETS_DIR = path.join(ROOT, 'assets');
  TEMPLATES_DIR = path.join(ROOT, 'templates');
  CONFIG_DIR = path.join(ROOT, 'config');
}

initializePaths(THEME_ROOT);

// Regex for code-based ignores
const HTML_DISABLE_REGEX = /<!--\s*validation-disable:([a-zA-Z,]+|all)\s*-->/;
const HTML_ENABLE_REGEX = /<!--\s*validation-enable:([a-zA-Z,]+|all)\s*-->/;
const CSS_JS_DISABLE_REGEX = /\/\*\s*validation-disable:([a-zA-Z,]+|all)\s*\*\//;
const CSS_JS_ENABLE_REGEX = /\/\*\s*validation-enable:([a-zA-Z,]+|all)\s*\*\//;
const LIQUID_DISABLE_REGEX = /\{%\s*comment\s*%\}\s*validation-disable:([a-zA-Z,]+|all)\s*\{%\s*endcomment\s*%\}/;
const LIQUID_ENABLE_REGEX = /\{%\s*comment\s*%\}\s*validation-enable:([a-zA-Z,]+|all)\s*\{%\s*endcomment\s*%\}/;

const HEX_COLOR_REGEX = /#[0-9a-fA-F]{3,8}\b/;
const FONT_FAMILY_REGEX = /font-family\s*:\s*([^;\n]+);/;
const CONSOLE_DEBUG_REGEX = /\b(console\.(log|debug)|debugger)\b/;
const JS_TIMER_REGEX = /\b(setInterval|setTimeout)\s*\(/;
const CSS_IMPORTANT_REGEX = /!important\b/;
const HTML_COMMENT_OPEN_REGEX = /<!--/;
const HTML_COMMENT_VALIDATION_GUARD_REGEX = /<!--\s*validation-(?:disable|enable):/;
const CSS_CLASS_REGEX = /class\s*=\s*"([^"]+)"/g;
const CLASS_NAME_FORMAT = /^(?:(large|medium|small|medium-down|medium-up)--)?[a-z0-9]+(?:-[a-z0-9]+)*$/;
const INLINE_STYLE_REGEX = /\bstyle\s*=\s*"([^"]*)"/g;
const ALLOWED_INLINE_STYLE = /^\s*display\s*:\s*none\s*;?\s*$/i;
const LIQUID_VAR_REGEX = /\{\{.*?\}\}|\{%.+?%\}/;
const CSS_VAR_REGEX = /var\(--[a-zA-Z0-9-_]+\)/;
const HARD_CODED_TEXT_REGEX = />([^<>{}\[\]\n\r]+)</g;
const TRANSLATION_TAG_REGEX = /\{\{\s*t\s+['"][^'"]+['"]\s*\}\}/;
const ATTR_VALUE_REGEX = /\b(alt|title|placeholder|aria-label|data-[a-z0-9_-]+)\s*=\s*["']([^"']*)["']/gi;
const TECHNICAL_ATTR_VALUES = new Set([
  'error', 'success', 'warning', 'info', 'type', 'id', 'key', 'true', 'false',
  'none', 'auto', 'scroll', 'manual', 'mixed', 'autoplay', 'youtube', 'up', 'down',
]);
const LIQUID_TAG_OR_EXPR_REGEX = /^(\{%-?\s*.*?\s*-?%\}|\{\{-?\s*.*?\s*-?\}\})$/;
const CSS_CLASS_NAMES_REGEX = /(^|[^_])_([^_]|$)/;

/** Kebab-case convention: no single `_` between non-underscores, and no BEM-style `__`. */
function hasNonStandardCssClassName(cls) {
  if (!cls || cls === '-' || cls === '--') return false;
  if (cls.includes('__')) return true;
  return CSS_CLASS_NAMES_REGEX.test(cls);
}
const LIQUID_ONLY_REGEX = /^\s*\{\{.*\}\}\s*$/;
const CSS_VAR_ONLY_REGEX = /^\s*var\(--[a-zA-Z0-9-_]+\)\s*;?\s*$/;
const LIQUID_PLUS_UNIT_REGEX = /^\s*\{\{.*\}\}\s*(px|em|rem|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc)?\s*;?\s*$/i;

// Error counters and collected errors (per run)
const ERROR_OUTPUT_SEPARATOR = '_______________________________________';

function printCollectedErrors(collected) {
  if (!collected || collected.length === 0) return;
  collected.forEach((e, i) => {
    if (i > 0) console.error('\n' + ERROR_OUTPUT_SEPARATOR + '\n');
    console.error(e.message);
  });
}

const ERROR_COUNT_KEYS = [
  'hardcodedText',
  'hardcodedHexColors',
  'fontFamily',
  'consoleDebug',
  'cssClassNaming',
  'inlineStyles',
  'jsonCustomCss',
  'htmlCommentsInLiquid',
  'cssImportant',
  'jsTimers',
  'templateSectionBlockCount',
  'schemaLabelSentenceCase',
  'schemaJsonInvalid',
  'styleStaticCssLines',
  'cssEmptyRules',
  'cssPxRem',
  'cssHoverNotMobile',
  'btnSemantics',
  'settingsFavicon',
];
let runState = null;

function getFirstWord(line) {
  const m = /[a-zA-Z_][a-zA-Z0-9_-]*/.exec((line || '').trim());
  return m ? m[0] : '';
}

function buildNoticeKey(rel, firstWord, attr, value) {
  const r = (rel || '').replace(/\\/g, '/');
  return `${r}|${firstWord}|${attr || ''}|${value || ''}`;
}

function isLikelyTechnicalAttrValue(value, line) {
  const v = value.trim();
  const vLower = v.toLowerCase();
  if (!v || v.length < 2) return true;
  if (TECHNICAL_ATTR_VALUES.has(vLower)) return true;
  // Liquid fragments: [^"']* truncates at nested quotes, yielding "{{ " or "{% render " - skip these
  if (/\{\{|\{%|\}\}|\%\}|\|/.test(v)) return true;
  // Translation key format: section.key or product_card_atc.close_quick_add_caption
  if (/^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)+$/.test(v)) return true;
  // Liquid object access: properties[ or items[ - not user-facing text
  if (v.includes('properties[') || v.includes('items[')) return true;
  // Numeric, selectors, URLs
  if (/^\d+%?$/.test(v) || /^[.#]/.test(v) || v.includes('//')) return true;
  return false;
}

// Centralized messages and emitter to avoid duplication in logs
const MESSAGES = {
  codeLine: (snippet) => {
    const s = String(snippet || '').trim();
    return s ? `\nCODE:\n${s}` : '';
  },
  hardcodedText: (rel, idx, text) => `[checkHardcodedText] Error: Text [${text}] must be moved to locales/en.default.json in ${rel}:${idx + 1}`,
  hardcodedHexColors: (rel, idx, value) => `[checkHardcodedHexColors] Error: Hardcoded hex color in ${rel}:${idx + 1}: ${String(value).trim()}`,
  fontFamily: (rel, idx, value) => `[checkFontFamily] Error: Hardcoded font family in ${rel}:${idx + 1}: ${String(value).trim()}`,
  inlineStyles: (rel, idx, value) => `[checkInlineStyles] Error: Inline style not allowed in ${rel}:${idx + 1}: style="${String(value)}"`,
  cssClassNaming: (rel, idx, cls) => `[checkCssClassNaming] Error: CSS class name '${cls}' does not follow kebab-case (no __ or _) in ${rel}:${idx + 1}`,
  consoleDebug: (rel, idx, value) => `[checkConsoleDebug] Error: Debugging statement in ${rel}:${idx + 1}: ${String(value).trim()}`,
  jsonInvalid: (rel) => `[checkJsonCustomCss] Error: Invalid JSON in ${rel}:1`,
  hardcodedHexColorsCustomCss: (rel, idx) => `[checkHardcodedHexColors] Error: Hardcoded hex color in custom_css in ${rel}:${(idx ?? 0) + 1}`,
  jsonFontFamily: (rel, value, idx) => `[checkJsonCustomCss] Error: Hardcoded font family in custom_css in ${rel}:${(idx ?? 0) + 1}: ${String(value).trim()}`,
  htmlCommentsInLiquid: (rel, idx, line) => {
    return `[checkHtmlCommentsInLiquid] Error: Use {% comment %} instead of HTML <!-- --> comments in ${rel}:${idx + 1}${MESSAGES.codeLine(line)}`;
  },
  cssImportant: (rel, idx, line) => {
    return `[checkCssImportant] Error: Avoid !important in ${rel}:${idx + 1} (prefer specificity or variables)${MESSAGES.codeLine(line)}`;
  },
  jsTimers: (rel, idx, line) =>
    `[checkJsTimers] Error: Prefer MutationObserver or Promise instead of setInterval/setTimeout in ${rel}:${idx + 1}${MESSAGES.codeLine(line)}`,
  templateSectionBlockCount: (rel, idx, detail) =>
    `[checkTemplateSectionBlockCount] Error: ${detail} in ${rel}:${idx + 1}`,
  schemaLabelSentenceCase: (rel, idx, payload) => {
    const got = String(payload);
    const expected = canonicalSchemaLabelSentence(got);
    let msg =
      `[checkSchemaLabelSentenceCase] Error: Schema label must use sentence case (only the first word capitalized; words Desktop, Mobile, Tablet, PDP, PLP, HP, CTA, etc. keep their conventional caps). Got ${JSON.stringify(got)}`;
    if (expected !== got) {
      msg += `; expected ${JSON.stringify(expected)}`;
    }
    return `${msg} in ${rel}:${idx + 1}`;
  },
  schemaJsonInvalid: (rel, idx, detail) =>
    `[checkSchemaLabelSentenceCase] Error: Invalid JSON in {% schema %} block in ${rel}:${idx + 1}${detail ? `: ${detail}` : ''}`,
  styleStaticCssLines: (rel, idx, payload) =>
    `[checkStyleStaticCssLines] Error: More than ${payload.maxLines} non-Liquid lines inside <style> (move static CSS to a .css asset). Found ${payload.count} lines starting near ${rel}:${idx + 1}`,
  cssEmptyRules: (rel, idx, payload) =>
    `[checkCssEmptyRules] Error: Empty CSS rule in ${rel}:${idx + 1}: ${String(payload).trim()}`,
  cssPxRem: (rel, idx, payload) =>
    `[checkCssPxRem] Error: Use rem or em instead of px for sizes >= 8px in ${rel}:${idx + 1}: ${String(payload).trim()}`,
  cssHoverNotMobile: (rel, idx, line) => {
    return `[checkCssHoverNotMobile] Error: Line with :hover must include .not-mobile before the first :hover in ${rel}:${idx + 1}${MESSAGES.codeLine(line)}`;
  },
  btnSemantics: (rel, idx, payload) =>
    `[checkBtnSemantics] Error: exact class token "btn" (not e.g. btn-wrap) on this element requires <a>, <button type="button">, <input>, or class ignore-slide-tabindex in ${rel}:${idx + 1}: ${String(payload).trim()}`,
  settingsFavicon: (rel, idx, detail) =>
    `[checkSettingsFavicon] Error: config/settings_data.json must set a non-empty favicon at current.settings.favicon or current.favicon in ${rel}:${idx + 1}${detail ? ` (${detail})` : ''}`,
};

function emitError(typeKey, rel, idx, payload) {
  if (!runState) return;
  runState.errors++;
  const countKey = typeKey === 'jsonInvalid' ? 'jsonCustomCss'
    : typeKey === 'hardcodedHexColorsCustomCss' ? 'hardcodedHexColors'
    : typeKey;
  if (runState.errorCounts.hasOwnProperty(countKey)) {
    runState.errorCounts[countKey]++;
  }
  let message;
  const msgBuilder = MESSAGES[typeKey];
  if (typeof msgBuilder === 'function') {
    message = typeKey === 'hardcodedHexColorsCustomCss' ? msgBuilder(rel, idx) : msgBuilder(rel, idx, payload);
  } else if (typeof payload === 'string') {
    message = payload;
  } else {
    message = String(payload);
  }
  runState.collected.push({ type: countKey, rel, line: idx + 1, payload, message });
  if (!runState.silent && !runState.diffMode && !runState.deferOutput) {
    console.error(message);
  }
}

function makeNoticeHyperlink(key) {
  const url = `validate-theme-suppress:${key}`;
  const esc = (s) => `\x1b]8;;${s}\x1b\\`;
  return `${esc(url)}(add to ignore)\x1b]8;;\x1b\\`;
}

function emitNotice(rel, idx, attr, value, key) {
  if (!runState || !runState.notices) return;
  const lineNum = idx + 1;
  const addToIgnore = makeNoticeHyperlink(key);
  const message = `[notice] ${addToIgnore} Text in ${attr} may need translation in ${rel}:${lineNum}: "${value}"`;
  runState.notices.push({
    type: 'hardcodedTextInAttr',
    rel,
    line: lineNum,
    attr,
    value,
    key,
    message,
  });
}

// Build allowlists from CONFIG (normalize to lowercase for comparisons)
const ALLOWED_FONT_KEYWORDS = new Set((CONFIG.checkFontFamily.allowedFontKeywords || []).map(s => s.toLowerCase()));
const ALLOWED_GENERIC_FAMILIES = new Set((CONFIG.checkFontFamily.allowedGenericFamilies || []).map(s => s.toLowerCase()));
const ALLOWED_CUSTOM_FONTS = new Set((CONFIG.checkFontFamily.allowedCustomFonts || []).map(s => s.toLowerCase()));

function stripQuotes(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith('\'') && trimmed.endsWith('\''))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function splitFontFamilyList(value) {
  // Split on commas that are not inside quotes
  const parts = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      current += ch;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      current += ch;
      continue;
    }
    if (ch === ',' && !inSingle && !inDouble) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim() !== '') parts.push(current.trim());
  return parts;
}

function normalizeFamilyName(name) {
  return stripQuotes(name).trim().toLowerCase();
}

function isAllowedFontToken(token) {
  const name = normalizeFamilyName(token);
  if (name === '') return true;
  if (name.includes('var(')) return true;
  if (name.includes('{{') || name.includes('{%')) return true;
  if (ALLOWED_FONT_KEYWORDS.has(name)) return true;
  if (ALLOWED_GENERIC_FAMILIES.has(name)) return true;
  if (ALLOWED_CUSTOM_FONTS.has(name)) return true;
  return false;
}

function findFirstDisallowedFont(tokens) {
  for (const token of tokens) {
    if (!isAllowedFontToken(token)) return token;
  }
  return null;
}

function isAllowedFontFamilyValue(value) {
  const val = String(value || '').trim();
  if (val === '') return true;
  // If any CSS var or Liquid is present, allow
  if (val.includes('var(') || val.includes('{{') || val.includes('{%')) return true;
  const tokens = splitFontFamilyList(val);
  return findFirstDisallowedFont(tokens) === null;
}

// --- Scanners (shared) ---
function scanHexColor(line) {
  if (!HEX_COLOR_REGEX.test(line)) return null;
  // Strip Liquid and var() so we can detect hex in remaining static CSS
  // (e.g. #shopify-section-{{ id }} .cls {color: #fff;} or color: var(--x); color: #fff;)
  let stripped = line.replace(/\{%-?[^%]*-?%\}|\{\{-?[^}]*\}\}/g, ' ');
  stripped = stripped.replace(/var\(--[a-zA-Z0-9-_]+\)/g, ' ');
  if (!HEX_COLOR_REGEX.test(stripped)) return null;
  return line.trim();
}

function scanFontFamily(line) {
  const match = FONT_FAMILY_REGEX.exec(line);
  if (!match) return null;
  const value = match[1];
  if (isAllowedFontFamilyValue(value)) return null;
  return value.trim();
}

function scanCssClassNamingFromCssLine(staticCssLine) {
  const offenders = [];
  const classSelectorRegex = /\.(\w[\w-]*)/g;
  let classMatch;
  while ((classMatch = classSelectorRegex.exec(staticCssLine)) !== null) {
    const cls = classMatch[1];
    if (hasNonStandardCssClassName(cls)) {
      offenders.push(cls);
    }
  }
  return offenders;
}

/** Remove Liquid tags/expressions from a line for CSS-oriented checks (same as checkCssFile). */
function stripLiquidForCssLine(line) {
  return line.replace(/\{%-?[^%]*-?%\}|\{\{-?[^}]*-?\}\}/g, '');
}

/**
 * Replace Liquid outputs and tags with spaces (same length) so `<style…>` / `</style>` detection
 * does not treat `>` (or similar) inside Liquid as the end of the HTML tag.
 */
function maskLiquidForStyleTagScan(line) {
  return line
    .replace(/\{\{-?[\s\S]*?-?\}\}/g, (m) => ' '.repeat(m.length))
    .replace(/\{%-?[\s\S]*?-?%\}/g, (m) => ' '.repeat(m.length));
}

const LIQUID_TOKEN_IN_LINE_REGEX = /\{\{-?|\{%-?/;
const CSS_EMPTY_RULE_BODY_REGEX = /\{[\s]*\}/g;
const CSS_PX_MEASURE_REGEX = /(\d+(?:\.\d+)?)px/gi;
const BTN_CLASS_IN_ATTR_REGEX_DQ = /<(?!(?:button|input)\b)(\w+)\b[^>]*\bclass\s*=\s*"([^"]*)"/gi;
const BTN_CLASS_IN_ATTR_REGEX_SQ = /<(?!(?:button|input)\b)(\w+)\b[^>]*\bclass\s*=\s*'([^']*)'/gi;

function stripCssCommentsOneLine(staticLine) {
  return staticLine.replace(/\/\*[\s\S]*?\*\//g, ' ');
}

function buildCodeContext(lines, idx, before = 2, after = 2) {
  if (!Array.isArray(lines) || idx < 0 || idx >= lines.length) return '';
  const start = Math.max(0, idx - before);
  const end = Math.min(lines.length - 1, idx + after);
  return lines.slice(start, end + 1).join('\n').trim();
}

/**
 * True if `staticLine` contains an empty `{ }` rule after comments/Liquid strip.
 * `rawCssLine` is the original CSS segment (before stripLiquidForCssLine); when it shows
 * Liquid immediately inside `{ … }` (e.g. `{ {{ thumbStyle }} }`), declarations may exist only
 * at render time — not a real empty rule.
 */
function scanCssEmptyRulesOnLine(staticLine, rawCssLine) {
  const stripped = stripCssCommentsOneLine(staticLine);
  CSS_EMPTY_RULE_BODY_REGEX.lastIndex = 0;
  if (!CSS_EMPTY_RULE_BODY_REGEX.test(stripped)) return false;
  const raw = rawCssLine != null && rawCssLine !== '' ? rawCssLine : staticLine;
  if (/\{\s*(\{\{|\{%-|\{%)/.test(raw)) return false;
  return true;
}

function scanCssPxRemOffender(staticLine) {
  CSS_PX_MEASURE_REGEX.lastIndex = 0;
  let m;
  while ((m = CSS_PX_MEASURE_REGEX.exec(staticLine)) !== null) {
    const n = parseFloat(m[1], 10);
    if (n >= 8) return m[0];
  }
  return null;
}

function scanCssHoverMissingNotMobile(staticLine) {
  const lower = staticLine.toLowerCase();
  const hoverIdx = lower.indexOf(':hover');
  if (hoverIdx === -1) return false;
  return !lower.slice(0, hoverIdx).includes('.not-mobile');
}

/** Non–diff-mode: always; diff-mode: only added lines. */
function shouldApplyLineScopedCheck(configKey, ignoreCheckName, file, rel, line0BasedIdx, disabledChecks) {
  if (!CONFIG[configKey]?.enabled) return false;
  if (disabledChecks[configKey]) return false;
  if (shouldIgnoreCheck(file, ignoreCheckName)) return false;
  if (runState?.diffMode && runState.diffAddedLines) {
    return isLineInDiffAddedSet(rel, line0BasedIdx);
  }
  return true;
}

function runSharedCssLineChecks(file, rel, lineIdx, staticLine, disabledChecks, rawCssLine) {
  if (!staticLine || !String(staticLine).trim()) return;
  if (shouldApplyLineScopedCheck('checkCssEmptyRules', 'checkCssEmptyRules', file, rel, lineIdx, disabledChecks) &&
      scanCssEmptyRulesOnLine(staticLine, rawCssLine)) {
    emitError('cssEmptyRules', rel, lineIdx, staticLine.trim().slice(0, 200));
  }
  if (shouldApplyLineScopedCheck('checkCssPxRem', 'checkCssPxRem', file, rel, lineIdx, disabledChecks)) {
    const pxBad = scanCssPxRemOffender(staticLine);
    if (pxBad) emitError('cssPxRem', rel, lineIdx, pxBad);
  }
  if (shouldApplyLineScopedCheck('checkCssHoverNotMobile', 'checkCssHoverNotMobile', file, rel, lineIdx, disabledChecks) &&
      scanCssHoverMissingNotMobile(staticLine)) {
    emitError('cssHoverNotMobile', rel, lineIdx, staticLine.trim().slice(0, 220));
  }
}

/** Words that can keep non-lowercase casing after first word (case-insensitive). */
const SCHEMA_LABEL_EXCEPTION_WORDS = new Set([
  ...DEFAULT_SCHEMA_LABEL_EXCEPTION_WORDS,
  ...((CONFIG.checkSchemaLabelSentenceCase && Array.isArray(CONFIG.checkSchemaLabelSentenceCase.exceptionWords))
    ? CONFIG.checkSchemaLabelSentenceCase.exceptionWords
    : []),
].map((w) => String(w).trim().toLowerCase()).filter(Boolean));

/** Split unquoted fragment into outside text and balanced `(…)` spans (content left unchanged). */
function splitParenSpans(text) {
  const s = String(text);
  const parts = [];
  let i = 0;
  while (i < s.length) {
    const p = s.indexOf('(', i);
    if (p === -1) {
      parts.push({ skip: false, text: s.slice(i) });
      break;
    }
    if (p > i) parts.push({ skip: false, text: s.slice(i, p) });
    let depth = 0;
    let j = p;
    while (j < s.length) {
      const ch = s[j];
      if (ch === '(') depth++;
      else if (ch === ')') {
        depth--;
        if (depth === 0) {
          j++;
          break;
        }
      }
      j++;
    }
    if (depth !== 0) {
      parts.push({ skip: false, text: s.slice(p) });
      break;
    }
    parts.push({ skip: true, text: s.slice(p, j) });
    i = j;
  }
  return parts;
}

/** Quotes and parenthetical groups are not sentence-cased or validated. */
function splitSchemaLabelSpans(value) {
  const out = [];
  for (const part of splitQuotedSpans(value)) {
    if (part.quoted) {
      out.push({ skip: true, text: part.text });
      continue;
    }
    for (const p of splitParenSpans(part.text)) {
      out.push(p);
    }
  }
  return out;
}

/** Split label into outside text and spans inside `'` or `"` quotes (content left unchanged). */
function splitQuotedSpans(value) {
  const s = String(value);
  const parts = [];
  let i = 0;
  while (i < s.length) {
    let qPos = -1;
    let qChar = '';
    for (let j = i; j < s.length; j++) {
      if (s[j] === "'" || s[j] === '"') {
        qPos = j;
        qChar = s[j];
        break;
      }
    }
    if (qPos === -1) {
      parts.push({ quoted: false, text: s.slice(i) });
      break;
    }
    if (qPos > i) parts.push({ quoted: false, text: s.slice(i, qPos) });
    const end = s.indexOf(qChar, qPos + 1);
    if (end === -1) {
      parts.push({ quoted: false, text: s.slice(qPos) });
      break;
    }
    parts.push({ quoted: true, text: s.slice(qPos, end + 1) });
    i = end + 1;
  }
  return parts;
}

function canonicalSchemaLabelSentence(value) {
  const input = String(value || '').trim();
  const parts = splitSchemaLabelSpans(input);
  let firstWordSeen = false;
  return parts.map((part) => {
    if (part.skip) return part.text;
    return part.text.replace(/[A-Za-z][A-Za-z0-9]*/g, (word) => {
      const low = word.toLowerCase();
      if (!firstWordSeen) {
        firstWordSeen = true;
        if (SCHEMA_LABEL_EXCEPTION_WORDS.has(low) && word === word.toUpperCase()) return word;
        return low.charAt(0).toUpperCase() + low.slice(1);
      }
      if (SCHEMA_LABEL_EXCEPTION_WORDS.has(low)) return word;
      return low;
    });
  }).join('');
}

function schemaLabelPasses(value) {
  if (typeof value !== 'string') return true;
  const v = value.trim();
  if (!v || v.startsWith('t:')) return true;

  const parts = splitSchemaLabelSpans(v);
  let firstWordSeen = false;

  for (const part of parts) {
    if (part.skip) continue;
    const words = part.text.match(/[A-Za-z][A-Za-z0-9]*/g) || [];
    for (const word of words) {
      const low = word.toLowerCase();
      const isException = SCHEMA_LABEL_EXCEPTION_WORDS.has(low);
      if (!firstWordSeen) {
        firstWordSeen = true;
        const firstUpper = /^[A-Z]/.test(word);
        const restLower = word.slice(1) === word.slice(1).toLowerCase();
        const exceptionUpper = isException && word === word.toUpperCase();
        if (!(exceptionUpper || (firstUpper && restLower))) return false;
        continue;
      }
      if (isException) continue;
      if (word !== low) return false;
    }
  }
  return true;
}

function walkSchemaLabels(obj, badLabels) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach((item) => walkSchemaLabels(item, badLabels));
    return;
  }
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (k === 'label' && typeof v === 'string' && !schemaLabelPasses(v)) badLabels.push(v);
    walkSchemaLabels(v, badLabels);
  }
}

function extractSchemaJsonString(blockText) {
  const startMark = '{% schema %}';
  const endMark = '{% endschema %}';
  const start = blockText.indexOf(startMark);
  const end = blockText.lastIndexOf(endMark);
  if (start === -1 || end === -1 || end <= start) throw new Error('missing schema markers');
  return blockText.slice(start + startMark.length, end).trim();
}

function parseJsonErrorPosition(errMsg) {
  const m = /position\s+(\d+)/i.exec(String(errMsg || ''));
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

function computeLineColFromIndex(text, idx) {
  const src = String(text || '');
  const at = Math.max(0, Math.min(idx, src.length));
  let line = 1;
  let col = 1;
  for (let i = 0; i < at; i++) {
    if (src[i] === '\n') {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  return { line, col };
}

function makeErrorContextSnippet(text, idx, radius = 40) {
  const src = String(text || '');
  const at = Math.max(0, Math.min(idx, src.length));
  const start = Math.max(0, at - radius);
  const end = Math.min(src.length, at + radius);
  return src.slice(start, end).replace(/\s+/g, ' ').trim();
}

function validateSchemaLabelsInFile(file, rel, schemaStartLine0, blockText) {
  if (!CONFIG.checkSchemaLabelSentenceCase?.enabled) return;
  if (shouldIgnoreCheck(file, 'checkSchemaLabelSentenceCase')) return;
  if (!file.startsWith(SECTIONS_DIR) && !file.startsWith(BLOCKS_DIR)) return;
  try {
    const jsonStr = extractSchemaJsonString(blockText);
    const parsed = JSON.parse(jsonStr);
    const bad = [];
    walkSchemaLabels(parsed, bad);
    bad.forEach((label) => emitError('schemaLabelSentenceCase', rel, schemaStartLine0, label));
  } catch (e) {
    const rawMsg = e && e.message ? String(e.message) : String(e);
    const jsonStr = (() => {
      try { return extractSchemaJsonString(blockText); } catch (_) { return ''; }
    })();
    const pos = parseJsonErrorPosition(rawMsg);
    if (pos !== null && jsonStr) {
      const lc = computeLineColFromIndex(jsonStr, pos);
      const snippet = makeErrorContextSnippet(jsonStr, pos);
      const detail = `${rawMsg} (schema line ${lc.line}, col ${lc.col})${snippet ? ` near: ${snippet}` : ''}`;
      emitError('schemaJsonInvalid', rel, schemaStartLine0, detail);
    } else {
      emitError('schemaJsonInvalid', rel, schemaStartLine0, rawMsg);
    }
  }
}

function classAttrStaticPartHasExactClass(staticPart, exactClass) {
  return staticPart
    .split(/\s+/)
    .filter(Boolean)
    .some((token) => token === exactClass);
}

function scanBtnSemanticsOffenders(line) {
  const issues = [];
  function run(re) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(line)) !== null) {
      const tag = m[1].toLowerCase();
      if (tag === 'a' || tag === 'button' || tag === 'input') continue;
      const classVal = m[2];
      const staticParts = classVal.split(/\{%-?[^%]*-?%\}|\{\{-?[^}]*-?\}\}/g);
      const hasStaticBtn = staticParts.some((p) => classAttrStaticPartHasExactClass(p, 'btn'));
      if (!hasStaticBtn) continue;
      const hasIgnore = staticParts.some((p) => classAttrStaticPartHasExactClass(p, 'ignore-slide-tabindex'));
      if (hasIgnore) continue;
      issues.push(line.trim().slice(0, 160));
    }
  }
  run(BTN_CLASS_IN_ATTR_REGEX_DQ);
  run(BTN_CLASS_IN_ATTR_REGEX_SQ);
  return issues;
}

function processLiquidStyleLine(line, idx, styleState, file, rel, disabledChecks, insideMultilineLiquid) {
  const depthIn = styleState.depth;
  let depth = styleState.depth;
  let hadNonWsInside = false;
  const scanLine = maskLiquidForStyleTagScan(line);
  const re = /<style\b[^>]*>|<\/style>/gi;
  let last = 0;
  let m;
  while ((m = re.exec(scanLine)) !== null) {
    const token = m[0];
    const isOpen = /^<style/i.test(token);
    const before = line.slice(last, m.index);
    if (depth > 0 && before.trim()) hadNonWsInside = true;
    if (depth > 0 && before.length) {
      runSharedCssLineChecks(file, rel, idx, stripLiquidForCssLine(before), disabledChecks, before);
    }
    if (isOpen) {
      if (depth === 0) {
        styleState.blockStartLine = idx;
        styleState.staticLineCount = 0;
      }
      depth++;
    } else {
      depth--;
      if (depth === 0) {
        const maxLines = CONFIG.checkStyleStaticCssLines?.maxLines ?? 6;
        if (
          CONFIG.checkStyleStaticCssLines?.enabled &&
          !disabledChecks.checkStyleStaticCssLines &&
          !shouldIgnoreCheck(file, 'checkStyleStaticCssLines') &&
          styleState.staticLineCount > maxLines
        ) {
          emitError('styleStaticCssLines', rel, styleState.blockStartLine, {
            maxLines,
            count: styleState.staticLineCount,
          });
        }
      }
      if (depth < 0) depth = 0;
    }
    last = m.index + token.length;
  }
  const tail = line.slice(last);
  if (depth > 0 && tail.trim()) hadNonWsInside = true;
  if (depth > 0 && tail.length) {
    runSharedCssLineChecks(file, rel, idx, stripLiquidForCssLine(tail), disabledChecks, tail);
  }
  const depthOut = depth;
  const skipPureTag =
    /^\s*<style\b[^>]*>\s*$/i.test(line) ||
    /^\s*<\/style>\s*$/i.test(line);
  if (
    !insideMultilineLiquid &&
    CONFIG.checkStyleStaticCssLines?.enabled &&
    !disabledChecks.checkStyleStaticCssLines &&
    !shouldIgnoreCheck(file, 'checkStyleStaticCssLines') &&
    !LIQUID_TOKEN_IN_LINE_REGEX.test(line) &&
    !skipPureTag &&
    (depthIn > 0 || depthOut > 0 || hadNonWsInside)
  ) {
    styleState.staticLineCount++;
  }
  styleState.depth = depthOut;
}

function resolveSettingsDataFavicon(current) {
  if (!current || typeof current !== 'object') return undefined;
  const fromSettings = current.settings && current.settings.favicon;
  if (typeof fromSettings === 'string' && fromSettings.trim() !== '') return fromSettings;
  const fromRoot = current.favicon;
  if (typeof fromRoot === 'string' && fromRoot.trim() !== '') return fromRoot;
  return undefined;
}

function checkSettingsDataJson(file, rel) {
  if (!CONFIG.checkSettingsFavicon?.enabled) return;
  if (shouldIgnoreCheck(file, 'checkSettingsFavicon')) return;
  let raw;
  let json;
  try {
    raw = fs.readFileSync(file, 'utf8');
    json = JSON.parse(stripJsonCommentsSafe(raw));
  } catch (_) {
    emitError('settingsFavicon', rel, 0, 'invalid JSON');
    return;
  }
  const fav = resolveSettingsDataFavicon(json && json.current);
  if (fav === undefined) {
    emitError('settingsFavicon', rel, 0, 'missing or empty favicon');
  }
}

// Simple glob matcher: supports '*' (any chars except /), '**' (any chars), '?' (single char)
function globMatch(str, pattern) {
  // Escape regex special chars except for * and ?
  let regex = pattern.replace(/([.+^=!:${}()|\[\]\/\\])/g, '\\$1');
  regex = regex.replace(/\*\*/g, '___GLOBSTAR___');
  regex = regex.replace(/\*/g, '[^/]*');
  regex = regex.replace(/___GLOBSTAR___/g, '.*');
  regex = regex.replace(/\?/g, '.');
  return new RegExp('^' + regex + '$').test(str);
}

function shouldIgnoreCheck(filePath, checkType) {
  const rel = path.relative(ROOT, filePath).split(path.sep).join('/');
  for (const pattern in FILE_IGNORES) {
    if (globMatch(rel, pattern)) {
      const ignoredChecks = FILE_IGNORES[pattern];
      if (ignoredChecks === 'all' || (Array.isArray(ignoredChecks) && ignoredChecks.includes(checkType))) {
        return true;
      }
    }
  }
  return false;
}

/** True when this 0-based line index is an added line in the current unified diff (1-based line numbers in the set). */
function isLineInDiffAddedSet(rel, line0BasedIdx) {
  if (!runState || !runState.diffAddedLines) return false;
  const set = runState.diffAddedLines.get(rel.replace(/\\/g, '/'));
  return !!(set && set.has(line0BasedIdx + 1));
}

function shouldRunDiffOnlyLineCheck(configKey, ignoreCheckName, file, rel, lineIdx, disabledChecks) {
  if (!runState?.diffMode || !runState.diffAddedLines) return false;
  if (!CONFIG[configKey]?.enabled) return false;
  if (!isLineInDiffAddedSet(rel, lineIdx)) return false;
  if (disabledChecks[configKey]) return false;
  if (shouldIgnoreCheck(file, ignoreCheckName)) return false;
  return true;
}

/** 0-based line index from character position in text. */
function computeLineIndexFromPos(text, pos) {
  if (typeof pos !== 'number' || pos < 0) return 0;
  let line = 0;
  for (let i = 0; i < pos && i < text.length; i++) {
    if (text[i] === '\n') line++;
  }
  return line;
}

/**
 * Counts block `type` values under one section instance in a template JSON.
 * Includes nested `blocks` on each block (same section instance tree).
 */
function aggregateBlockTypesInSectionInstance(sectionData) {
  const counts = {};
  function addFromBlocks(blocksField) {
    if (!blocksField || typeof blocksField !== 'object') return;
    if (Array.isArray(blocksField)) {
      for (const b of blocksField) {
        if (!b || typeof b !== 'object') continue;
        if (typeof b.type === 'string') counts[b.type] = (counts[b.type] || 0) + 1;
        if (b.blocks) addFromBlocks(b.blocks);
      }
      return;
    }
    for (const id of Object.keys(blocksField)) {
      const b = blocksField[id];
      if (!b || typeof b !== 'object') continue;
      if (typeof b.type === 'string') counts[b.type] = (counts[b.type] || 0) + 1;
      if (b.blocks) addFromBlocks(b.blocks);
    }
  }
  if (sectionData && sectionData.blocks) addFromBlocks(sectionData.blocks);
  return counts;
}

function checkTemplateSectionBlocksInJson(file, rel, raw, json) {
  if (!CONFIG.checkTemplateSectionBlockCount?.enabled) return;
  if (shouldIgnoreCheck(file, 'checkTemplateSectionBlockCount')) return;
  const threshold = CONFIG.checkTemplateSectionBlockCount.maxPerType ?? 10;
  const sections = json.sections;
  if (!sections || typeof sections !== 'object' || Array.isArray(sections)) return;

  const sectionsKeyPos = raw.indexOf('"sections"');

  for (const instanceId of Object.keys(sections)) {
    const sec = sections[instanceId];
    if (!sec || typeof sec !== 'object') continue;
    const counts = aggregateBlockTypesInSectionInstance(sec);
    const sectionType = typeof sec.type === 'string' ? sec.type : 'unknown';
    for (const [type, n] of Object.entries(counts)) {
      if (n >= threshold) {
        const needle = `"${instanceId}"`;
        const pos = raw.indexOf(needle, sectionsKeyPos >= 0 ? sectionsKeyPos : 0);
        const lineIdx = computeLineIndexFromPos(raw, pos >= 0 ? pos : 0);
        const detail =
          `Section instance "${instanceId}" (${sectionType}): block type "${type}" appears ${n} times (threshold ${threshold}). ` +
          'Review whether this should be implemented with Shopify metaobjects instead of many repeated blocks of the same type.';
        emitError('templateSectionBlockCount', rel, lineIdx, detail);
      }
    }
  }
}

// Track disabled checks for code-based ignores
function updateDisabledChecks(line, disabledChecks) {
  // Check for disable comments (HTML, CSS/JS, or Liquid)
  let match = HTML_DISABLE_REGEX.exec(line) || 
              CSS_JS_DISABLE_REGEX.exec(line) ||
              LIQUID_DISABLE_REGEX.exec(line);
  if (match) {
    const types = match[1];
    if (types === 'all') {
      Object.keys(CONFIG).forEach(check => disabledChecks[check] = true);
    } else {
      types.split(',').forEach(type => {
        const checkType = type.trim();
        if (checkType.startsWith('check')) {
          disabledChecks[checkType] = true;
        } else {
          disabledChecks[`check${checkType.charAt(0).toUpperCase()}${checkType.slice(1)}`] = true;
        }
      });
    }
  }
  
  // Check for enable comments (HTML, CSS/JS, or Liquid)
  match = HTML_ENABLE_REGEX.exec(line) || 
          CSS_JS_ENABLE_REGEX.exec(line) ||
          LIQUID_ENABLE_REGEX.exec(line);
  if (match) {
    const types = match[1];
    if (types === 'all') {
      Object.keys(disabledChecks).forEach(check => delete disabledChecks[check]);
    } else {
      types.split(',').forEach(type => {
        const checkType = type.trim();
        if (checkType.startsWith('check')) {
          delete disabledChecks[checkType];
        } else {
          delete disabledChecks[`check${checkType.charAt(0).toUpperCase()}${checkType.slice(1)}`];
        }
      });
    }
  }
  
  return disabledChecks;
}

function walkDir(dir, cb) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules') walkDir(filePath, cb);
    } else {
      cb(filePath);
    }
  });
}

function checkFile(file) {
  const ext = path.extname(file);
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  if (file.startsWith(SNIPPETS_DIR) || file.startsWith(SECTIONS_DIR) || file.startsWith(BLOCKS_DIR)) {
    if (ext === '.liquid') {
      checkLiquidFile(file, rel);
    }
  } else if (file.startsWith(ASSETS_DIR)) {
    if (ext === '.css' || ext === '.liquid' && file.endsWith('.css.liquid')) checkCssFile(file, rel);
    if (ext === '.js' || ext === '.liquid' && file.endsWith('.js.liquid')) checkJsFile(file, rel);
  } else if (file.startsWith(TEMPLATES_DIR) && ext === '.json') {
    checkJsonFile(file, rel);
  } else if (file.startsWith(CONFIG_DIR) && path.basename(file) === 'settings_data.json') {
    checkSettingsDataJson(file, rel);
  }
}

function checkLiquidFile(file, rel) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let inCommentBlock = false;
  let inDocBlock = false;
  let inMultilineLiquid = false;
  let inSchemaBlock = false;
  let schemaBuf = null;
  let schemaStartIdx = -1;
  let disabledChecks = {};
  let pendingMultilineText = null;
  const styleState = { depth: 0, staticLineCount: 0, blockStartLine: 0 };

  for (let idx = 0; idx < lines.length; ) {
    const line = lines[idx];
    disabledChecks = updateDisabledChecks(line, disabledChecks);

    if (!inSchemaBlock) {
      processLiquidStyleLine(line, idx, styleState, file, rel, disabledChecks, inMultilineLiquid);
    }

    if (line.includes('{% schema %}')) {
      inSchemaBlock = true;
      pendingMultilineText = null;
      schemaStartIdx = idx;
      schemaBuf = [];
    }
    if (inSchemaBlock && schemaBuf) {
      schemaBuf.push(line);
    }
    if (line.includes('{% endschema %}')) {
      if (schemaBuf) validateSchemaLabelsInFile(file, rel, schemaStartIdx, schemaBuf.join('\n'));
      inSchemaBlock = false;
      schemaBuf = null;
    }

    if (line.includes('{% comment %}')) {
      pendingMultilineText = null;
      inCommentBlock = true;
    }
    if (inCommentBlock) {
      if (line.includes('{% endcomment %}')) inCommentBlock = false;
      idx++;
      continue;
    }

    if (/\{%-?\s*doc\s*-?%\}/.test(line)) {
      pendingMultilineText = null;
      inDocBlock = true;
    }
    if (inDocBlock) {
      if (/\{%-?\s*enddoc\s*-?%\}/.test(line)) inDocBlock = false;
      idx++;
      continue;
    }

    if (!inMultilineLiquid) {
      if ((line.includes('{%') && !line.includes('%}')) || (line.includes('{{') && !line.includes('}}'))) {
        inMultilineLiquid = true;
        pendingMultilineText = null;
        idx++;
        continue;
      }
    } else {
      if (line.includes('%}') || line.includes('}}')) {
        inMultilineLiquid = false;
      }
      idx++;
      continue;
    }

    if (pendingMultilineText) {
      const tagIdx = line.indexOf('<');
      if (tagIdx === -1) {
        pendingMultilineText.parts.push(line);
        idx++;
        continue;
      }
      if (tagIdx > 0) pendingMultilineText.parts.push(line.slice(0, tagIdx));
      const parts = pendingMultilineText.parts;
      const combined = parts.join('\n').trim();
      const firstInterior = pendingMultilineText.firstInteriorLineIdx;
      pendingMultilineText = null;
      if (combined && CONFIG.checkHardcodedText.enabled && !disabledChecks.checkHardcodedText && !shouldIgnoreCheck(file, 'checkHardcodedText') && !inSchemaBlock) {
        const contextLine = parts.find((ln) => ln.trim()) || '';
        const joined = parts.join('\n');
        const emitLine = firstNonBlankPartLineIndex0(parts, firstInterior);
        emitHardcodedTextErrorIfNeeded(rel, emitLine, combined, contextLine, joined);
      }
      const rest = line.slice(tagIdx);
      if (rest.length > 0) {
        // `processLiquidStyleLine` already ran on the full line this iteration; we replace it with `rest` and
        // `continue` so it runs again. If `rest` opens with `<style>`, undo the extra open from the first pass
        // (same for empty interior as for interior that was only Liquid: e.g. `<div>…` then `{% if %}` then `<style>`).
        if (/^<\s*style\b/i.test(rest.trim())) {
          styleState.depth = Math.max(0, styleState.depth - 1);
        }
        lines[idx] = rest;
        continue;
      }
      idx++;
      continue;
    }

    if (CONFIG.checkConsoleDebug && !disabledChecks.checkConsoleDebug && !shouldIgnoreCheck(file, 'checkConsoleDebug') &&
        CONSOLE_DEBUG_REGEX.test(line)) {
      emitError('consoleDebug', rel, idx, line);
    }

    if (CONFIG.checkHardcodedText.enabled && !disabledChecks.checkHardcodedText && !shouldIgnoreCheck(file, 'checkHardcodedText') && !inSchemaBlock) {
      HARD_CODED_TEXT_REGEX.lastIndex = 0;
      let match;
      while ((match = HARD_CODED_TEXT_REGEX.exec(line)) !== null) {
        const text = match[1].trim();
        emitHardcodedTextErrorIfNeeded(rel, idx, text, line, null);
      }
      if (isLikelyLoneHardcodedTextLine(line)) {
        emitHardcodedTextErrorIfNeeded(rel, idx, line.trim(), line, null);
      }
      const multilineCap = startMultilineTextCaptureAfterHtmlOpen(line, idx);
      if (multilineCap) pendingMultilineText = multilineCap;

      ATTR_VALUE_REGEX.lastIndex = 0;
      let attrMatch;
      while ((attrMatch = ATTR_VALUE_REGEX.exec(line)) !== null) {
        const attr = attrMatch[1];
        const value = attrMatch[2];
        if (attr === 'data-dynamic-content' || attr === 'data-match-media') continue; // Technical identifiers, not translatable
        if (!value || LIQUID_VAR_REGEX.test(value) || TRANSLATION_TAG_REGEX.test(value)) continue;
        if (isLikelyTechnicalAttrValue(value, line)) continue;
        const firstWord = getFirstWord(line);
        const key = buildNoticeKey(rel, firstWord, attr, value);
        if (SUPPRESSED_NOTICES_SET.has(key)) continue;
        emitNotice(rel, idx, attr, value, key);
      }
    }

    if (CONFIG.checkHardcodedHexColors.enabled && !disabledChecks.checkHardcodedHexColors && !shouldIgnoreCheck(file, 'checkHardcodedHexColors') && !inSchemaBlock) {
      const hexIssue = scanHexColor(line);
      if (hexIssue) emitError('hardcodedHexColors', rel, idx, hexIssue);
    }

    if (CONFIG.checkFontFamily.enabled && !disabledChecks.checkFontFamily && !shouldIgnoreCheck(file, 'checkFontFamily')) {
      const ffIssue = scanFontFamily(line);
      if (ffIssue) emitError('fontFamily', rel, idx, ffIssue);
    }

    if (CONFIG.checkInlineStyles.enabled && !disabledChecks.checkInlineStyles && !shouldIgnoreCheck(file, 'checkInlineStyles')) {
      INLINE_STYLE_REGEX.lastIndex = 0;
      let styleMatch;
      while ((styleMatch = INLINE_STYLE_REGEX.exec(line)) !== null) {
        const styleValue = styleMatch[1];
        if (isAllowedInlineStyleValue(styleValue)) {
          continue;
        }
        emitError('inlineStyles', rel, idx, styleValue);
      }
    }

    if (CONFIG.checkCssClassNaming.enabled && !disabledChecks.checkCssClassNaming && !shouldIgnoreCheck(file, 'checkCssClassNaming')) {
      CSS_CLASS_REGEX.lastIndex = 0;
      let classMatch;
      while ((classMatch = CSS_CLASS_REGEX.exec(line)) !== null) {
        const classAttrValue = classMatch[1];
        if (LIQUID_TAG_OR_EXPR_REGEX.test(classAttrValue.trim())) continue;
        const staticParts = classAttrValue.split(/\{%-?[^%]*-?%\}|\{\{-?[^}]*-?\}\}/g);
        const reported = new Set();
        staticParts.forEach(part => {
          part.split(/\s+/).forEach(cls => {
            if (cls === '' || cls === '-' || cls === '--') return;
            if (cls.includes('{') || cls.includes('}') || cls.includes('.')) return;
            if (hasNonStandardCssClassName(cls) && !reported.has(cls)) {
              reported.add(cls);
              emitError('cssClassNaming', rel, idx, cls);
            }
          });
        });
      }
    }

    if (
      shouldRunDiffOnlyLineCheck('checkHtmlCommentsInLiquid', 'checkHtmlCommentsInLiquid', file, rel, idx, disabledChecks) &&
      !inSchemaBlock
    ) {
      if (HTML_COMMENT_OPEN_REGEX.test(line) && !HTML_COMMENT_VALIDATION_GUARD_REGEX.test(line)) {
        emitError('htmlCommentsInLiquid', rel, idx, line.trim().slice(0, 220));
      }
    }

    if (
      CONFIG.checkBtnSemantics?.enabled &&
      !disabledChecks.checkBtnSemantics &&
      shouldApplyLineScopedCheck('checkBtnSemantics', 'checkBtnSemantics', file, rel, idx, disabledChecks) &&
      !inSchemaBlock
    ) {
      const btnIssues = scanBtnSemanticsOffenders(line);
      if (btnIssues.length) {
        btnIssues.forEach((snippet) => emitError('btnSemantics', rel, idx, snippet));
      }
    }

    idx++;
  }

  if (
    styleState.depth > 0 &&
    CONFIG.checkStyleStaticCssLines?.enabled &&
    !disabledChecks.checkStyleStaticCssLines &&
    !shouldIgnoreCheck(file, 'checkStyleStaticCssLines')
  ) {
    const maxLines = CONFIG.checkStyleStaticCssLines?.maxLines ?? 6;
    if (styleState.staticLineCount > maxLines) {
      emitError('styleStaticCssLines', rel, styleState.blockStartLine, {
        maxLines,
        count: styleState.staticLineCount,
      });
    }
  }
}

function checkCssFile(file, rel) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let disabledChecks = {};
  
  lines.forEach((line, idx) => {
    // Update disabled checks based on comments in the line
    disabledChecks = updateDisabledChecks(line, disabledChecks);
    
    const staticLine = stripLiquidForCssLine(line);

    // Hardcoded hex colors
    if (CONFIG.checkHardcodedHexColors.enabled && !disabledChecks.checkHardcodedHexColors && !shouldIgnoreCheck(file, 'checkHardcodedHexColors')) {
      const hexIssue = scanHexColor(line);
      if (hexIssue) emitError('hardcodedHexColors', rel, idx, hexIssue);
    }
    
    // Font family
    if (CONFIG.checkFontFamily.enabled && !disabledChecks.checkFontFamily && !shouldIgnoreCheck(file, 'checkFontFamily')) {
      const ffIssue = scanFontFamily(line);
      if (ffIssue) emitError('fontFamily', rel, idx, ffIssue);
    }
    
    // CSS class naming
    if (CONFIG.checkCssClassNaming.enabled && !disabledChecks.checkCssClassNaming && !shouldIgnoreCheck(file, 'checkCssClassNaming')) {
      const offenders = Array.from(new Set(scanCssClassNamingFromCssLine(staticLine)));
      if (offenders.length) offenders.forEach(cls => emitError('cssClassNaming', rel, idx, cls));      
    }

    if (shouldRunDiffOnlyLineCheck('checkCssImportant', 'checkCssImportant', file, rel, idx, disabledChecks) &&
        CSS_IMPORTANT_REGEX.test(staticLine)) {
      emitError('cssImportant', rel, idx, staticLine.trim().slice(0, 220));
    }

    runSharedCssLineChecks(file, rel, idx, staticLine, disabledChecks, line);
  });
}

function checkJsFile(file, rel) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let disabledChecks = {};
  
  lines.forEach((line, idx) => {
    // Update disabled checks based on comments in the line
    disabledChecks = updateDisabledChecks(line, disabledChecks);
    
    // Hardcoded hex colors
    if (CONFIG.checkHardcodedHexColors.enabled && !disabledChecks.checkHardcodedHexColors && !shouldIgnoreCheck(file, 'checkHardcodedHexColors')) {
      const hexIssue = scanHexColor(line);
      if (hexIssue) emitError('hardcodedHexColors', rel, idx, hexIssue);
    }
    
    if (CONFIG.checkConsoleDebug && !disabledChecks.checkConsoleDebug && !shouldIgnoreCheck(file, 'checkConsoleDebug') && 
        CONSOLE_DEBUG_REGEX.test(line)) {
      emitError('consoleDebug', rel, idx, line);
    }

    if (shouldRunDiffOnlyLineCheck('checkJsTimers', 'checkJsTimers', file, rel, idx, disabledChecks) &&
        JS_TIMER_REGEX.test(line)) {
      emitError('jsTimers', rel, idx, buildCodeContext(lines, idx, 2, 2));
    }
  });
}

function checkJsonFile(file, rel) {
  const needTemplateBlockCheck =
    CONFIG.checkTemplateSectionBlockCount?.enabled && !shouldIgnoreCheck(file, 'checkTemplateSectionBlockCount');
  const needsCustomCss = CONFIG.checkJsonCustomCss.enabled || CONFIG.checkHardcodedHexColors.enabled;
  if (!needTemplateBlockCheck && !needsCustomCss) return;

  const raw = fs.readFileSync(file, 'utf8');
  let json;
  try {
    const cleanedContent = stripJsonCommentsSafe(raw);
    json = JSON.parse(cleanedContent);
  } catch (e) {
    emitError('jsonInvalid', rel, 0);
    return;
  }

  if (needTemplateBlockCheck) {
    checkTemplateSectionBlocksInJson(file, rel, raw, json);
  }

  const searchState = { from: 0 };

  function findNextCustomCssKeyLine() {
    const key = '"custom_css"';
    const pos = raw.indexOf(key, searchState.from);
    if (pos === -1) return 0;
    searchState.from = pos + key.length;
    return computeLineIndexFromPos(raw, pos);
  }

  function scanObjectForCustomCss(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(scanObjectForCustomCss);
      return;
    }
    for (const key of Object.keys(node)) {
      const value = node[key];
      if (key === 'custom_css' && typeof value === 'string') {
        const css = value;
        const lineIdx = findNextCustomCssKeyLine();
        if (CONFIG.checkHardcodedHexColors.enabled && !shouldIgnoreCheck(file, 'checkHardcodedHexColors') && HEX_COLOR_REGEX.test(css)) {
          emitError('hardcodedHexColorsCustomCss', rel, lineIdx);
        }
        if (CONFIG.checkJsonCustomCss.enabled && !shouldIgnoreCheck(file, 'checkJsonCustomCss')) {
          const fontMatch = FONT_FAMILY_REGEX.exec(css);
          if (fontMatch && !isAllowedFontFamilyValue(fontMatch[1])) {
            emitError('jsonCustomCss', rel, lineIdx, MESSAGES.jsonFontFamily(rel, fontMatch[1], lineIdx));
          }
        }
      } else if (value && typeof value === 'object') {
        scanObjectForCustomCss(value);
      }
    }
  }

  if (needsCustomCss) {
    scanObjectForCustomCss(json);
  }
}

function isTechnicalString(text, line) {
  const trimmed = text.trim();
  
  // Empty or very short
  if (trimmed.length === 0 || trimmed.length === 1) return true;
  
  // URL patterns
  if (/^(https?:)?\/\//.test(trimmed)) return true; // http://, https://, //
  if (/^[\/\?#]/.test(trimmed)) return true; // starts with /, ?, #
  if (/^\.{1,2}\//.test(trimmed)) return true; // ./ or ../
  
  // CSS selectors
  if (/^[.#][\w-]+$/.test(trimmed)) return true; // .class or #id
  if (/^[\w-]+\[[\w-]+/.test(trimmed)) return true; // element[attr
  
  // Data attributes (technical identifiers only)
  if (/^data-[\w-]+$/.test(trimmed)) return true; // data-*
  
  // NOTE: aria-label, aria-description contain customer-facing text - don't ignore
  // Other aria-* are typically technical (aria-expanded, aria-controls, etc.)
  
  // File paths and extensions
  if (/\.(js|css|json|liquid|svg|png|jpg|gif|woff|woff2)$/i.test(trimmed)) return true;
  
  // Mathematical and logical expressions (Liquid conditions)
  if (/^\d+\.?\d*\s+(and|or|&&|\|\|)\s+[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) return true; // "1.2 and r"
  if (/^[a-zA-Z_][a-zA-Z0-9_]*\s+(and|or|&&|\|\|)\s+\d+\.?\d*$/.test(trimmed)) return true; // "r and 1.2"
  if (/^\d+\.?\d*\s*[<>=!]+\s*\d+\.?\d*$/.test(trimmed)) return true; // "1.2 < 2"
  if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*[<>=!]+\s*\d+\.?\d*$/.test(trimmed)) return true; // "r > 1.2"
  if (/^\d+\.?\d*\s*[<>=!]+\s*[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) return true; // "1.2 < r"
  
  // Additional mathematical patterns
  if (/^\d+\.?\d*\s*[+\-*/]\s*\d+\.?\d*$/.test(trimmed)) return true; // "1.2 + 2.3"
  if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*[+\-*/]\s*\d+\.?\d*$/.test(trimmed)) return true; // "r + 1.2"
  if (/^\d+\.?\d*\s*[+\-*/]\s*[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) return true; // "1.2 + r"
  
  // Complex logical expressions
  if (/^[a-zA-Z_][a-zA-Z0-9_]*\s+(and|or|&&|\|\|)\s+[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) return true; // "r and s"
  if (/^\d+\.?\d*\s*[<>=!]+\s*\d+\.?\d*\s+(and|or|&&|\|\|)\s+[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) return true; // "1.2 < 2 and r"
  
  // Context: Check if line contains technical assignments
  if (line.includes('location') && line.includes('=')) return true;
  if (line.includes('.href') && line.includes('=')) return true;
  if (line.includes('querySelector')) return true;
  if (line.includes('getElementById')) return true;
  if (line.includes('classList.')) return true;
  if (line.includes('dataset.')) return true;
  if (line.includes('fetch(')) return true;
  if (line.includes('endpoint')) return true;
  if (line.includes('route') && line.includes('=')) return true;
  if (line.includes('path') && line.includes('=')) return true;
  
  return false;
}

function isCodeDelimiterText(text) {
  // Ignore if text is only punctuation, whitespace, or common delimiters
  if (/^[\s,|:;*\-\/]+$/.test(text)) return true;
  // Ignore if text is less than 3 alphanumeric characters and not a word
  if (/^[^a-zA-Z0-9]*[a-zA-Z0-9][^a-zA-Z0-9]*$/.test(text) && text.length < 3) return true;

  // Ignore Liquid filter fragments and pipe operators
  if (/^['"]\s*\|\s*[^'"]*['"]?\s*\|?\s*(replace|strip_html|truncatewords|split|append|prepend)\s*:?\s*['"]?/.test(text)) return true;
  
  // Ignore complex Liquid filter chains
  if (/\|\s*(replace|strip_html|truncatewords|split|append|prepend)\s*:/.test(text)) return true;
  
  // Ignore JavaScript function calls in quotes
  if (/^[a-zA-Z_][a-zA-Z0-9_]*\(\)/.test(text)) return true;
  
  // Ignore comparison operators and logical expressions
  if (/^[<>=!&|]+\s*\d+/.test(text)) return true;
  
  // Ignore HTML entities and special characters
  if (/^&[a-zA-Z]+;/.test(text)) return true;
  
  // Ignore pipe operators and Liquid delimiters
  if (/^['"]\s*[^'"]*\s*\|/.test(text)) return true;
  
  // Ignore only special characters and operators
  if (/^[^a-zA-Z]*[|&<>][^a-zA-Z]*$/.test(text)) return true;
  
  // Ignore specific problematic patterns
  if (/^['"]\s*[^'"]*\s*\|\s*[^'"]*\s*['"]?\s*\|/.test(text)) return true;
  if (/^-\s*['"]\s*\|\s*append/.test(text)) return true;
  if (/^=\s*\d+\s*&&\s*char\.ord/.test(text)) return true;
    
  return false;
}

function firstNonBlankPartLineIndex0(parts, baseLineIdx0) {
  for (let j = 0; j < parts.length; j++) {
    if (parts[j] && parts[j].trim()) return baseLineIdx0 + j;
  }
  return baseLineIdx0;
}

/** Payload between HTML >…< that is clearly Liquid/JS/CSS/JSON — not customer copy. */
function shouldSkipHardcodedTextPayload(text) {
  const t = String(text).trim();
  if (!t) return true;
  if (isLikelyHtmlAttributeLine(t)) return true;
  if (/\{%[-\s]?|\{\{|[-\s]?\%\}|\}\}/.test(t)) return true;
  const letters = t.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 2) return true;

  if (/^\s*(REF|NOTE|TODO|FIXME|IMPORTANT)\s*:/i.test(t)) return true;
  if (/\b(var|let|const|function|return|new|typeof|instanceof|void)\b/.test(t)) return true;
  if (/=>|\.prototype|\bthis\b|\bwindow\b|\bdocument\b|\bcustomElements\b|addEventListener|dispatchEvent|querySelector|getElementById|closest\s*\(|innerHTML|insertAdjacent|Object\.|JSON\.|Math\.|Cookies\.|localStorage|sessionStorage|fetch\s*\(/.test(t)) {
    return true;
  }
  if (/;\s*$/.test(t) && /[=(){}\[\];]/.test(t)) return true;
  if (/^["']?@[\w/]+["']?\s*:/.test(t) || /"@context"|"@type"|"@id"|"@graph"/i.test(t)) return true;
  if (/^\s*["'][\w.-]+["']\s*:/.test(t)) return true;
  if ((t.match(/:/g) || []).length >= 2 && /;\s*$/.test(t)) return true;
  if (/^\s*[.#\[][\w.#:[\],\s>-]+,\s*$/i.test(t)) return true;
  if (/^\s*--[\w-]+\s*:/.test(t)) return true;
  if (/^\s*--\s*["']/.test(t)) return true;
  if (/^\s*-\s*value\s*:/i.test(t)) return true;
  if (/=\s*value\./i.test(t) || /\bvalue\.(upcase|downcase|strip)\b/.test(t)) return true;
  if (/\(optional\)/i.test(t) && /:/.test(t)) return true;
  if (/^Add class ["']/i.test(t)) return true;
  if (/^[a-zA-Z][\w-]*\s*:\s*(true|false|null|\d+)\s*,?\s*$/i.test(t)) return true;
  if (/^[a-zA-Z][\w-]*\s*:\s*["'`]/.test(t) && /[,}]/.test(t)) return true;
  if (/^\s*\.[\w.#:[\],\s()>+~*-]+,?\s*$/i.test(t)) return true;
  if (t.length > 120 && /\b(placeholder|component\.|product-sticky|shopify-section|elementSibling|dispatchEvent)\b/i.test(t)) {
    return true;
  }

  return false;
}

/** translationScope: optional multi-line string for `{{ ... | t }}` detection. */
function emitHardcodedTextErrorIfNeeded(rel, lineIdx0, text, contextLine, translationScope) {
  const trimmed = String(text).trim();
  if (!trimmed) return;
  if (shouldSkipHardcodedTextPayload(trimmed)) return;
  const transScope = translationScope != null ? translationScope : contextLine;
  if (LIQUID_VAR_REGEX.test(trimmed)) return;
  if (TRANSLATION_TAG_REGEX.test(transScope)) return;
  if (isCodeDelimiterText(trimmed)) return;
  if (isTechnicalString(trimmed, contextLine)) return;
  if (
    transScope.includes('| replace:') ||
    transScope.includes('| split:') ||
    transScope.includes('| append:') ||
    transScope.includes('| strip_html') ||
    transScope.includes('| truncatewords')
  ) {
    return;
  }
  emitError('hardcodedText', rel, lineIdx0, trimmed);
}

/** Continuation line of a multi-line HTML tag (e.g. style="display: none !important;"). */
function isLikelyHtmlAttributeLine(line) {
  const t = String(line).trim();
  if (!t) return false;
  return /^\s*@?[\w][\w:-]*\s*=\s*["']/.test(t);
}

/**
 * A line that looks like plain prose (no HTML/Liquid delimiters), e.g. body text
 * between {% if %} / {% unless %} and the matching closing tag.
 */
function isLikelyLoneHardcodedTextLine(line) {
  const t = line.trim();
  if (t.length < 4) return false;
  if (isLikelyHtmlAttributeLine(t)) return false;
  if (t.includes('<') || t.includes('>')) return false;
  if (/[{%]/.test(t) || /\%\}/.test(t) || /\}\}/.test(t)) return false;
  if (/^\s*(Renders|Usage|Adds|Generates|Creates|PhotoSwipe|Custom\s+Hash|snippet\s+parameters|Interface\s|Output\.|def\s|puts\b|text\.chars|For\s+combined|This snippet|All sections that|Render HTML)/i.test(t)) {
    return false;
  }
  if (/^\s*REF:\s/i.test(t)) return false;
  if (/:\s*["'`][^"'`]*["'`]\s*,?\s*$/.test(t)) return false;
  if (/^\s*--[\w-]+\s*:/.test(t)) return false;
  if (/;\s*["']?\s*$/.test(t)) return false;
  if (/[=]{1,3}\s*[\w.'"`\[\]]+(\s*[,;)])?$/.test(t) && !/\s(and|or|the|for|with)\s/i.test(t)) return false;
  if (/\b(var|let|const|function|return|new)\b/.test(t)) return false;
  if (/=>|\.prototype|\bthis\b|\bwindow\b|\bdocument\b|addEventListener|querySelector|getElementById|closest\s*\(|innerHTML|style\.|dispatchEvent/.test(t)) {
    return false;
  }
  if (/^\s*[.#\[][\w.#:[\],\s>-]{3,}$/i.test(t)) return false;
  if (/^\s*\/\/|\/\*/.test(t)) return false;

  const words = t.split(/\s+/).filter((w) => /[a-zA-Z]{2,}/.test(w));
  if (words.length < 2) return false;
  return true;
}

/**
 * Start capturing inner HTML/Liquid text that spans the next line(s) until the first '<'.
 * Handles `<div>\\n text` and `<div>partial\\n continuation` (no '<' on the same line after the tag's '>').
 */
function startMultilineTextCaptureAfterHtmlOpen(line, lineIdx0) {
  let lastHtmlOpen = null;
  const re = /<([a-zA-Z][\w-]*)(?:\s[^>]*)?>/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    lastHtmlOpen = m;
  }
  if (!lastHtmlOpen) return null;
  const lastGt = line.lastIndexOf('>');
  const closeIdx = lastHtmlOpen.index + lastHtmlOpen[0].length - 1;
  if (closeIdx !== lastGt) return null;
  if (/^(script|style|noscript)$/i.test(lastHtmlOpen[1])) return null;
  const tail = line.slice(lastGt + 1);
  if (tail.includes('<')) return null;
  const tailTrim = tail.trim();
  if (TRANSLATION_TAG_REGEX.test(line)) return null;
  if (tailTrim && LIQUID_VAR_REGEX.test(tailTrim)) return null;
  if (!tailTrim) return { firstInteriorLineIdx: lineIdx0 + 1, parts: [] };
  return { firstInteriorLineIdx: lineIdx0, parts: [tail] };
}

// Custom algorithm AI generated, not using regex because it can't handle the complexity of JSON.
function stripJsonCommentsSafe(str) {
  let result = "";
  let inString = false;
  let stringChar = null; // " or '
  let inLineComment = false;
  let inBlockComment = false;
  let prevChar = "";

  for (let i = 0; i < str.length; i++) {
    const curr = str[i];
    const next = str[i + 1];

    // Inside a "//" comment: skip until newline
    if (inLineComment) {
      if (curr === "\n") {
        inLineComment = false;
        result += curr; // keep the newline
      }
      continue;
    }

    // Inside a "/* ... */" comment: skip until closing */
    if (inBlockComment) {
      if (curr === "*" && next === "/") {
        inBlockComment = false;
        i++; // skip the "/"
      }
      continue;
    }

    // Detect entering a string (only if not already inside one)
    if (!inString && (curr === '"' || curr === "'")) {
      inString = true;
      stringChar = curr;
      result += curr;
      prevChar = curr;
      continue;
    }

    // Handle characters inside a string
    if (inString) {
      result += curr;

      // Exit string if the quote is not escaped
      if (curr === stringChar && prevChar !== "\\") {
        inString = false;
      }

      prevChar = curr;
      continue;
    }

    // Detect start of a line comment "//"
    if (curr === "/" && next === "/") {
      inLineComment = true;
      i++; // skip second "/"
      continue;
    }

    // Detect start of a block comment "/*"
    if (curr === "/" && next === "*") {
      inBlockComment = true;
      i++; // skip "*"
      continue;
    }

    // Normal character (not in string and not a comment)
    result += curr;
    prevChar = curr;
  }

  return result;
}

function isAllowedInlineStyleValue(value) {
  value = value.trim().replace(/;$/, '');
  const props = value.split(';').map(s => s.trim()).filter(Boolean);
  if (props.length === 0) return true;
  for (const prop of props) {
    const [name, ...rest] = prop.split(':');
    if (!rest.length) continue;
    const propName = name.trim();
    const val = rest.join(':').trim();
    // Allow any display property
    if (/^display$/i.test(propName)) continue;
    // Allow any CSS variable assignment
    if (/^--[a-zA-Z0-9-_]+$/.test(propName)) continue;
    // Allow if the value is a Liquid tag or a CSS variable
    if (LIQUID_ONLY_REGEX.test(val) || CSS_VAR_ONLY_REGEX.test(val)) continue;
    // Allow if the value is a Liquid tag plus optional CSS unit
    if (LIQUID_PLUS_UNIT_REGEX.test(val)) continue;
    // Allow if the value is a sequence of CSS variables and/or Liquid tags
    if (/^(\s*(var\(--[a-zA-Z0-9-_]+\)|\{\{.*?\}\}))*\s*;?\s*$/.test(val)) continue;
    return false;
  }
  return true;
}

function run(themePath, options = {}) {
  const root = path.resolve(themePath);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    throw new Error(`Theme path does not exist or is not a directory: ${root}`);
  }
  initializePaths(root);
  refreshSuppressedNoticesSet(root);
  runState = {
    errors: 0,
    errorCounts: Object.fromEntries(ERROR_COUNT_KEYS.map(k => [k, 0])),
    collected: [],
    notices: [],
    silent: options.silent ?? false,
    diffMode: !!options.diff,
    diffAddedLines: options.diff || null,
    deferOutput: options.deferOutput ?? false,
    noticesFile: options.noticesFile || null,
  };
  try {
    if (Array.isArray(options.files) && options.files.length > 0) {
      const list = resolveListedThemeFiles(root, options.files);
      for (const filePath of list) {
        checkFile(filePath);
      }
    } else {
      walkDir(root, checkFile);
    }
  } catch (err) {
    runState = null;
    throw err;
  }
  let { errors, errorCounts, collected, notices } = runState;
  runState = null;

  if (options.diff && collected.length > 0) {
    collected = filterErrorsByDiff(collected, options.diff);
    errorCounts = Object.fromEntries(ERROR_COUNT_KEYS.map(k => [k, 0]));
    collected.forEach((e) => {
      if (errorCounts.hasOwnProperty(e.type)) errorCounts[e.type]++;
    });
    errors = collected.length;
  }
  if (options.diff && notices.length > 0) {
    notices = filterNoticesByDiff(notices, options.diff);
  }
  if (options.diff && !options.silent && !options.deferOutput && collected.length > 0) {
    printCollectedErrors(collected);
  }

  return {
    errors: collected,
    notices,
    errorCounts,
    totalErrors: errors,
    exitCode: errors > 0 ? 2 : 0,
  };
}

function readDiffFile(filePath) {
  const buf = fs.readFileSync(filePath);
  let text;
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) text = buf.toString('utf16le');
  else if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) text = buf.toString('utf16be');
  else text = buf.toString('utf8');
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function writeSuppressedNoticesToConfig(themeRoot, newKeys) {
  const cfgPath = getConfigPath(themeRoot);
  let parsed;
  if (fs.existsSync(cfgPath)) {
    const raw = fs.readFileSync(cfgPath, 'utf8');
    const cleaned = stripJsonCommentsSafe(raw);
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error(`Error parsing ${cfgPath}:`, e.message);
      process.exit(1);
    }
  } else {
    parsed = JSON.stringify(DEFAULT_CFG, null, 2);
    try {
      parsed = JSON.parse(JSON.stringify(DEFAULT_CFG));
    } catch (_) {
      parsed = { CONFIG: DEFAULT_CFG.CONFIG, FILE_IGNORES: DEFAULT_CFG.FILE_IGNORES, SUPPRESSED_NOTICES: [] };
    }
    parsed = { ...DEFAULT_CFG, SUPPRESSED_NOTICES: [] };
  }
  const existing = Array.isArray(parsed.SUPPRESSED_NOTICES) ? parsed.SUPPRESSED_NOTICES : [];
  const existingSet = new Set(existing);
  let added = 0;
  for (const k of newKeys) {
    if (k && !existingSet.has(k)) {
      existingSet.add(k);
      existing.push(k);
      added++;
    }
  }
  parsed.SUPPRESSED_NOTICES = existing;
  fs.writeFileSync(cfgPath, JSON.stringify(parsed, null, 2), 'utf8');
  return added;
}

function runCli() {
  const filesList = parseFilesArg();

  // --suppress-notice "key": add single notice key to suppress list
  const suppressNoticeKey = parseSuppressNoticeArg();
  if (suppressNoticeKey) {
    const added = writeSuppressedNoticesToConfig(ROOT, [suppressNoticeKey]);
    console.log(`Added 1 notice to SUPPRESSED_NOTICES. It will not appear in future runs.`);
    return;
  }

  // --suppress-notices: add all current notices to suppress list
  if (parseSuppressNoticesArg()) {
    const diffFilePath = parseDiffFileArg();
    const diffOpt = diffFilePath
      ? { diff: parseUnifiedDiff(readDiffFile(diffFilePath)) }
      : {};
    let result;
    try {
      result = run(ROOT, { ...diffOpt, silent: true, ...(filesList ? { files: filesList } : {}) });
    } catch (e) {
      console.error(e.message || String(e));
      process.exit(1);
    }
    const keys = (result.notices || []).map((n) => n.key).filter(Boolean);
    const added = writeSuppressedNoticesToConfig(ROOT, keys);
    console.log(`Added ${added} notice(s) to SUPPRESSED_NOTICES. They will not appear in future runs.`);
    return;
  }

  writeLastThemePath(ROOT);

  const diffFilePath = parseDiffFileArg();
  const noticesFilePath = parseNoticesFileArg();
  const diffOpt = diffFilePath
    ? { diff: parseUnifiedDiff(readDiffFile(diffFilePath)) }
    : {};
  const runOpt = { ...diffOpt, deferOutput: true, noticesFile: noticesFilePath || undefined };
  if (filesList) runOpt.files = filesList;
  let result;
  try {
    result = run(ROOT, runOpt);
  } catch (e) {
    console.error(e.message || String(e));
    process.exit(1);
  }

  // Print notices first (before errors or "no errors found")
  if (result.notices && result.notices.length > 0) {
    result.notices.forEach((n) => console.log(n.message));
    if (noticesFilePath) {
      const content = result.notices.map((n) => n.message).join('\n') + '\n';
      fs.writeFileSync(noticesFilePath, content, 'utf8');
    }
  }

  // Then errors
  if (result.errors.length > 0) {
    printCollectedErrors(result.errors);
  }

  if (result.totalErrors === 0) {
    if (result.notices && result.notices.length > 0) {
      console.log(`Total: ${result.notices.length} notice(s).`);
    }
    console.log('Validation completed! No errors found.');
  } else {
    if (result.notices && result.notices.length > 0) {
      console.log(`Total: ${result.notices.length} notice(s).`);
    }
    console.log(`Found ${result.totalErrors} error(s).`);
    console.log('Error summary by type:');
    Object.entries(result.errorCounts).forEach(([type, count]) => {
      if (count > 0) {
        console.log(`- ${type}: ${count}`);
      }
    });
    process.exit(result.exitCode);
  }
}

if (require.main === module) {
  runCli();
} else {
  module.exports = {
    run,
    parseUnifiedDiff,
    filterErrorsByDiff,
    /** @public For tooling: rewrite schema labels to match checkSchemaLabelSentenceCase rules. */
    canonicalSchemaLabelSentence,
  };
} 