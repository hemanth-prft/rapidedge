import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];

  /* ── Detect block-level field rows (UE model authoring) ──────────────────
     UE renders block-level model fields (title, ctaLabel, ctaLink) as child
     rows BEFORE card item rows. Card item rows always contain a picture/img.
     Collect rows until we hit the first one with an image.           ────── */
  let cardStartIndex = rows.length;
  for (let i = 0; i < rows.length; i += 1) {
    if (rows[i].querySelector('picture, img')) {
      cardStartIndex = i;
      break;
    }
  }

  const fieldRows = rows.slice(0, cardStartIndex);
  const cardRows = rows.slice(cardStartIndex);

  /* Extract block-level fields: title (row 0), ctaLabel (row 1), ctaLink (row 2) */
  const getText = (row) => row?.querySelector('div')?.textContent?.trim() || '';
  const getHref = (row) => row?.querySelector('a')?.href || getText(row);

  const sectionTitle = getText(fieldRows[0]);
  const ctaLabel = getText(fieldRows[1]);
  const ctaLink = getHref(fieldRows[2]);

  /* Build optional section header (title + See All CTA) */
  const headerEl = document.createElement('div');
  headerEl.className = 'cards-header';
  if (sectionTitle) {
    const h2 = document.createElement('h2');
    h2.textContent = sectionTitle;
    headerEl.append(h2);
  }
  if (ctaLabel) {
    const a = document.createElement('a');
    a.href = ctaLink || '#';
    a.textContent = ctaLabel;
    a.className = 'button secondary';
    headerEl.append(a);
  }

  /* Build card list */
  const ul = document.createElement('ul');
  cardRows.forEach((row) => {
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
      } else if (div.textContent.trim()) {
        div.className = 'cards-card-body';
      } else {
        toRemove.push(div); /* remove empty field divs (e.g. unused description in specialty) */
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

  if (sectionTitle || ctaLabel) {
    block.replaceChildren(headerEl, ul);
  } else {
    block.replaceChildren(ul);
  }
}
