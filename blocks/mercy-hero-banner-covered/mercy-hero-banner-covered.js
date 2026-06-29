export default function decorate(block) {
  const rows = [...block.children];
  const picture = rows[0]?.querySelector('picture') || rows[0]?.querySelector('img');
  const title = rows[2]?.textContent?.trim() || '';
  const subtext = rows[3]?.textContent?.trim() || '';
  const buttonLink = rows[4]?.querySelector('a');
  const buttonLabel = buttonLink?.textContent?.trim() || rows[4]?.textContent?.trim() || '';
  const buttonUrl = buttonLink?.href || '';

  const imageWrap = document.createElement('div');
  imageWrap.className = 'mercy-hero-banner-covered-image';

  if (picture) {
    imageWrap.appendChild(picture);
  }

  const overlay = document.createElement('div');
  overlay.className = 'mercy-hero-banner-covered-overlay';

  const content = document.createElement('div');
  content.className = 'mercy-hero-banner-covered-content';

  if (title) {
    const heading = document.createElement('h1');
    heading.className = 'mercy-hero-banner-covered-title';
    heading.textContent = title;
    content.appendChild(heading);
  }

  if (subtext) {
    const subtextEl = document.createElement('p');
    subtextEl.className = 'mercy-hero-banner-covered-subtext';
    subtextEl.textContent = subtext;
    content.appendChild(subtextEl);
  }

  if (buttonLabel && buttonUrl) {
    const button = document.createElement('a');
    button.className = 'mercy-hero-banner-covered-button';
    button.href = buttonUrl;
    button.textContent = buttonLabel;
    content.appendChild(button);
  }

  block.textContent = '';
  block.append(imageWrap, overlay, content);
}
