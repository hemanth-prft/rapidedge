import { decorateBlock, loadBlock } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * aem.js's wrapTextNodes() runs on the block BEFORE our decorate() is called.
 * It wraps cell content in a synthetic <p> whenever the first child is not a
 * "valid wrapper" (P, H1-H6, UL, OL, PICTURE, TABLE, HR).  Block divs
 * (accordion, cards, etc.) are DIVs → they get wrapped.
 * wrapTextNodes also moves data-aue-* attrs from the cell div onto that <p>.
 *
 * This helper walks every <p> that directly contains a <div> inside a col and
 * lifts the block div back up, restoring any instrumentation attrs.
 */
function unwrapBlocks(col) {
  col.querySelectorAll(':scope > p > div').forEach((blockDiv) => {
    const p = blockDiv.parentElement;
    [...p.attributes].forEach(({ name, value }) => {
      if (name.startsWith('data-aue-') || name.startsWith('data-richtext-')) {
        blockDiv.setAttribute(name, value);
        p.removeAttribute(name);
      }
    });
    p.before(blockDiv);
    if (!p.textContent.trim()) p.remove();
  });
}

export default async function decorate(block) {
  const rows = [...block.children];

  const container = document.createElement('div');
  container.className = 'flex-columns-container';

  rows.forEach((row) => {
    const cells = [...row.children];

    const col = document.createElement('div');
    col.className = 'flex-column';

    // Move all data-aue-* / data-richtext-* from the original row onto col so
    // UE can open the flex-column's properties dialog (data-aue-model) and
    // recognise it as a container (data-aue-filter, if the server rendered it).
    moveInstrumentation(row, col);

    // Explicitly set the filter so UE shows the "+" add button inside each
    // column even when the server did not render data-aue-filter on the item row
    // (block/v1/block/item may not emit it server-side).
    if (!col.dataset.aueFilter) {
      col.dataset.aueFilter = 'flex-column';
    }

    // cells[0] = width field (e.g. "50%")
    const widthCell = cells[0];
    if (widthCell) {
      const raw = widthCell.textContent.trim();
      if (raw) {
        const pct = raw.endsWith('%') ? raw : `${raw}%`;
        col.style.flexBasis = pct;
        col.style.maxWidth = pct;
      }
    }

    // cells[1..n] = content / child components.
    // Each child component added via UE becomes its own cell, so we must loop
    // all remaining cells – not just cells[1] – to avoid silently dropping
    // components when more than one has been added to a column.
    for (let i = 1; i < cells.length; i += 1) {
      while (cells[i].firstChild) {
        col.appendChild(cells[i].firstChild);
      }
    }

    container.appendChild(col);
  });

  block.innerHTML = '';
  block.appendChild(container);

  // Lift block divs that wrapTextNodes wrapped inside synthetic <p> tags.
  container.querySelectorAll('.flex-column').forEach(unwrapBlocks);

  // Decorate and load all nested blocks (accordion, cards, columns, hero, etc.)
  const candidates = [...container.querySelectorAll('.flex-column > div[class]')];
  candidates.forEach(decorateBlock);
  await Promise.all(
    candidates
      .filter((el) => el.dataset.blockName)
      .map(loadBlock),
  );
}

