/**
 * @param {HTMLElement} statisticEl
 */
function applyFitText(statisticEl) {
  statisticEl.style.fontSize = 'clamp(14px, 4vw, 38px)';
  statisticEl.style.lineHeight = '1.2';
}

/**
 * Decorate a Quick Facts block.
 *
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const isLarge = block.classList.contains('large');
  const rows = [...block.querySelectorAll(':scope > div')];

  let cardType = isLarge ? 'large' : 'small';
  let eyeBrow = '';
  let statistic = '';
  let subtext = '';

  rows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    if (cells.length < 2) return;

    const label = cells[0].textContent.trim().toLowerCase();
    const value = cells[1].textContent.trim();

    if (label === 'card type') {
      cardType = value.toLowerCase() === 'large' ? 'large' : 'small';
    } else if (label === 'eye brow') {
      eyeBrow = value;
    } else if (label === 'statistic') {
      statistic = value;
    } else if (label === 'subtext') {
      subtext = value;
    }
  });

  if (!statistic) {
    block.innerHTML = '<p class="quick-facts-placeholder">Please enter the appropriate values.</p>';
    return;
  }

  const container = document.createElement('div');
  container.classList.add('quick-facts-container', `quick-facts-${cardType}`);

  if (eyeBrow) {
    const eyeBrowEl = document.createElement('span');
    eyeBrowEl.classList.add('quick-facts-eye-brow');
    eyeBrowEl.textContent = eyeBrow;
    container.appendChild(eyeBrowEl);
  }

  const statisticEl = document.createElement('div');
  statisticEl.classList.add('quick-facts-statistic', 'font-smooth');
  statisticEl.textContent = statistic;

  if (cardType === 'large') {
    applyFitText(statisticEl);
  }

  container.appendChild(statisticEl);

  const hr = document.createElement('hr');
  hr.classList.add('quick-facts-border');
  container.appendChild(hr);

  if (subtext) {
    const subtextEl = document.createElement('p');
    subtextEl.classList.add('quick-facts-subtext');
    subtextEl.textContent = subtext;
    container.appendChild(subtextEl);
  }

  block.innerHTML = '';
  block.appendChild(container);
}
