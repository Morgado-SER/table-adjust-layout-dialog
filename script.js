// Drag-and-drop reordering for the visible columns list
(function () {
  const visibleList = document.getElementById('visible-columns');
  const hiddenList = document.getElementById('hidden-columns');

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
    tooltip.style.top = (rect.bottom + window.scrollY + 8) + 'px';
    tooltip.style.left = (rect.left + window.scrollX + rect.width / 2) + 'px';
    tooltip.classList.add('tooltip--visible');
  }, true);

  document.addEventListener('mouseleave', function (e) {
    if (!e.target.closest('[data-tooltip]')) return;
    tooltip.classList.remove('tooltip--visible');
  }, true);

  // Hide tooltip during drag
  document.addEventListener('dragstart', function () {
    tooltip.classList.remove('tooltip--visible');
  }, true);

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
      img.src = 'assets/icons/eye-off.svg';
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

  function initDragEvents(item) {
    item.querySelectorAll('img').forEach(img => img.setAttribute('draggable', 'false'));
    item.addEventListener('dragstart', onDragStart);
    item.addEventListener('dragend', onDragEnd);
    item.addEventListener('dragover', onDragOver);
    item.addEventListener('dragleave', onDragLeave);
    item.addEventListener('drop', onDrop);
  }

  function onDragStart(e) {
    dragSrc = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    const rect = this.getBoundingClientRect();
    e.dataTransfer.setDragImage(this, e.clientX - rect.left, e.clientY - rect.top);
  }

  function onDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.column-item').forEach(el => el.classList.remove('drag-over'));
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
      tgtParent.insertBefore(dragSrc, this);
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

  // Allow dropping onto the list panels (including empty ones)
  function initListDrop(list) {
    list.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    list.addEventListener('drop', function (e) {
      e.stopPropagation();
      hiddenList.classList.remove('column-list--drag-over');
      const srcList = dragSrc ? dragSrc.closest('.column-list') : null;
      const items = getItems(this);
      if (dragSrc && !items.includes(dragSrc)) {
        this.appendChild(dragSrc);
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

  // Initialise
  getItems(visibleList).forEach(initDragEvents);
  getItems(hiddenList).forEach(initDragEvents);
  initListDrop(visibleList);
  initListDrop(hiddenList);

  // Eye button click: move column between lists + update icon/tooltip
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.column-actions .icon-btn:first-child');
    if (!btn) return;
    const item = btn.closest('.column-item');
    if (!item) return;
    const currentList = item.closest('.column-list');
    const targetList = currentList === visibleList ? hiddenList : visibleList;
    targetList.appendChild(item);
    initDragEvents(item);
    updateVisibilityBtn(item, targetList === hiddenList);
    updateEmptyState(visibleList);
    updateEmptyState(hiddenList);
  });

  // Close / Cancel buttons
  document.querySelector('.close-btn')?.addEventListener('click', () => {
    document.querySelector('.backdrop').style.display = 'none';
  });
  document.querySelector('.btn--secondary')?.addEventListener('click', () => {
    document.querySelector('.backdrop').style.display = 'none';
  });
}());
