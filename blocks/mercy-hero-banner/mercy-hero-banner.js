export default function decorate(block) {
  const rows = [...block.children];
  // row 0 = image + imageAlt (combined into one row, two cells)
  // row 1 = title, row 2 = subtext, row 3 = buttonLabel, row 4 = buttonUrl
  const imageRow = rows[0];
  const imageAlt = rows[0]?.children[1]?.textContent?.trim() || '';
  const title = rows[1]?.textContent?.trim() || '';
  const subtext = rows[2]?.textContent?.trim() || '';
  const buttonLabel = rows[3]?.textContent?.trim() || '';
  const buttonUrl = rows[4]?.textContent?.trim() || '';

  const imageWrap = document.createElement('div');
  imageWrap.className = 'mercy-hero-banner-image';

  const picture = imageRow?.querySelector('picture') || imageRow?.querySelector('img');
  if (picture) {
    imageWrap.appendChild(picture);
  } else {
    const imgUrl = imageRow?.textContent?.trim() || '';
    if (imgUrl && (imgUrl.startsWith('http') || imgUrl.startsWith('/'))) {
      const img = document.createElement('img');
      img.src = imgUrl;
      img.alt = imageAlt || title;
      img.loading = 'eager';
      imageWrap.appendChild(img);
    }
  }

  const overlay = document.createElement('div');
  overlay.className = 'mercy-hero-banner-overlay';

  const content = document.createElement('div');
  content.className = 'mercy-hero-banner-content';

  if (title) {
    const heading = document.createElement('h1');
    heading.className = 'mercy-hero-banner-title';
    heading.textContent = title;
    content.appendChild(heading);
  }

  const bottomRow = document.createElement('div');
  bottomRow.className = 'mercy-hero-banner-bottom';

  if (subtext) {
    const subtextEl = document.createElement('p');
    subtextEl.className = 'mercy-hero-banner-subtext';
    subtextEl.textContent = subtext;
    bottomRow.appendChild(subtextEl);
  }

  if (buttonLabel && buttonUrl) {
    const button = document.createElement('a');
    button.className = 'mercy-hero-banner-button';
    button.href = buttonUrl;
    button.textContent = buttonLabel;
    bottomRow.appendChild(button);
  }

  content.appendChild(bottomRow);
  block.textContent = '';
  block.append(imageWrap, overlay, content);
}
