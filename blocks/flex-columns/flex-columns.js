import { decorateBlock, loadBlock } from '../../scripts/aem.js';

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

  // Decorate and load any nested blocks inside columns
  const nestedBlocks = [...container.querySelectorAll('.flex-column > div[class]')];
  await Promise.all(
    nestedBlocks.map((nestedBlock) => {
      decorateBlock(nestedBlock);
      return loadBlock(nestedBlock);
    }),
  );
}
