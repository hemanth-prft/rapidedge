import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];

  // UE model: each field occupies its own single-column row
  // Row 0: image asset (reference → picture element)
  // Row 1: description (caption)
  // Row 2: alt text
  // Row 3: contentZone
  // Document-based: image and optional fields as separate columns in one row
  const isUEModel = rows.length >= 1 && rows.every((r) => r.children.length <= 1);

  let imgCell = null;
  let altText = '';
  let description = '';
  let contentZone = '';

  if (isUEModel) {
    imgCell = rows[0]?.children[0] || null;
    description = rows[1]?.children[0]?.textContent.trim() || '';
    altText = rows[2]?.children[0]?.textContent.trim() || '';
    contentZone = rows[3]?.children[0]?.textContent.trim() || '';
  } else {
    const cols = rows[0] ? [...rows[0].children] : [];
    imgCell = cols[0] || null;
    description = cols[1]?.textContent.trim() || '';
    altText = cols[2]?.textContent.trim() || '';
    contentZone = cols[3]?.textContent.trim() || '';
  }

  const contentDiv = document.createElement('div');
  contentDiv.className = 'mercy-image-content';

  if (contentZone) {
    contentDiv.setAttribute('data-content-zone', contentZone);
  }

  const picture = imgCell?.querySelector('picture');
  const img = imgCell?.querySelector('img');

  if (picture) {
    picture.className = 'mercy-image-picture';
    const imgEl = picture.querySelector('img');
    if (imgEl) {
      imgEl.className = 'mercy-image-img';
      if (altText) imgEl.alt = altText;
    }
    moveInstrumentation(imgCell, picture);
    contentDiv.append(picture);
  } else if (img) {
    const newPicture = document.createElement('picture');
    newPicture.className = 'mercy-image-picture';
    img.className = 'mercy-image-img';
    if (altText) img.alt = altText;
    moveInstrumentation(imgCell, newPicture);
    newPicture.append(img);
    contentDiv.append(newPicture);
  }

  if (description) {
    const caption = document.createElement('small');
    caption.className = 'mercy-image-caption';
    caption.textContent = description;
    contentDiv.append(caption);
  }

  block.textContent = '';
  block.append(contentDiv);
}
