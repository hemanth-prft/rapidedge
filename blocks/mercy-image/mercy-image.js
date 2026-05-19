import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const row = block.children[0];
  if (!row) return;

  const cols = [...row.children];
  const picture = cols[0]?.querySelector('picture');
  if (!picture) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'mercy-image-wrapper';
  moveInstrumentation(cols[0], wrapper);

  const img = picture.querySelector('img');
  if (img) {
    img.classList.add('mercy-image-img');
  }

  wrapper.append(picture);
  block.textContent = '';
  block.append(wrapper);
}
