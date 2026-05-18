import {
  decorateBlock,
  loadBlock,
  decorateButtons,
  decorateIcons,
} from '../../scripts/aem.js';

export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // Detect column count from the first row
  const cols = [...rows[0].children];
  block.classList.add(`columns-${cols.length}-cols`);

  // Apply per-column widths if specified via data attribute (e.g. "40,60")
  const widthConfig = block.dataset.widths;
  if (widthConfig) {
    const widths = widthConfig.split(',').map((w) => w.trim());
    rows.forEach((row) => {
      [...row.children].forEach((col, i) => {
        if (widths[i]) {
          col.style.flex = `0 0 ${widths[i]}%`;
          col.style.maxWidth = `${widths[i]}%`;
        }
      });
    });
  }

  // Setup image columns and decorate nested content
  rows.forEach((row) => {
    [...row.children].forEach((col) => {
      // Mark image-only columns
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-img-col');
        }
      }

      // Decorate buttons and icons inside columns
      decorateButtons(col);
      decorateIcons(col);
    });
  });

  // Decorate and load any nested blocks inside columns
  const nestedBlocks = [...block.querySelectorAll('.block')];
  nestedBlocks.forEach((nestedBlock) => decorateBlock(nestedBlock));
  await Promise.all(nestedBlocks.map((nestedBlock) => loadBlock(nestedBlock)));
}
