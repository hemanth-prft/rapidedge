export default function decorate(block) {
  const rows = [...block.children];
  // row 0 = image, row 1 = imageAlt, row 2 = title, row 3 = subtext,
  // row 4 = buttonLabel, row 5 = buttonUrl
  const imageRow = rows[0];
  const imageAlt = rows[1]?.textContent?.trim() || '';
  const title = rows[2]?.textContent?.trim() || '';
  const subtext = rows[3]?.textContent?.trim() || '';
  const buttonLabel = rows[4]?.textContent?.trim() || '';
  const buttonUrl = rows[5]?.textContent?.trim() || '';

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
