export default function decorate(block) {
  const [imageCol, contentCol] = block.firstElementChild.children;

  if (imageCol) imageCol.classList.add('split-banner-image');
  if (contentCol) contentCol.classList.add('split-banner-content');

  // Wrap any standalone links as styled buttons and inject icon
  contentCol?.querySelectorAll('p > a:only-child').forEach((link) => {
    const ctaP = link.closest('p');
    ctaP.classList.add('split-banner-cta');

    // Look for a following <p> that only contains a picture (icon)
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
