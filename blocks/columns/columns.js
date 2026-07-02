const GAP = 24;
const GRID_UNITS = 12;

function parseColWidths(block, numCols) {
  const colClass = [...block.classList].find((c) => /^col-(\d+(-\d+)+)$/.test(c));
  if (colClass) {
    const parts = colClass.replace('col-', '').split('-').map(Number);
    if (parts.length === numCols && parts.reduce((a, b) => a + b, 0) === GRID_UNITS) {
      return parts;
    }
  }
  const base = Math.floor(GRID_UNITS / numCols);
  const remainder = GRID_UNITS % numCols;
  return Array.from({ length: numCols }, (_, i) => base + (i < remainder ? 1 : 0));
}

function getContentCols(row) {
  return [...row.children].filter((el) => !el.classList.contains('columns-resizer') && !el.classList.contains('columns-grid-overlay'));
}

function applyColumnWidths(block, widths) {
  [...block.children].forEach((row) => {
    const cols = getContentCols(row);
    const numGaps = cols.length - 1;
    const totalGap = numGaps * GAP;
    cols.forEach((col, i) => {
      const pct = (widths[i] / GRID_UNITS) * 100;
      const gapShare = totalGap / cols.length;
      col.style.flex = `0 0 calc(${pct}% - ${gapShare}px)`;
    });
  });
}

function updateBlockClass(block, widths) {
  const existing = [...block.classList].find((c) => /^col-\d+(-\d+)+$/.test(c));
  if (existing) block.classList.remove(existing);
  block.classList.add(`col-${widths.join('-')}`);
}

function showGridOverlay(row) {
  let overlay = row.querySelector('.columns-grid-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'columns-grid-overlay';
    for (let i = 0; i < GRID_UNITS; i += 1) {
      overlay.appendChild(document.createElement('div'));
    }
    row.style.position = 'relative';
    row.appendChild(overlay);
  }
  overlay.classList.add('visible');
}

function hideGridOverlay(row) {
  const overlay = row.querySelector('.columns-grid-overlay');
  if (overlay) overlay.classList.remove('visible');
}

function attachDragListeners(block, resizer) {
  let startX;
  let startWidths;
  let rowRect;
  let leftIndex;
  let numCols;
  let row;

  function onStart(e) {
    e.preventDefault();
    resizer.classList.add('active');
    row = resizer.parentElement;
    rowRect = row.getBoundingClientRect();
    leftIndex = parseInt(resizer.dataset.index, 10);
    numCols = getContentCols(row).length;
    startWidths = parseColWidths(block, numCols);
    startX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    showGridOverlay(row);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }

  function onMove(e) {
    e.preventDefault();
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - startX;
    const unitWidth = rowRect.width / GRID_UNITS;
    const deltaUnits = Math.round(deltaX / unitWidth);
    if (deltaUnits === 0 && startWidths[leftIndex] === parseColWidths(block, numCols)[leftIndex]) return;

    const newWidths = [...startWidths];
    const newLeft = startWidths[leftIndex] + deltaUnits;
    const newRight = startWidths[leftIndex + 1] - deltaUnits;

    if (newLeft >= 1 && newRight >= 1) {
      newWidths[leftIndex] = newLeft;
      newWidths[leftIndex + 1] = newRight;
      applyColumnWidths(block, newWidths);
    }
  }

  function onEnd() {
    resizer.classList.remove('active');
    hideGridOverlay(row);
    const currentWidths = parseColWidths(block, numCols);
    const cols = getContentCols(row);
    const widths = cols.map((col) => {
      const flex = col.style.flex;
      const match = flex.match(/([\d.]+)%/);
      if (match) return Math.round((parseFloat(match[1]) / 100) * GRID_UNITS);
      return Math.floor(GRID_UNITS / numCols);
    });
    const sum = widths.reduce((a, b) => a + b, 0);
    if (sum === GRID_UNITS) {
      updateBlockClass(block, widths);
    } else {
      updateBlockClass(block, currentWidths);
    }
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
  }

  resizer.addEventListener('mousedown', onStart);
  resizer.addEventListener('touchstart', onStart, { passive: false });

  resizer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const delta = e.key === 'ArrowLeft' ? -1 : 1;
      const r = resizer.parentElement;
      const nc = getContentCols(r).length;
      const widths = parseColWidths(block, nc);
      const idx = parseInt(resizer.dataset.index, 10);
      const newLeft = widths[idx] + delta;
      const newRight = widths[idx + 1] - delta;
      if (newLeft >= 1 && newRight >= 1) {
        widths[idx] = newLeft;
        widths[idx + 1] = newRight;
        applyColumnWidths(block, widths);
        updateBlockClass(block, widths);
      }
    }
  });
}

function insertResizers(block) {
  [...block.children].forEach((row) => {
    const cols = getContentCols(row);
    for (let i = cols.length - 1; i > 0; i -= 1) {
      const resizer = document.createElement('div');
      resizer.className = 'columns-resizer';
      resizer.setAttribute('role', 'separator');
      resizer.setAttribute('aria-orientation', 'vertical');
      resizer.setAttribute('tabindex', '0');
      resizer.dataset.index = String(i - 1);
      row.insertBefore(resizer, cols[i]);
    }
  });
  block.querySelectorAll('.columns-resizer').forEach((resizer) => {
    attachDragListeners(block, resizer);
  });
}

function isEditMode() {
  return document.querySelector('[data-aue-resource]') !== null;
}

function initializeGrid(block, numCols) {
  const widths = parseColWidths(block, numCols);
  if (!block.classList.toString().match(/col-\d+(-\d+)+/)) {
    block.classList.add(`col-${widths.join('-')}`);
  }
  applyColumnWidths(block, widths);
  if (isEditMode()) {
    insertResizers(block);
  }
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  // initialize 12-grid system with drag handles
  const numCols = cols.length;
  if (numCols >= 2 && numCols <= 4) {
    initializeGrid(block, numCols);
  }
}
