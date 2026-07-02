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
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  // apply custom column widths (e.g. class "30-70" or "25-50-25")
  const widthClass = [...block.classList].find((cls) => /^\d+(-\d+)+$/.test(cls));
  if (widthClass) {
    const widths = widthClass.split('-').map(Number);
    block.classList.add('columns-custom-widths');
    [...block.children].forEach((row) => {
      [...row.children].forEach((col, i) => {
        if (widths[i] !== undefined) {
          col.style.flex = `0 0 ${widths[i]}%`;
        }
      });
    });
  }
}
