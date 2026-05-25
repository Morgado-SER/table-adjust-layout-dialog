# Handoff

## Quick links

| | |
|---|---|
| **Repo** | https://github.com/Morgado-SER/table-adjust-layout-dialog |
| **Live preview** | https://morgado-ser.github.io/table-adjust-layout-dialog/ |
| **Figma** | [WebCube Mockups 14.5](https://www.figma.com/design/vmzNIpIpswwrRzw8BUERHx/WebCube-Mockups-14.5?node-id=35838-101636&m=dev) |

GitHub Pages auto-deploys from `main` — allow ~2 min after push.

## Running locally

```bash
npx serve .
# open http://localhost:3000
```

---

## Current status

The dialog is a fully interactive prototype. All primary interactions are implemented. No backend — state is in-memory only and resets on page reload.

### Done

- [x] Modal layout matching Figma spec
- [x] Drag-and-drop reordering within visible panel
- [x] Cross-panel drag (visible ↔ hidden)
- [x] Eye button visibility toggle with icon/tooltip swap
- [x] Position memory — click-toggle restores last held position; drag respects drop position
- [x] Drag-over highlight state on hidden panel
- [x] Tooltip component (black pill, upward caret)
- [x] Empty state with icon, title, and subtitle
- [x] Fixed 264px panel height (both panels identical)
- [x] Inset row dividers (44px row height preserved)
- [x] `#e5e5e5` hover on all icon buttons
- [x] Checked gridline checkboxes
- [x] Close and Cancel buttons dismiss the modal

### Not implemented

- [ ] **OK button** — currently a no-op; should apply changes and close
- [ ] **3-dot menu** — visible but non-functional
- [ ] **Keyboard navigation** — no focus management, no arrow-key support
- [ ] **Accessibility** — only basic `aria-label` present; no `role="dialog"`, focus trap, or `aria-live`
- [ ] **Persistence** — state resets on reload; no integration with a real data layer
- [ ] **Scrollbar on hidden panel** — if many columns are hidden, the list overflows without a scrollbar (visible panel has one, hidden panel does not)

---

## Things that must not regress

| Behaviour | Where it lives |
|---|---|
| Full row is drag ghost, not just the icon | `script.js` `onDragStart` + CSS `pointer-events: none` on `.column-item img` |
| Row height is exactly 44px | `.column-item` uses `box-shadow: inset` — never `border-bottom` |
| Both panels are 264px tall | `.column-list { height: 264px }` — no flex-grow overrides |
| Drag-over state works on repeated drags | `.column-list--drag-over` hides `.empty-state` and `.column-item` with `!important` |
| Click-toggle restores last position | `recordRestorePoint()` called before leaving visible; `insertAtRestorePoint()` on show |
| Drag always uses drop position | No `insertAtRestorePoint()` in any drag path |
| `eye-off.svg` used only in empty state badge | Buttons use `eye-off2.svg` — check both `index.html` and `updateVisibilityBtn()` in `script.js` |
| Tooltip never clipped by scroll list | `.tooltip` is appended to `<body>`, not inside `.column-list` |

---

## Known issues

- If all columns are moved to the hidden panel, the visible panel shows an unstyled empty box (no empty state for the left panel).
- The hidden panel has no scrollbar when it contains many items — needs `overflow-y: auto` and scrollbar styles matching the visible panel.
- `dragenter` can occasionally fire twice in quick succession on some browsers, toggling the drag-over class off; not yet reproducible consistently.

## Future improvements

- Add an empty state to the visible panel ("All columns are hidden").
- Add scrollbar to the hidden panel list.
- Implement the OK button — emit a structured `{ visible: [], hidden: [] }` event with column names in order.
- Implement the 3-dot menu (rename, reset, pin column, etc.).
- Add keyboard support: `Space` to toggle visibility, arrow keys to reorder.
- Add a proper focus trap and `role="dialog"` for accessibility compliance.
