# Architecture

## Stack

Vanilla HTML + CSS + JS. No framework, no bundler, no dependencies.  
Served locally with `npx serve .` or any static file server.

## File structure

```
/
├── index.html            # All markup
├── styles.css            # All styles
├── script.js             # All interactivity
├── assets/
│   └── icons/            # SVG icons (see below)
└── docs/                 # This documentation
```

## Icons

| File | Used where |
|---|---|
| `dot-grid-vertical-2x3.svg` | Drag handle on every row |
| `dot-grid-vertical-1x3.svg` | 3-dot "More options" button on every row |
| `eye.svg` | Visibility button on **hidden** panel items ("Show column") |
| `eye-off.svg` | Empty state badge in the hidden panel only — **not** used on buttons |
| `eye-off2.svg` | Visibility button on **visible** panel items ("Hide column") |
| `checkbox.svg` | Checked state for both gridline checkboxes |
| `close.svg` | Modal close button |

> `eye-off.svg` and `eye-off2.svg` are intentionally different files for different contexts. Do not swap them.

## CSS design tokens

Defined as custom properties on `:root` in `styles.css`:

| Token | Value | Used for |
|---|---|---|
| `--color-primary` | `#052474` | Headings, primary button, drag-over border, tooltip text — |
| `--color-black` | `#212121` | Body text, column names |
| `--color-dark-gray` | `#555555` | Secondary labels, icon strokes |
| `--color-gray` | `#939393` | Scrollbar thumb, drag handle dots |
| `--color-light-gray` | `#f0f0f0` | Panel borders |
| `--color-lighter-gray` | `#f5f5f5` | Row divider (via inset box-shadow) |
| `--color-border-btn` | `#cdd3e3` | Cancel button border, unchecked checkbox border |
| `--font-family` | `'Figtree', sans-serif` | All text |

## script.js structure

The entire script runs inside an IIFE. Key sections in order:

1. **Tooltip singleton** — one `div.tooltip` appended to `<body>`; positioned via `getBoundingClientRect` on `mouseenter`
2. **Position tracking** — `initOrder()` stamps `data-order` on load; `recordRestorePoint()` / `insertAtRestorePoint()` handle last-position memory
3. **Visibility button state** — `updateVisibilityBtn(item, isNowHidden)` swaps icon src, `data-tooltip`, and `aria-label`
4. **Drag helpers** — `getItems()`, `updateEmptyState()`, `initDragEvents()`, drag event handlers
5. **List drop zones** — `initListDrop()` wires up panel-level dragover/drop
6. **Hidden panel highlight** — `dragenter` / `dragleave` on `hiddenList` for the dashed drag-over state
7. **Initialisation** — `initOrder()`, attach drag events, attach list drops
8. **Eye button click handler** — delegated on `document`, handles hide/show with position tracking
