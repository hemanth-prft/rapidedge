import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];

  // UE model-based authoring: each field is its own single-column row
  const isUEModel = rows.length >= 2 && rows.every((r) => r.children.length <= 1);

  let iconEl = null;
  let titleText = '';
  let descriptionText = '';
  let buttonUrl = '';
  let buttonLabel = '';
  let buttonIcon = '';

  if (isUEModel) {
    const getText = (row) => (row && row.children[0] ? row.children[0].textContent.trim() : '');

    iconEl = rows[0]?.querySelector('img') || rows[0]?.querySelector('picture');
    titleText = getText(rows[1]);
    descriptionText = getText(rows[2]);
    const urlAnchor = rows[3]?.querySelector('a');
    buttonUrl = urlAnchor?.getAttribute('href') || getText(rows[3]);
    buttonLabel = getText(rows[4]);
    buttonIcon = getText(rows[5]);
  } else {
    // Document-based authoring: single row with multiple columns
    const cells = [...(rows[0]?.children || [])];
    iconEl = cells[0]?.querySelector('img') || cells[0]?.querySelector('picture');
    titleText = cells[1]?.textContent?.trim() || '';
    descriptionText = cells[2]?.textContent?.trim() || '';
    const linkEl = cells[3]?.querySelector('a');
    buttonUrl = linkEl?.href || '';
    buttonLabel = linkEl?.textContent?.trim() || cells[4]?.textContent?.trim() || '';
    buttonIcon = cells[5]?.textContent?.trim() || '';
  }

  // Build content group: icon + text
  const content = document.createElement('div');
  content.classList.add('cta-callout-content');

  if (iconEl) {
    const iconWrapper = document.createElement('div');
    iconWrapper.classList.add('cta-callout-icon');
    iconWrapper.append(iconEl.cloneNode(true));
    content.append(iconWrapper);
  }

  const textGroup = document.createElement('div');
  textGroup.classList.add('cta-callout-text');

  const titleEl = document.createElement('span');
  titleEl.classList.add('cta-callout-title');
  titleEl.textContent = titleText;

  const descEl = document.createElement('span');
  descEl.classList.add('cta-callout-description');
  descEl.textContent = descriptionText;

  textGroup.append(titleEl, descEl);
  content.append(textGroup);

  // Build CTA button
  const btn = document.createElement('a');
  btn.classList.add('cta-callout-button');
  btn.href = buttonUrl || '#';

  const labelSpan = document.createElement('span');
  labelSpan.textContent = buttonLabel;
  btn.append(labelSpan);

  if (buttonIcon) {
    const iconSpan = document.createElement('span');
    iconSpan.className = `icon icon-${buttonIcon}`;
    const img = document.createElement('img');
    img.src = `/icons/${buttonIcon}.svg`;
    img.alt = '';
    img.loading = 'lazy';
    iconSpan.append(img);
    btn.append(iconSpan);
  }

  // Apply instrumentation for Universal Editor
  if (isUEModel) {
    moveInstrumentation(rows[1], titleEl);
    moveInstrumentation(rows[2], descEl);
  }

  block.textContent = '';
  block.append(content, btn);
}
