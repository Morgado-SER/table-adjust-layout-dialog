// Drag-and-drop reordering for the visible columns list
(function () {
  const visibleList = document.getElementById('visible-columns');
  const hiddenList  = document.getElementById('hidden-columns');

  let dragSrc = null;

  // ── Tooltip singleton ──────────────────────────────────────────────────────
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  document.body.appendChild(tooltip);

  document.addEventListener('mouseenter', function (e) {
    const btn = e.target.closest('[data-tooltip]');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    tooltip.textContent = btn.dataset.tooltip;
    tooltip.style.top  = (rect.bottom + window.scrollY + 8) + 'px';
    tooltip.style.left = (rect.left + window.scrollX + rect.width / 2) + 'px';
    tooltip.classList.add('tooltip--visible');
  }, true);

  document.addEventListener('mouseleave', function (e) {
    if (!e.target.closest('[data-tooltip]')) return;
    tooltip.classList.remove('tooltip--visible');
  }, true);

  document.addEventListener('dragstart', function () {
    tooltip.classList.remove('tooltip--visible');
  }, true);

  // ── Position tracking ──────────────────────────────────────────────────────
  // Give every item a stable ID so we can reference neighbours.
  function initOrder() {
    getItems(visibleList).forEach((item, i) => {
      item.dataset.order = i;
    });
  }

  // Snapshot the data-order values of all items that come AFTER `item`
  // in the visible list at this moment. Called right before the item leaves.
  function recordRestorePoint(item) {
    const items = getItems(visibleList);
    const idx   = items.indexOf(item);
    if (idx === -1) return; // item is not currently in the visible list
    const after = items.slice(idx + 1).map(el => el.dataset.order);
    item.dataset.restoreBefore = after.join(',');
  }

  // Re-insert item at the position recorded by recordRestorePoint.
  function insertAtRestorePoint(item) {
    const candidates = (item.dataset.restoreBefore || '').split(',').filter(Boolean);
    for (const order of candidates) {
      const target = getItems(visibleList).find(el => el.dataset.order === order);
      if (target) {
        visibleList.insertBefore(item, target);
        return;
      }
    }
    visibleList.appendChild(item); // item was last, or all successors are hidden
  }

  // ── Visibility button state ────────────────────────────────────────────────
  function updateVisibilityBtn(item, isNowHidden) {
    const btn = item.querySelector('.column-actions .icon-btn:first-child');
    if (!btn) return;
    const img = btn.querySelector('img');
    if (isNowHidden) {
      img.src = 'assets/icons/eye.svg';
      btn.dataset.tooltip = 'Show column';
      btn.setAttribute('aria-label', 'Show column');
    } else {
      img.src = 'assets/icons/eye-off2.svg';
      btn.dataset.tooltip = 'Hide column';
      btn.setAttribute('aria-label', 'Hide column');
    }
  }

  // ── Drag helpers ───────────────────────────────────────────────────────────
  function getItems(list) {
    return [...list.querySelectorAll('.column-item')];
  }

  function updateEmptyState(list) {
    const emptyState = list.querySelector('.empty-state');
    const items = getItems(list);
    if (emptyState) {
      emptyState.style.display = items.length === 0 ? 'flex' : 'none';
    }
    list.classList.toggle('column-list--empty', items.length === 0);
  }

  // Named handlers so addEventListener deduplicates on repeated initDragEvents calls
  function onMouseEnterItem() { this.classList.add('is-hovered'); }
  function onMouseLeaveItem() { this.classList.remove('is-hovered'); }

  function initDragEvents(item) {
    item.querySelectorAll('img').forEach(img => img.setAttribute('draggable', 'false'));
    item.addEventListener('dragstart',  onDragStart);
    item.addEventListener('dragend',    onDragEnd);
    item.addEventListener('dragover',   onDragOver);
    item.addEventListener('dragleave',  onDragLeave);
    item.addEventListener('drop',       onDrop);
    // mouseenter/mouseleave fire only on physical cursor crossings — not on DOM
    // reorders — so they are immune to the stale-hover problem.
    item.addEventListener('mouseenter', onMouseEnterItem);
    item.addEventListener('mouseleave', onMouseLeaveItem);
  }

  function onDragStart(e) {
    dragSrc = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    const rect = this.getBoundingClientRect();

    // setDragImage captures the element before CSS repaints, so the .dragging
    // rule hasn't hidden the actions yet. Use a clean clone with actions removed.
    const ghost = this.cloneNode(true);
    const ghostActions = ghost.querySelector('.column-actions');
    if (ghostActions) ghostActions.style.display = 'none';
    Object.assign(ghost.style, {
      position:  'fixed',
      top:       '-9999px',
      left:      '-9999px',
      width:     rect.width + 'px',
      background: '#fff',
      opacity:   '1',
    });
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, e.clientX - rect.left, e.clientY - rect.top);
    requestAnimationFrame(() => ghost.remove());
  }

  function onDragEnd() {
    this.classList.remove('dragging');
    // mouseleave doesn't fire reliably during a drag, so clear any stale hover state.
    document.querySelectorAll('.column-item').forEach(el => {
      el.classList.remove('drag-over');
      el.classList.remove('is-hovered');
    });
    hiddenList.classList.remove('column-list--drag-over');
  }

  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (this !== dragSrc) {
      document.querySelectorAll('.column-item').forEach(el => el.classList.remove('drag-over'));
      this.classList.add('drag-over');
    }
    return false;
  }

  function onDragLeave() {
    this.classList.remove('drag-over');
  }

  function onDrop(e) {
    e.stopPropagation();
    if (dragSrc !== this) {
      const srcParent = dragSrc.parentNode;
      const tgtParent = this.parentNode;

      // Record position before leaving the visible list
      if (srcParent === visibleList) recordRestorePoint(dragSrc);

      tgtParent.insertBefore(dragSrc, this); // drag always respects drop position

      initDragEvents(dragSrc);
      if (srcParent !== tgtParent) {
        updateVisibilityBtn(dragSrc, tgtParent === hiddenList);
      }
      updateEmptyState(srcParent);
      updateEmptyState(tgtParent);
    }
    this.classList.remove('drag-over');
    return false;
  }

  // Allow dropping onto the list panels (including when empty)
  function initListDrop(list) {
    list.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    list.addEventListener('drop', function (e) {
      e.stopPropagation();
      hiddenList.classList.remove('column-list--drag-over');
      const srcList = dragSrc ? dragSrc.closest('.column-list') : null;
      const items   = getItems(this);
      if (dragSrc && !items.includes(dragSrc)) {
        // Record position before leaving the visible list
        if (srcList === visibleList) recordRestorePoint(dragSrc);

        this.appendChild(dragSrc); // drag always respects drop position

        initDragEvents(dragSrc);
        if (srcList !== this) {
          updateVisibilityBtn(dragSrc, this === hiddenList);
        }
        updateEmptyState(visibleList);
        updateEmptyState(hiddenList);
      }
    });
  }

  // Drag-over highlight on the hidden panel
  hiddenList.addEventListener('dragenter', function (e) {
    e.preventDefault();
    if (dragSrc && !getItems(hiddenList).includes(dragSrc)) {
      hiddenList.classList.add('column-list--drag-over');
    }
  });

  hiddenList.addEventListener('dragleave', function (e) {
    if (!hiddenList.contains(e.relatedTarget)) {
      hiddenList.classList.remove('column-list--drag-over');
    }
  });

  // ── Initialise ─────────────────────────────────────────────────────────────
  initOrder();
  getItems(visibleList).forEach(initDragEvents);
  getItems(hiddenList).forEach(initDragEvents);
  initListDrop(visibleList);
  initListDrop(hiddenList);

  // Eye button click: record position when hiding, restore it when showing
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.column-actions .icon-btn:first-child');
    if (!btn) return;
    const item        = btn.closest('.column-item');
    if (!item) return;
    const currentList = item.closest('.column-list');
    const goingToHidden = currentList === visibleList;

    if (goingToHidden) {
      recordRestorePoint(item);   // snapshot position before hiding
      hiddenList.appendChild(item);
    } else {
      insertAtRestorePoint(item); // restore to last known position
    }

    initDragEvents(item);
    updateVisibilityBtn(item, goingToHidden);
    updateEmptyState(visibleList);
    updateEmptyState(hiddenList);
  });

  // Arrow up / down buttons — reorder within the visible list
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.icon-btn[aria-label="Move up"], .icon-btn[aria-label="Move down"]');
    if (!btn) return;
    const item = btn.closest('.column-item');
    if (!item || item.closest('.column-list') !== visibleList) return;

    const items = getItems(visibleList);
    const idx   = items.indexOf(item);
    let moved   = false;

    if (btn.getAttribute('aria-label') === 'Move up' && idx > 0) {
      visibleList.insertBefore(item, items[idx - 1]);
      moved = true;
    } else if (btn.getAttribute('aria-label') === 'Move down' && idx < items.length - 1) {
      visibleList.insertBefore(items[idx + 1], item);
      moved = true;
    }

    if (moved) {
      item.classList.remove('is-hovered');
      if (e.detail === 0) {
        // Keyboard (Space / Enter): keep focus so :focus-within shows actions.
        btn.focus();
      } else {
        // Mouse: blur so :focus-within doesn't keep actions visible after the move.
        btn.blur();
      }
    }
  });

  // Close / Cancel buttons
  document.querySelector('.close-btn')?.addEventListener('click', () => {
    document.querySelector('.backdrop').style.display = 'none';
  });
  document.querySelector('.btn--secondary')?.addEventListener('click', () => {
    document.querySelector('.backdrop').style.display = 'none';
  });
}());
