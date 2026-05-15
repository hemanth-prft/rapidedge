import { decorateBlock, loadBlock } from '../../scripts/aem.js';

export default async function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;

  const cols = [...row.children];
  block.classList.add(`flex-columns-${cols.length}-cols`);

  // Optional width ratios via block option, e.g. "Flex Columns (70-30)"
  // adds class "70-30" which we parse to set per-column flex-basis.
  const ratioClass = [...block.classList].find((c) => /^\d+(-\d+)+$/.test(c));
  if (ratioClass) {
    const widths = ratioClass.split('-');
    cols.forEach((col, i) => {
      if (widths[i]) {
        col.style.flexBasis = `${widths[i]}%`;
        col.style.maxWidth = `${widths[i]}%`;
      }
    });
  }

  // wrapTextNodes() runs before decorate() and wraps any block div (accordion,
  // cards, etc.) inside a synthetic <p> because DIV is not a valid wrapper tag.
  // Lift those block divs back out so decorateBlock() can find them.
  cols.forEach((col) => {
    col.querySelectorAll(':scope > p > div[class]').forEach((blockDiv) => {
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
  });

  // Decorate and load any nested blocks (accordion, cards, hero, etc.)
  // placed inside column cells. decorateBlocks() only handles section > div > div
  // depth so nested blocks must be loaded manually here.
  const nestedBlocks = [...block.querySelectorAll(':scope > div > div > div[class]')];
  nestedBlocks.forEach(decorateBlock);
  await Promise.all(
    nestedBlocks.filter((el) => el.dataset.blockName).map(loadBlock),
  );
}
