# Adjust Layout Dialog

A pixel-faithful implementation of the **Adjust Layout** modal from the [WebCube Mockups 14.5](https://www.figma.com/design/vmzNIpIpswwrRzw8BUERHx/WebCube-Mockups-14.5?node-id=35838-101636&m=dev) Figma file.

Built with plain HTML, CSS, and vanilla JavaScript — no frameworks or build tools required.

## Features

- **Drag-and-drop reordering** — grab any row by its handle or label and drop it into a new position
- **Column visibility toggle** — click the eye icon to move a column between *Show in table* and *Hidden in table*
- **Empty state** — the hidden panel shows a contextual message when no columns are hidden
- **Gridline checkboxes** — toggle row and column gridlines independently
- **Hover states** on all icon buttons

## Getting started

No installation needed. Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
npx serve .
```

## Project structure

```
├── index.html           # Modal markup
├── styles.css           # Design tokens and component styles
├── script.js            # Drag-and-drop and interaction logic
└── assets/
    └── icons/           # SVG icons (checkbox, close, eye, eye-off, drag handles)
```

## Repository

[https://github.com/Morgado-SER/table-adjust-layout-dialog](https://github.com/Morgado-SER/table-adjust-layout-dialog)
