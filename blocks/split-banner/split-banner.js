function decorateCta(contentCol) {
  if (!contentCol) return;
  contentCol.querySelectorAll('p > a:only-child').forEach((link) => {
    const ctaP = link.closest('p');
    ctaP.classList.add('split-banner-cta');

    // Inject icon from the immediately following picture-only paragraph
    const nextP = ctaP.nextElementSibling;
    if (nextP) {
      const pic = nextP.querySelector('picture');
      if (pic && nextP.children.length === 1) {
        const img = pic.querySelector('img');
        if (img) img.classList.add('split-banner-cta-icon');
        link.append(pic);
        nextP.remove();
      }
    }
  });
}

export default function decorate(block) {
  const rows = [...block.children];
  const hasTwoCols = rows[0]?.children.length >= 2;

  if (hasTwoCols) {
    // Document table rendering: first row = [image col | content col]
    const [imageCol, contentCol] = rows[0].children;
    if (imageCol) imageCol.classList.add('split-banner-image');
    if (contentCol) contentCol.classList.add('split-banner-content');
    decorateCta(contentCol);
  } else {
    // UE flat-model rendering: each field is its own row — reconstruct layout
    let imageEl = null;
    const contentCol = document.createElement('div');
    contentCol.classList.add('split-banner-content');

    rows.forEach((row) => {
      const cell = row.firstElementChild;
      if (!cell) return;

      const pic = cell.querySelector('picture');
      // First picture-only cell becomes the banner image
      if (!imageEl && pic && cell.textContent.trim() === '') {
        imageEl = pic;
        return;
      }

      // Skip rows that are truly empty
      if (!cell.textContent.trim() && !cell.querySelector('picture')) return;

      [...cell.childNodes].forEach((node) => contentCol.appendChild(node.cloneNode(true)));
    });

    // Rebuild block as a single row with two columns
    block.innerHTML = '';
    const row = document.createElement('div');

    const imageCol = document.createElement('div');
    imageCol.classList.add('split-banner-image');
    if (imageEl) imageCol.appendChild(imageEl);

    row.appendChild(imageCol);
    row.appendChild(contentCol);
    block.appendChild(row);

    decorateCta(contentCol);
  }
}
