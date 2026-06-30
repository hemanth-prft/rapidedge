export default function decorate(block) {
  const rows = [...block.children];
  // row 0 = image + imageAlt (same row, two cells)
  // row 1 = title, row 2 = subtext, row 3 = buttonLabel, row 4 = buttonUrl
  const picture = rows[0]?.querySelector('picture') || rows[0]?.querySelector('img');
  const title = rows[1]?.textContent?.trim() || '';
  const subtext = rows[2]?.textContent?.trim() || '';
  const buttonLabel = rows[3]?.textContent?.trim() || '';
  const buttonUrl = rows[4]?.textContent?.trim() || '';

  const imageWrap = document.createElement('div');
  imageWrap.className = 'mercy-hero-banner-covered-image';
  if (picture) imageWrap.appendChild(picture);

  const overlay = document.createElement('div');
  overlay.className = 'mercy-hero-banner-covered-overlay';

  // Content: column layout — title on top, bottom row with badge + button
  const content = document.createElement('div');
  content.className = 'mercy-hero-banner-covered-content';

  if (title) {
    const heading = document.createElement('h1');
    heading.className = 'mercy-hero-banner-covered-title';
    heading.textContent = title;
    content.appendChild(heading);
  }

  // Bottom row: badge on left, button on right, same horizontal line
  const bottomRow = document.createElement('div');
  bottomRow.className = 'mercy-hero-banner-covered-bottom';

  if (subtext) {
    const subtextEl = document.createElement('p');
    subtextEl.className = 'mercy-hero-banner-covered-subtext';
    subtextEl.textContent = subtext;
    bottomRow.appendChild(subtextEl);
  }

  if (buttonLabel && buttonUrl) {
    const button = document.createElement('a');
    button.className = 'mercy-hero-banner-covered-button';
    button.href = buttonUrl;
    button.textContent = buttonLabel;
    bottomRow.appendChild(button);
  }

  content.appendChild(bottomRow);
  block.textContent = '';
  block.append(imageWrap, overlay, content);
}
