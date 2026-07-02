import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];

  // UE model: each field occupies its own single-column row
  // Row 0: text (richtext HTML)
  // Row 1: color (background color CSS classes)
  // Document-based: text and color as separate columns in the first row
  const isUEModel = rows.length >= 1 && rows.every((r) => r.children.length <= 1);

  let textEl = null;
  let colorClass = '';

  if (isUEModel) {
    textEl = rows[0]?.children[0] || null;
    colorClass = rows[1]?.children[0]?.textContent.trim() || '';
  } else {
    const cols = rows[0] ? [...rows[0].children] : [];
    textEl = cols[0] || null;
    colorClass = cols[1]?.textContent.trim() || '';
  }

  const contentDiv = document.createElement('div');
  contentDiv.className = 'mcy-rich-text__content';

  if (colorClass) {
    colorClass.split(' ').forEach((cls) => {
      if (cls) contentDiv.classList.add(cls);
    });
  }

  if (textEl) {
    contentDiv.innerHTML = textEl.innerHTML;
    moveInstrumentation(textEl, contentDiv);
  }

  block.textContent = '';
  block.append(contentDiv);
}
