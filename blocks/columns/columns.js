import { decorateBlock, loadBlock } from '../../scripts/aem.js';

export default async function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  // load all nested blocks inside columns
  const columnCells = block.querySelectorAll(':scope > div > div');
  const blockLoads = [];
  columnCells.forEach((col) => {
    col.querySelectorAll('div[class]').forEach((nested) => {
      const hasBlockClass = nested.classList.length > 0
        && !nested.classList.contains('columns-img-col')
        && !nested.dataset.blockStatus;
      if (hasBlockClass) {
        decorateBlock(nested);
        blockLoads.push(loadBlock(nested));
      }
    });
  });
  await Promise.all(blockLoads);
}
