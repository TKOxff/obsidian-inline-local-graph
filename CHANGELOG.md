# Changelog

## 0.9.12

### Changes

- **Minimum Obsidian version is now 1.8.7** (was 0.16.0). The plugin now uses Obsidian's `getLanguage()` API to pick the settings language. Users on older Obsidian versions can keep using 0.9.11.

### Maintenance

- **Community directory review fixes**: Resolved the issues reported by Obsidian's automated plugin review (#16). The author field no longer contains an email address; UI elements are created with Obsidian's DOM helpers; inline styles moved to `styles.css`; settings section headings use Obsidian's built-in heading style. There are no functional changes to the graph.
- **Build tooling**: Added `eslint-plugin-obsidianmd` (`npm run lint`), upgraded TypeScript to 5.9, committed `package-lock.json`, pinned dependency versions, and replaced the `builtin-modules` package with Node's built-in module list.

## 0.9.11

### Documentation

- **Donate button**: Added `fundingUrl` to the manifest, so a Donate button now appears on the plugin card in Obsidian's community plugin browser.
- **README rewritten**: Added installation steps, a full settings reference, and a foreign-language vocabulary example (Japanese kanji — Korean — English) that better illustrates what the inline local graph is for.
- **Translated README**: Korean (`README.ko.md`) and Japanese (`README.ja.md`) versions, linked from a language switcher at the top of each file.

### Changes

- **Default node shape is now Box** (was Ellipse). Users who never changed the setting will see box-shaped nodes after updating; pick a different shape under **Node shape** in the settings to keep the old look.

## 0.9.10

### New Features
- **Max displayed nodes**: Added a setting to cap how many nodes appear in the graph. The active note is always shown and is excluded from the count; outgoing links are prioritized over backlinks. Entered as a number field (range 1–200, default 30) with out-of-range values clamped automatically.

## 0.9.9

### New Features
- **Separate label length for alphabet and non-alphabet languages**: Node label truncation now uses two independent limits — one for alphabet-based languages and one for Korean/Japanese/Chinese labels — so wide (full-width) characters no longer make nodes overly long. Added a new "Max label length (Korean/Japanese/Chinese)" slider (default: 10).
- **Localized settings and UI (English, Korean, Japanese)**: The settings panel and graph controls are now translated based on the Obsidian display language, falling back to English for unsupported languages.

## 0.9.8

### New Features
- **Outgoing toggle**: Added toggle to the control bar to show/hide outgoing links
- **Show outgoing links**: Added corresponding setting to the settings panel

### Improvements
- Control bar labels renamed to **Outgoing** / **Incoming** for consistency with Obsidian's standard local graph terminology
- Refresh button (⟳) removed from control bar — frees up space, especially on mobile portrait mode
- `showGraphBorder` default changed from `true` to `false`
- Settings panel entries renamed to **Show outgoing links** / **Show incoming links**

## 0.9.7

### New Features
- **Node shape**: Added setting to choose node shape (Ellipse, Box, Circle, Dot, Text only)
- **Node font size**: Added slider to adjust the font size of node labels
- **Label truncation**: Added toggle and max-length slider to truncate long node labels with ellipsis (...)

### Improvements
- Settings panel reorganized into sections: **Graph** and **Node Style**
- Fixed hardcoded node size for better appearance with Dot shape

### Code Quality
- Removed unused `leaf` property and `WorkspaceLeaf` import
- Removed unused `nodeBgColor` class property in settings tab
- Deduplicated `getNodeDistance` / `getSpringLength` into shared static methods
- Removed unused `.inline-graph-backlink-row` CSS rule
- Removed all `console.debug` calls from production code

## 0.9.6

- Replace `any` type with specific type for `getBacklinksForFile`
- Use a `saveSettings` callback passed through the constructor

## 0.9.3

- Moved styles from JavaScript to CSS classes
- Added refresh button to InlineGraph controls for re-rendering
- Added initial zoom setting

## 0.9.2

- Backlinks with transparency
- Exclude image file links
- Disabled zooming with mouse scroll; added UI buttons for zoom control
