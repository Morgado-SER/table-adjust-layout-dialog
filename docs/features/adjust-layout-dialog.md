# Feature: Adjust Layout Dialog

**Figma source:** [WebCube Mockups 14.5 — node 35838-101636](https://www.figma.com/design/vmzNIpIpswwrRzw8BUERHx/WebCube-Mockups-14.5?node-id=35838-101636&m=dev)

## Purpose

A modal that lets users control which table columns are visible and in what order. Changes are confirmed with OK or discarded with Cancel/Close.

## Layout

```
┌─────────────────────────────────────────────────────┐
│ Adjust layout                                    [×] │
│ Select the columns to be displayed, and…             │
│ ┌───────────────────────┬───────────────────────┐   │
│ │ Show in table         │ Hidden in table        │   │
│ │ ┌───────────────────┐ │ ┌───────────────────┐ │   │
│ │ │ ⣿ Country    👁 ⋮ │ │ │                   │ │   │
│ │ │ ⣿ Author     👁 ⋮ │ │ │   (empty state)   │ │   │
│ │ │ …                 │ │ │                   │ │   │
│ │ └───────────────────┘ │ └───────────────────┘ │   │
│ └───────────────────────┴───────────────────────┘   │
│ ☑ Show gridlines for rows  ☑ Show gridlines for cols│
│                              [Cancel]  [OK]         │
└─────────────────────────────────────────────────────┘
```

Both panels are **fixed at 264px tall**. The visible list scrolls when items overflow.

---

## Behaviours

### Drag and drop

- Any part of a row (including the drag handle) starts a drag. The full row is the ghost image.
- **Within visible panel** — reorders items; drop position is respected exactly.
- **Visible → hidden** — drops the item at the end of the hidden list (or at the drop target if dropped on an existing hidden item).
- **Hidden → visible** — places the item at the exact drop position in the visible list.
- **Drop zone highlight** — when dragging over the hidden panel, it shows a dashed `#052474` border, `#f3f4f8` background, and "Drop to hide column" text. Existing items and the empty state are hidden during this state.

### Visibility toggle (eye button)

- **Visible panel:** `eye-off2.svg` icon, tooltip "Hide column". Clicking moves the item to the hidden panel.
- **Hidden panel:** `eye.svg` icon, tooltip "Show column". Clicking moves the item back to the visible panel **at its last held position** (see Position memory below).
- The icon, tooltip text, and `aria-label` all swap on every move.

### Position memory

- On load, each item receives a stable `data-order` attribute (0-based index).
- Immediately before an item leaves the visible list (by click **or** drag), `recordRestorePoint()` snapshots the `data-order` values of all items that currently follow it.
- When the eye button is clicked to **show** a hidden item, `insertAtRestorePoint()` scans those candidates and inserts before the first one still present in the visible list. If none are present, it appends to the end.
- **Drag never uses restore logic** — it always places at the drop position.

### Empty state (hidden panel)

- Icon: `eye-off.svg` in a 32×32 circular badge (icon rendered at 28×28).
- Bold title: "No hidden columns"
- Subtitle: "Drag a column here or use the visibility action to hide it."

### Tooltip

- Black rounded pill (`background: #000`, `border-radius: 8px`, `padding: 6px 12px`), `Figtree Regular 14px`, white text.
- Upward-pointing caret via `::before` (`border-bottom: 5px solid #000`).
- Appears **8px below** the hovered button.
- Implemented as a **single `div.tooltip` appended to `<body>`** — not nested inside the list — to avoid being clipped by the list's `overflow-y: auto`.
- Hidden immediately on `dragstart`.

---

## States checklist

| Scenario | Expected result |
|---|---|
| Empty hidden panel | Shows icon + "No hidden columns" + subtitle |
| Drag visible item over hidden panel | Dashed border, blue bg, "Drop to hide column", existing content hidden |
| Drag cancelled (no drop) | Hidden panel returns to normal immediately |
| Repeated drags to hidden panel (panel already has items) | Drop zone still shows correctly; items hidden during drag-over |
| Click eye to hide | Item moves to hidden panel; icon → `eye.svg`; tooltip → "Show column" |
| Click eye to show | Item returns to last position in visible panel; icon → `eye-off2.svg`; tooltip → "Hide column" |
| Drag item to new visible position, then click-hide, then click-show | Returns to the dragged position, not the initial one |
