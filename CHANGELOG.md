# Changelog

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
