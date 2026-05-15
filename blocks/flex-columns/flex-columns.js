import { decorateBlock, loadBlock } from '../../scripts/aem.js';

/**
 * flex-column items use resourceType core/franklin/components/section/v1/section.
 * The server renders each flex-column as a plain <div> (direct child of the block)
 * with data-aue-* instrumentation already on it. The width model field is
 * appended as a section-metadata key-value block when it has a value.
 *
 * aem.js wrapTextNodes() runs before decorate() and wraps the section-metadata
 * rows inside a synthetic <p>, so we cannot use :scope > div — we search all
 * nested divs for the key/value pair instead.
 */
function extractWidth(col) {
  const meta = col.querySelector('.section-metadata');
  if (!meta) return null;
  let width = null;
  meta.querySelectorAll('div').forEach((div) => {
    if (div.children.length === 2) {
      const key = div.children[0].textContent.trim().toLowerCase();
      const val = div.children[1].textContent.trim();
      if (key === 'width' && val) width = val;
    }
  });
  meta.remove();
  return width;
}

export default async function decorate(block) {
  // Each direct child div is a flex-column section rendered by section/v1/section.
  // They already carry data-aue-resource / data-aue-type / data-aue-filter from
  // the server — no moveInstrumentation needed.
  const cols = [...block.children];

  const container = document.createElement('div');
  container.className = 'flex-columns-container';

  cols.forEach((col) => {
    col.classList.add('flex-column');

    // Read width from section-metadata block (appended by the server for the
    // "width" model field) and apply it as an inline flex-basis / max-width.
    const width = extractWidth(col);
    if (width) {
      const pct = width.endsWith('%') ? width : `${width}%`;
      col.style.flexBasis = pct;
      col.style.maxWidth = pct;
    }

    container.appendChild(col);
  });

  block.innerHTML = '';
  block.appendChild(container);

  // Decorate and load any nested blocks (accordion, cards, columns, hero, etc.)
  // that the server placed inside each flex-column section div.
  const candidates = [...container.querySelectorAll('.flex-column > div[class]')];
  candidates.forEach(decorateBlock);
  await Promise.all(
    candidates
      .filter((el) => el.dataset.blockName)
      .map(loadBlock),
  );
}
