import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const row = block.children[0];
  if (!row) return;

  const cols = [...row.children];
  const imgEl = cols[0]?.querySelector('picture') || cols[0]?.querySelector('img');
  const width = cols[1]?.textContent?.trim() || '870px';
  const height = cols[2]?.textContent?.trim() || '330px';
  const borderRadius = cols[3]?.textContent?.trim() || '16px';

  const wrapper = document.createElement('div');
  wrapper.className = 'mercy-image-wrapper';
  moveInstrumentation(row, wrapper);

  if (imgEl) {
    const img = imgEl.tagName === 'IMG' ? imgEl : imgEl.querySelector('img');
    if (img) {
      img.style.width = width;
      img.style.height = height;
      img.style.borderRadius = borderRadius;
      img.style.objectFit = 'cover';
    }
    wrapper.append(imgEl);
  }

  block.textContent = '';
  block.append(wrapper);
}
