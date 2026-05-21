import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];

  // UE model-based authoring: each field is its own single-column row
  // Fields order: image, imageAlt, title, description, buttonUrl, buttonLabel
  const isUEModel = rows.length >= 2 && rows.every((r) => r.children.length <= 1);

  let imageAlt = '';
  let titleText = '';
  let descriptionText = '';
  let buttonUrl = '';
  let buttonLabel = '';
  let imageEl = null;

  if (isUEModel) {
    const getCell = (row) => row?.querySelector('div')?.innerHTML?.trim() || '';
    const getImg = (row) => row?.querySelector('img');
    const getPicture = (row) => row?.querySelector('picture');

    imageEl = getPicture(rows[0]) || getImg(rows[0]);
    imageAlt = getCell(rows[1]);
    titleText = getCell(rows[2]);
    descriptionText = getCell(rows[3]);
    buttonUrl = getCell(rows[4]);
    buttonLabel = getCell(rows[5]);
  } else {
    // Document-based authoring: two columns — left: image, right: content
    const leftCol = rows[0]?.children[0];
    const rightCol = rows[0]?.children[1];
    imageEl = leftCol?.querySelector('picture') || leftCol?.querySelector('img');
    const heading = rightCol?.querySelector('h1, h2, h3, h4');
    titleText = heading?.innerHTML || '';
    const paragraphs = [...(rightCol?.querySelectorAll('p') || [])];
    const linkEl = rightCol?.querySelector('a');
    buttonUrl = linkEl?.href || '';
    buttonLabel = linkEl?.textContent?.trim() || '';
    descriptionText = paragraphs
      .filter((p) => !p.querySelector('a'))
      .map((p) => p.innerHTML)
      .join(' ');
  }

  // Build the new block structure
  const inner = document.createElement('div');
  inner.className = 'split-banner-inner';

  // --- Image column ---
  const imageCol = document.createElement('div');
  imageCol.className = 'split-banner-image';

  if (imageEl) {
    const imgTag = imageEl.tagName === 'IMG' ? imageEl : imageEl.querySelector('img');
    if (imgTag) {
      const optimizedPic = createOptimizedPicture(imgTag.src, imageAlt || imgTag.alt, false, [
        { media: '(min-width: 900px)', width: '760' },
        { width: '480' },
      ]);
      moveInstrumentation(imgTag, optimizedPic.querySelector('img'));
      imageCol.append(optimizedPic);
    } else {
      imageCol.append(imageEl.cloneNode(true));
    }
  }

  // --- Content column ---
  const contentCol = document.createElement('div');
  contentCol.className = 'split-banner-content';

  if (titleText) {
    const h2 = document.createElement('h2');
    h2.className = 'split-banner-title';
    h2.innerHTML = titleText;
    contentCol.append(h2);
  }

  if (descriptionText) {
    const p = document.createElement('p');
    p.className = 'split-banner-description';
    p.innerHTML = descriptionText;
    contentCol.append(p);
  }

  if (buttonUrl && buttonLabel) {
    const btnWrapper = document.createElement('div');
    btnWrapper.className = 'split-banner-cta';
    const a = document.createElement('a');
    a.href = buttonUrl;
    a.className = 'split-banner-btn';
    a.textContent = buttonLabel;
    btnWrapper.append(a);
    contentCol.append(btnWrapper);
  }

  inner.append(imageCol, contentCol);
  block.replaceChildren(inner);
}
