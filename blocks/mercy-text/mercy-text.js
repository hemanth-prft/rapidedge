import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const row = block.children[0];
  if (!row) return;

  const content = row.children[0];
  if (!content) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'mercy-text-content';
  moveInstrumentation(content, wrapper);
  wrapper.innerHTML = content.innerHTML;

  block.textContent = '';
  block.append(wrapper);
}
