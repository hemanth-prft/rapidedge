import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const { title, ctaLabel, ctaLink } = block.dataset;

  /* build optional section header (title + See All CTA) */
  const headerEl = document.createElement('div');
  headerEl.className = 'cards-header';
  if (title) {
    const h2 = document.createElement('h2');
    h2.textContent = title;
    headerEl.append(h2);
  }
  if (ctaLabel) {
    const a = document.createElement('a');
    a.href = ctaLink || '#';
    a.textContent = ctaLabel;
    a.className = 'button secondary';
    headerEl.append(a);
  }

  /* build card list */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    let linkHref = '';
    const toRemove = [];
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else if (div.querySelector('.button-container, a.button')) {
        /* link field: EDS decorateButtons() wraps aem-content links as .button-container */
        const anchor = div.querySelector('a');
        if (anchor) {
          linkHref = anchor.href;
          toRemove.push(div);
        }
      } else if (div.children.length === 1 && div.firstElementChild?.tagName === 'A') {
        /* link field: raw anchor fallback (un-decorated) */
        linkHref = div.firstElementChild.href;
        toRemove.push(div);
      } else {
        div.className = 'cards-card-body';
      }
    });
    toRemove.forEach((d) => d.remove());

    if (linkHref) {
      const a = document.createElement('a');
      a.href = linkHref;
      a.className = 'cards-card-link';
      while (li.firstChild) a.append(li.firstChild);
      li.append(a);
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  if (title || ctaLabel) {
    block.replaceChildren(headerEl, ul);
  } else {
    block.replaceChildren(ul);
  }
}
