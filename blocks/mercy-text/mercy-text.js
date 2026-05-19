import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const row = block.children[0];
  if (!row) return;

  const cols = [...row.children];
  const text = cols[0]?.innerHTML?.trim() || '';
  const fontSize = cols[1]?.textContent?.trim() || '12px';
  const fontWeight = cols[2]?.textContent?.trim() || '500';
  const stylesRaw = cols[3]?.textContent?.trim() || '100%, -5%, #9BABB1, left';

  const parts = stylesRaw.split(',').map((s) => s.trim());
  const lineHeight = parts[0] || '100%';
  const letterSpacing = parts[1] || '-5%';
  const color = parts[2] || '#9BABB1';
  const alignment = parts[3] || 'left';

  const wrapper = document.createElement('div');
  wrapper.className = 'mercy-text-content';
  wrapper.innerHTML = text;
  moveInstrumentation(row, wrapper);

  wrapper.style.fontSize = fontSize;
  wrapper.style.fontWeight = fontWeight;
  wrapper.style.lineHeight = lineHeight;
  wrapper.style.letterSpacing = letterSpacing;
  wrapper.style.color = color;
  wrapper.style.textAlign = alignment;

  block.textContent = '';
  block.append(wrapper);
}
