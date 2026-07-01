export default function decorate(block) {
  const rows = [...block.children];

  // UE model: each field is its own single-column row
  const isUEModel = rows.length >= 1 && rows.every((r) => r.children.length <= 1);

  let heading1 = '';
  let heading2 = '';
  let richtextEl = null;
  let imageSrc = '';
  let imageDisplay = '';
  let contentZone = '';

  if (isUEModel) {
    const getText = (row) => (row && row.children[0] ? row.children[0].textContent.trim() : '');

    heading1 = getText(rows[0]);
    heading2 = getText(rows[1]);
    richtextEl = rows[2]?.children[0] || null;
    const imgEl = rows[3]?.querySelector('img');
    imageSrc = imgEl?.src || '';
    imageDisplay = getText(rows[4]);
    contentZone = getText(rows[5]);
  } else {
    // Document-based authoring: rows map to fields
    heading1 = rows[0]?.children[0]?.textContent.trim() || '';
    heading2 = rows[1]?.children[0]?.textContent.trim() || '';
    richtextEl = rows[2]?.children[0] || null;
    const imgEl = rows[3]?.querySelector('img');
    imageSrc = imgEl?.src || '';
    imageDisplay = rows[4]?.children[0]?.textContent.trim() || '';
    contentZone = rows[5]?.children[0]?.textContent.trim() || '';
  }

  const hasImage = !!imageSrc;

  // Build outer wrapper
  const outer = document.createElement('div');
  outer.className = 'mercy-callout-outer';

  const container = document.createElement('div');
  container.className = `mercy-callout-container${hasImage ? '' : ' mercy-callout-container-no-image'}`;
  if (contentZone) {
    container.setAttribute('data-content-zone', contentZone);
  }

  const content = document.createElement('div');
  content.className = 'mercy-callout-content';

  // Image (optional)
  if (hasImage) {
    const imageDiv = document.createElement('div');
    const displayClass = imageDisplay === 'callout-contain' ? 'callout-contain' : 'callout-cover';
    imageDiv.className = `mercy-callout-image ${displayClass}`;
    imageDiv.style.backgroundImage = `url(${imageSrc})`;
    content.appendChild(imageDiv);
  }

  // Text container
  const textContainer = document.createElement('div');
  textContainer.className = 'mercy-callout-text-container';

  const textInner = document.createElement('div');
  textInner.className = 'mercy-callout-text';

  if (heading1) {
    const h1El = document.createElement('div');
    h1El.className = 'mercy-callout-header-text';
    h1El.textContent = heading1;
    textInner.appendChild(h1El);
  }

  if (heading2) {
    const h2El = document.createElement('div');
    h2El.className = 'mercy-callout-sub-header-text';
    h2El.textContent = heading2;
    textInner.appendChild(h2El);
  }

  if (richtextEl) {
    const richDiv = document.createElement('div');
    richDiv.className = 'mercy-callout-rich-text';
    richDiv.innerHTML = richtextEl.innerHTML;
    textInner.appendChild(richDiv);
  }

  textContainer.appendChild(textInner);
  content.appendChild(textContainer);
  container.appendChild(content);
  outer.appendChild(container);

  block.textContent = '';
  block.appendChild(outer);
}
