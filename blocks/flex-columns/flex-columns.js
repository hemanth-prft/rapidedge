import { decorateBlock, loadBlock } from '../../scripts/aem.js';

/**
 * Detects flattened accordion content (produced by AEM's block/v1/block/item Sling model)
 * and reconstructs a proper accordion block so accordion.js can decorate it.
 *
 * Pattern: accordion-item titles come through as plain <p> with NO child elements.
 * Requires at least 2 such <p> elements to trigger reconstruction.
 */
async function rebuildAccordion(col) {
  const children = [...col.children];
  const isTitleEl = (el) => el.tagName === 'P' && el.children.length === 0 && el.textContent.trim();
  const titleIndices = children.reduce((acc, el, i) => {
    if (isTitleEl(el)) acc.push(i);
    return acc;
  }, []);

  if (titleIndices.length < 2) return;

  const accordionBlock = document.createElement('div');
  accordionBlock.className = 'accordion';

  titleIndices.forEach((titleIdx, i) => {
    const nextIdx = titleIndices[i + 1] ?? children.length;
    const row = document.createElement('div');
    const titleDiv = document.createElement('div');
    titleDiv.textContent = children[titleIdx].textContent.trim();
    const bodyDiv = document.createElement('div');
    for (let j = titleIdx + 1; j < nextIdx; j += 1) {
      bodyDiv.appendChild(children[j].cloneNode(true));
    }
    row.append(titleDiv, bodyDiv);
    accordionBlock.appendChild(row);
  });

  col.innerHTML = '';
  col.appendChild(accordionBlock);
  decorateBlock(accordionBlock);
  await loadBlock(accordionBlock);
}

export default async function decorate(block) {
  const rows = [...block.children];

  // Build flex container
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

  // Rebuild any flattened accordion content inside columns
  const rebuilds = [...container.querySelectorAll('.flex-column')].map(rebuildAccordion);
  await Promise.all(rebuilds);
}
