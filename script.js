// Drag-and-drop reordering for the visible columns list
(function () {
  const visibleList = document.getElementById('visible-columns');
  const hiddenList = document.getElementById('hidden-columns');

  let dragSrc = null;

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
    // Prevent child images from being dragged independently
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
    // Use the full row as the drag ghost, positioned under the cursor
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

      // Determine insert position
      const allItems = getItems(tgtParent);
      const tgtIndex = allItems.indexOf(this);
      tgtParent.insertBefore(dragSrc, this);

      initDragEvents(dragSrc);
      updateEmptyState(srcParent);
      updateEmptyState(tgtParent);
    }
    this.classList.remove('drag-over');
    return false;
  }

  // Allow dropping onto the empty list panels
  function initListDrop(list) {
    list.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    list.addEventListener('drop', function (e) {
      e.stopPropagation();
      hiddenList.classList.remove('column-list--drag-over');
      const items = getItems(this);
      if (dragSrc && !items.includes(dragSrc)) {
        this.appendChild(dragSrc);
        initDragEvents(dragSrc);
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
    // Only remove when the cursor truly leaves the panel (not entering a child)
    if (!hiddenList.contains(e.relatedTarget)) {
      hiddenList.classList.remove('column-list--drag-over');
    }
  });

  // Initialise
  getItems(visibleList).forEach(initDragEvents);
  getItems(hiddenList).forEach(initDragEvents);
  initListDrop(visibleList);
  initListDrop(hiddenList);

  // Eye icon: move column between lists
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.column-actions .icon-btn:first-child');
    if (!btn) return;
    const item = btn.closest('.column-item');
    if (!item) return;
    const currentList = item.closest('.column-list');
    const targetList = currentList === visibleList ? hiddenList : visibleList;
    targetList.appendChild(item);
    initDragEvents(item);
    updateEmptyState(visibleList);
    updateEmptyState(hiddenList);
  });

  // Close button
  const closeBtn = document.querySelector('.close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      document.querySelector('.backdrop').style.display = 'none';
    });
  }

  // Cancel button
  const cancelBtn = document.querySelector('.btn--secondary');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function () {
      document.querySelector('.backdrop').style.display = 'none';
    });
  }
}());
