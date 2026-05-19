import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const row = block.children[0];
  if (!row) return;

  const cols = [...row.children];
  const cell = cols[0];
  const width = cols[1]?.textContent?.trim() || '870px';
  const height = cols[2]?.textContent?.trim() || '330px';
  const borderRadius = cols[3]?.textContent?.trim() || '16px';

  const wrapper = document.createElement('div');
  wrapper.className = 'mercy-image-wrapper';
  moveInstrumentation(row, wrapper);

  const picture = cell?.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    if (img) {
      img.style.width = width;
      img.style.height = height;
      img.style.borderRadius = borderRadius;
      img.style.objectFit = 'cover';
    }
    wrapper.append(picture);
  } else {
    const img = cell?.querySelector('img');
    if (img) {
      img.style.width = width;
      img.style.height = height;
      img.style.borderRadius = borderRadius;
      img.style.objectFit = 'cover';
      wrapper.append(img);
    } else {
      const src = cell?.textContent?.trim();
      if (src) {
        const newImg = document.createElement('img');
        newImg.src = src;
        newImg.alt = '';
        newImg.style.width = width;
        newImg.style.height = height;
        newImg.style.borderRadius = borderRadius;
        newImg.style.objectFit = 'cover';
        wrapper.append(newImg);
      }
    }
  }

  block.textContent = '';
  block.append(wrapper);
}
