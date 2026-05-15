import { decorateBlock, loadBlock } from '../../scripts/aem.js';

/**
 * aem.js's wrapTextNodes() is called by decorateBlock() on the flex-columns outer block
 * BEFORE our decorate() runs. It wraps any content-cell child whose first element is not
 * a "valid wrapper" (P, H1-H6, UL, OL, PICTURE, TABLE, HR) inside a synthetic <p>.
 * Because block divs (accordion, cards, etc.) are DIVs they get wrapped.
 * This helper lifts those block divs back out of the synthetic <p> so we can
 * query/decorate them normally. Any data-aue-* instrumentation attributes that
 * wrapTextNodes moved onto the <p> are transferred to the block div so UE
 * editing still works.
 */
function unwrapBlocks(col) {
  col.querySelectorAll(':scope > p > div, :scope > p > div[class]').forEach((blockDiv) => {
    const p = blockDiv.parentElement;
    // Transfer AUE instrumentation attributes from the synthetic <p> to the block div
    [...p.attributes].forEach(({ name, value }) => {
      if (name.startsWith('data-aue-') || name.startsWith('data-richtext-')) {
        blockDiv.setAttribute(name, value);
        p.removeAttribute(name);
      }
    });
    // Lift the block div out of the <p>
    p.before(blockDiv);
    // Remove the now-empty (or whitespace-only) <p>
    if (!p.textContent.trim()) p.remove();
  });
}

export default async function decorate(block) {
  const rows = [...block.children];

  const container = document.createElement('div');
  container.className = 'flex-columns-container';

  rows.forEach((row) => {
    const cells = [...row.children];
    const widthCell = cells[0];
    const contentCell = cells[1];

    const col = document.createElement('div');
    col.className = 'flex-column';

    // Read width from first cell (e.g. "30%" or "30")
    if (widthCell) {
      const raw = widthCell.textContent.trim();
      if (raw) {
        const pct = raw.endsWith('%') ? raw : `${raw}%`;
        col.style.flexBasis = pct;
        col.style.maxWidth = pct;
      }
    }

    // Move content from second cell into column div
    if (contentCell) {
      while (contentCell.firstChild) {
        col.appendChild(contentCell.firstChild);
      }
    }

    container.appendChild(col);
  });

  block.innerHTML = '';
  block.appendChild(container);

  // Lift any block divs that wrapTextNodes wrapped inside synthetic <p> tags
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
