import { moveInstrumentation } from '../../scripts/scripts.js';
import { readBlockConfig } from '../../scripts/aem.js';

export default function decorate(block) {
  const config = readBlockConfig(block);

  const titleText = config.title || config['title-text'] || '';
  const tag = (config.tag || 'h2').toLowerCase();
  const style = config.style || 'large-teal';
  const alignment = config.alignment || 'left';

  const heading = document.createElement(tag.match(/^h[1-6]$/) ? tag : 'h2');
  heading.className = `mercy-title-heading mercy-title-${style}`;
  heading.textContent = titleText;

  const row = block.children[0];
  if (row) moveInstrumentation(row, heading);

  if (alignment && alignment !== 'left') {
    heading.style.textAlign = alignment;
  }

  block.textContent = '';
  block.append(heading);
}
