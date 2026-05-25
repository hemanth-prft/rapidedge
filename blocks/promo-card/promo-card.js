import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];

  // UE model-based authoring: each field is its own single-column row
  // Row order: [0]=headerIcon, [1]=title, [2]=description,
  //            [3]=buttonUrl, [4]=buttonLabel, [5]=buttonIcon, [6]=image
  // imageAlt is stored directly on <img alt="..."> — no separate row
  const isUEModel = rows.length >= 2 && rows.every((r) => r.children.length <= 1);

  let headerIcon = '';
  let titleText = '';
  let descriptionText = '';
  let buttonUrl = '';
  let buttonLabel = '';
  let buttonIcon = '';
  let imageEl = null;

  if (isUEModel) {
    const getText = (row) => (row && row.children[0] ? row.children[0].textContent.trim() : '');
    const getPicture = (row) => row?.querySelector('picture');
    const getImg = (row) => row?.querySelector('img');

    headerIcon = getText(rows[0]);
    titleText = getText(rows[1]);
    descriptionText = getText(rows[2]);
    const urlAnchor = rows[3]?.querySelector('a');
    buttonUrl = urlAnchor?.getAttribute('href') || getText(rows[3]);
    buttonLabel = getText(rows[4]);
    buttonIcon = getText(rows[5]);
    imageEl = getPicture(rows[6]) || getImg(rows[6]);
  } else {
    // Document-based authoring: two columns — left: content, right: image
    const leftCol = rows[0]?.children[0];
    const rightCol = rows[0]?.children[1];
    const heading = leftCol?.querySelector('h1, h2, h3, h4');
    titleText = heading?.innerHTML || '';
    const paragraphs = [...(leftCol?.querySelectorAll('p') || [])];
    const linkEl = leftCol?.querySelector('a');
    buttonUrl = linkEl?.href || '';
    buttonLabel = linkEl?.textContent?.trim() || '';
    descriptionText = paragraphs
      .filter((p) => !p.querySelector('a'))
      .map((p) => p.innerHTML)
      .join(' ');
    imageEl = rightCol?.querySelector('picture') || rightCol?.querySelector('img');
  }

  // Build the new block structure
  const inner = document.createElement('div');
  inner.className = 'promo-card-inner';

  // --- Content column (left) ---
  const contentCol = document.createElement('div');
  contentCol.className = 'promo-card-content';

  // Title row: optional icon + title text
  if (titleText) {
    const titleRow = document.createElement('div');
    titleRow.className = 'promo-card-title-row';

    if (headerIcon) {
      const iconSpan = document.createElement('span');
      iconSpan.className = `icon icon-${headerIcon}`;
      const iconImg = document.createElement('img');
      iconImg.src = `/icons/${headerIcon}.svg`;
      iconImg.alt = '';
      iconImg.loading = 'lazy';
      iconSpan.append(iconImg);
      titleRow.append(iconSpan);
    }

    const h3 = document.createElement('h3');
    h3.className = 'promo-card-title';
    h3.innerHTML = titleText;
    titleRow.append(h3);
    contentCol.append(titleRow);
  }

  if (descriptionText) {
    const p = document.createElement('p');
    p.className = 'promo-card-description';
    p.innerHTML = descriptionText;
    contentCol.append(p);
  }

  if (buttonUrl && buttonLabel) {
    const btnWrapper = document.createElement('div');
    btnWrapper.className = 'promo-card-cta';
    const a = document.createElement('a');
    a.href = buttonUrl;
    a.className = 'promo-card-btn';
    const labelSpan = document.createElement('span');
    labelSpan.textContent = buttonLabel;
    a.append(labelSpan);
    if (buttonIcon) {
      const iconSpan = document.createElement('span');
      iconSpan.className = `icon icon-${buttonIcon}`;
      const iconImg = document.createElement('img');
      iconImg.src = `/icons/${buttonIcon}.svg`;
      iconImg.alt = '';
      iconImg.loading = 'lazy';
      iconSpan.append(iconImg);
      a.append(iconSpan);
    }
    btnWrapper.append(a);
    contentCol.append(btnWrapper);
  }

  // --- Image column (right) ---
  const imageCol = document.createElement('div');
  imageCol.className = 'promo-card-image';

  if (imageEl) {
    const imgTag = imageEl.tagName === 'IMG' ? imageEl : imageEl.querySelector('img');
    if (imgTag) {
      const optimizedPic = createOptimizedPicture(imgTag.src, imgTag.alt, false, [
        { media: '(min-width: 900px)', width: '260' },
        { width: '480' },
      ]);
      moveInstrumentation(imgTag, optimizedPic.querySelector('img'));
      imageCol.append(optimizedPic);
    } else {
      imageCol.append(imageEl.cloneNode(true));
    }
  }

  inner.append(contentCol, imageCol);
  block.replaceChildren(inner);
}
