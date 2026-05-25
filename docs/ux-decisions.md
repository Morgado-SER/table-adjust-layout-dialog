# UX Decisions

Non-obvious choices made during implementation and the reasoning behind them.

---

## Row divider: inset box-shadow, not border-bottom

`border-bottom` adds 1px outside the padding box, making each row 45px instead of 44px.  
**Fix:** `box-shadow: inset 0 -1px 0 var(--color-lighter-gray)` — drawn inside the element, no height impact.  
**Do not revert to `border-bottom`.**

## Tooltip: body-level singleton

The visible panel list has `overflow-y: auto`, which clips any absolutely-positioned children.  
A single `div.tooltip` appended to `<body>` is positioned with `getBoundingClientRect()` + scroll offset, bypassing all overflow containers.  
Using `position: fixed` was considered but rejected because scroll offset handling is simpler with `position: absolute` on `<body>`.

## Two separate eye-off icons

`eye-off.svg` is used only in the empty state badge (decorative, 28px inside a 32px circle).  
`eye-off2.svg` is the action icon on visible-panel rows (22px, interactive).  
They are visually different by design. Do not unify them into one file.

## Fixed 264px panel height

Both panels use `height: 264px` on `.column-list` directly (not min/max-height).  
Previously, the hidden panel used `flex: 1` + `min-height`, causing it to be a different size than the visible panel.  
Consistent height gives users a stable drop target and prevents layout shift when items move between panels.

## Drag-over: hide existing content with `display: none !important`

The drag-over state adds `.column-list--drag-over`, which hides `.empty-state` and `.column-item` with `!important`.  
The `!important` is needed because `updateEmptyState()` sets inline styles (`element.style.display`), which normally outrank class-based rules.  
Without `!important`, the empty state bleeds through on the second drag when the hidden panel already contains items.

## Position restore: last position, not initial position

When an item is shown via the eye button, it returns to **where it was when hidden**, not its original slot from page load.  
This matches user intent: if a user drags a column to a new position and then hides it, they expect it back in that new position when shown again.  
Drag-and-drop is exempt from this logic — it always places at the drop position to respect explicit user intent.

## Drag ghost: full row, not icon

`<img>` elements are natively draggable. Without intervention, dragging the handle icon would ghost only the icon, not the row.  
Three-layer fix:
1. CSS: `pointer-events: none` + `-webkit-user-drag: none` on `.column-item img`
2. JS init: `img.setAttribute('draggable', 'false')` on every image inside each item
3. JS dragstart: `e.dataTransfer.setDragImage(this, ...)` explicitly sets the full row as the ghost

## Icon button hover: #e5e5e5

Figma specifies `#E5E5E5` for icon button hover. The default `#F5F5F5` (lightest gray token) is too subtle.  
This value is hardcoded in `.icon-btn:hover` — it does not map to an existing design token.
