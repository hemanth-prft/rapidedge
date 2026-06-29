export default function decorate(block) {
  const rows = [...block.children];
  // row 0 = image + imageAlt (same row, two cells)
  // row 1 = title, row 2 = subtext, row 3 = button (richtext link)
  const picture = rows[0]?.querySelector('picture') || rows[0]?.querySelector('img');
  const title = rows[1]?.textContent?.trim() || '';
  const subtext = rows[2]?.textContent?.trim() || '';
  const buttonLink = rows[3]?.querySelector('a');
  const buttonLabel = buttonLink?.textContent?.trim() || '';
  const buttonUrl = buttonLink?.href || '';

  const imageWrap = document.createElement('div');
  imageWrap.className = 'mercy-hero-banner-covered-image';
  if (picture) imageWrap.appendChild(picture);

  const overlay = document.createElement('div');
  overlay.className = 'mercy-hero-banner-covered-overlay';

  const content = document.createElement('div');
  content.className = 'mercy-hero-banner-covered-content';

  const contentLeft = document.createElement('div');
  contentLeft.className = 'mercy-hero-banner-covered-left';

  if (title) {
    const heading = document.createElement('h1');
    heading.className = 'mercy-hero-banner-covered-title';
    heading.textContent = title;
    contentLeft.appendChild(heading);
  }

  if (subtext) {
    const subtextEl = document.createElement('p');
    subtextEl.className = 'mercy-hero-banner-covered-subtext';
    subtextEl.textContent = subtext;
    contentLeft.appendChild(subtextEl);
  }

  content.appendChild(contentLeft);

  if (buttonLabel && buttonUrl) {
    const contentRight = document.createElement('div');
    contentRight.className = 'mercy-hero-banner-covered-right';
    const button = document.createElement('a');
    button.className = 'mercy-hero-banner-covered-button';
    button.href = buttonUrl;
    button.textContent = buttonLabel;
    contentRight.appendChild(button);
    content.appendChild(contentRight);
  }

  block.textContent = '';
  block.append(imageWrap, overlay, content);
}
