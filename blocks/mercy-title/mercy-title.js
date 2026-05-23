import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  let titleText;
  let tag;
  let style;
  let alignment;

  // UE model authoring: each field stored as its own single-cell row
  // Document authoring: all four fields in one row as separate columns
  const isUEMode = rows.length > 1 && rows.every((r) => r.children.length <= 1);

  if (isUEMode) {
    titleText = rows[0]?.children[0]?.textContent?.trim() || '';
    tag = rows[1]?.children[0]?.textContent?.trim()?.toLowerCase() || 'h2';
    style = rows[2]?.children[0]?.textContent?.trim() || 'large-teal';
    alignment = rows[3]?.children[0]?.textContent?.trim() || 'left';
  } else {
    const cols = [...rows[0].children];
    titleText = cols[0]?.textContent?.trim() || '';
    tag = cols[1]?.textContent?.trim()?.toLowerCase() || 'h2';
    style = cols[2]?.textContent?.trim() || 'large-teal';
    alignment = cols[3]?.textContent?.trim() || 'left';
  }

  const heading = document.createElement(tag.match(/^h[1-6]$/) ? tag : 'h2');
  heading.className = `mercy-title-heading mercy-title-${style}`;
  heading.textContent = titleText;
  moveInstrumentation(rows[0], heading);

  if (alignment && alignment !== 'left') {
    heading.style.textAlign = alignment;
  }

  block.textContent = '';
  block.append(heading);
}
