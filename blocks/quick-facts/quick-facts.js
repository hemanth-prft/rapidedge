/**
 * Quick Facts EDS Block
 *
 * Block table structure (authored in document):
 * | Quick Facts         |                    |
 * |---------------------|--------------------|
 * | Card Type           | small or large     |
 * | Eye Brow            | (optional text)    |
 * | Statistic           | 100+               |
 * | Subtext             | (optional text)    |
 * | Responsive Font Size| true / false       |
 */

function getRowValue(block, rowIndex) {
  const row = block.children[rowIndex];
  return row ? row.children[1]?.textContent.trim() : '';
}

function applyFitText(el, config) {
  function resize() {
    const width = el.parentElement?.offsetWidth || el.offsetWidth;
    let fontSize;
    if (width < 768) {
      fontSize = Math.min(Math.max(config.xs.minFontSize, width * 0.08), config.xs.maxFontSize);
    } else {
      fontSize = Math.min(Math.max(config.md.minFontSize, width * 0.05), config.md.maxFontSize);
    }
    el.style.fontSize = `${fontSize}px`;
  }

  resize();
  window.addEventListener('resize', resize);
}

export default function decorate(block) {
  const cardType = getRowValue(block, 0) || 'small';
  const eyeBrow = getRowValue(block, 1);
  const statistic = getRowValue(block, 2);
  const subtext = getRowValue(block, 3);
  const responsiveFontSize = getRowValue(block, 4) !== 'false';

  block.textContent = '';

  const container = document.createElement('div');
  container.className = `quick-facts__container quick-facts--${cardType}`;

  if (eyeBrow) {
    const eyeBrowEl = document.createElement('span');
    eyeBrowEl.className = 'quick-facts__eye-brow';
    eyeBrowEl.textContent = eyeBrow;
    container.append(eyeBrowEl);
  }

  const statisticEl = document.createElement('div');
  statisticEl.className = 'quick-facts__statistic';
  statisticEl.textContent = statistic;

  if (cardType === 'large' && responsiveFontSize) {
    applyFitText(statisticEl, {
      xs: { minFontSize: 16, maxFontSize: 38 },
      md: { minFontSize: 14, maxFontSize: 38 },
    });
  }

  container.append(statisticEl);

  const hr = document.createElement('hr');
  hr.className = 'quick-facts__border';
  container.append(hr);

  if (subtext) {
    const subtextEl = document.createElement('p');
    subtextEl.className = 'quick-facts__subtext';
    subtextEl.textContent = subtext;
    container.append(subtextEl);
  }

  block.append(container);
}
