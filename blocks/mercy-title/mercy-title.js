import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const row = block.children[0];
  if (!row) return;

  const cols = [...row.children];
  const titleText = cols[0]?.textContent?.trim() || '';
  const tag = cols[1]?.textContent?.trim()?.toLowerCase() || 'h2';
  const style = cols[2]?.textContent?.trim() || 'large-teal';
  const alignment = cols[3]?.textContent?.trim() || 'left';

  const heading = document.createElement(tag.match(/^h[1-6]$/) ? tag : 'h2');
  heading.className = `mercy-title-heading mercy-title-${style}`;
  heading.textContent = titleText;
  moveInstrumentation(row, heading);

  if (alignment && alignment !== 'left') {
    heading.style.textAlign = alignment;
  }

  block.textContent = '';
  block.append(heading);
}