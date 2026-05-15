import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Block-level class is the fallback card type; per-item 'variant' field overrides it
  const defaultCardType = block.classList.contains('small') ? 'small' : 'large';

  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    const cols = [...row.children];
    let variantDiv = null;
    let eyeBrow = null;
    let statistic = null;
    let subtext = null;

    if (cols.length >= 4) {
      // 4 columns (UE-authored): variant | eyeBrow | statistic | subtext
      [variantDiv, eyeBrow, statistic, subtext] = cols;
    } else if (cols.length === 3) {
      // 3 columns: eyeBrow | statistic | subtext
      [eyeBrow, statistic, subtext] = cols;
    } else if (cols.length === 2) {
      // 2 columns: statistic | subtext
      [statistic, subtext] = cols;
    } else {
      [statistic] = cols;
    }

    // Per-item card type: read variant column value, fall back to block-level class
    let cardType = defaultCardType;
    if (variantDiv) {
      const variantValue = variantDiv.textContent.trim().toLowerCase();
      if (variantValue === 'small' || variantValue === 'large') {
        cardType = variantValue;
      }
      // variant is metadata — remove it from visible DOM
      variantDiv.remove();
    }

    li.classList.add('quick-facts-item', `quick-facts-${cardType}`);

    if (eyeBrow) {
      eyeBrow.className = 'quick-facts-eye-brow';
      li.append(eyeBrow);
    }

    if (statistic) {
      statistic.className = 'quick-facts-statistic';
      li.append(statistic);
    }

    const hr = document.createElement('hr');
    hr.className = 'quick-facts-border';
    li.append(hr);

    if (subtext) {
      subtext.className = 'quick-facts-subtext';
      li.append(subtext);
    }

    ul.append(li);
  });

  block.replaceChildren(ul);
}
