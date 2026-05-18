import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Block-level class determines fallback cardType for document-based authoring
  const defaultCardType = block.classList.contains('small') ? 'small' : 'large';

  const ul = document.createElement('ul');
  ul.className = 'quick-facts-list';

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'quick-facts-item';
    moveInstrumentation(row, li);

    const cols = [...row.children];
    let cardTypeDiv = null;
    let eyeBrowDiv = null;
    let statisticDiv = null;
    let subtextDiv = null;

    // UE-authored (4 cols): cardType | eyeBrow | statistic | subtext
    // Document-based (3 cols): eyeBrow | statistic | subtext
    // Document-based (2 cols): statistic | subtext
    // Document-based (1 col):  statistic
    if (cols.length >= 4) {
      [cardTypeDiv, eyeBrowDiv, statisticDiv, subtextDiv] = cols;
    } else if (cols.length === 3) {
      [eyeBrowDiv, statisticDiv, subtextDiv] = cols;
    } else if (cols.length === 2) {
      [statisticDiv, subtextDiv] = cols;
    } else {
      [statisticDiv] = cols;
    }

    // Skip rows that have no statistic content (e.g. empty placeholder rows in UE)
    if (!statisticDiv || !statisticDiv.textContent.trim()) return;

    // Resolve cardType — reads the authored value, falls back to block-level class
    let cardType = defaultCardType;
    if (cardTypeDiv) {
      const val = cardTypeDiv.textContent.trim().toLowerCase();
      if (val === 'small' || val === 'large') cardType = val;
      cardTypeDiv.remove();
    }

    // Inner card container — holds all visual elements for this fact item
    const card = document.createElement('div');
    card.className = `quick-facts-card quick-facts-card-${cardType}`;

    // Eye brow — optional label rendered as a <span> above the statistic
    if (eyeBrowDiv) {
      const span = document.createElement('span');
      span.className = 'quick-facts-eye-brow';
      span.textContent = eyeBrowDiv.textContent.trim();
      card.append(span);
      eyeBrowDiv.remove();
    }

    // Statistic — the main highlighted value
    if (statisticDiv) {
      const div = document.createElement('div');
      // Large cards always use responsive font scaling (mirrors AEM v-fit-text default: on)
      div.className = cardType === 'large'
        ? 'quick-facts-statistic quick-facts-statistic-responsive'
        : 'quick-facts-statistic';
      div.textContent = statisticDiv.textContent.trim();
      card.append(div);
      statisticDiv.remove();
    }

    // Divider — always present between the statistic and subtext
    const hr = document.createElement('hr');
    hr.className = 'quick-facts-border';
    card.append(hr);

    // Subtext — optional description below the divider
    if (subtextDiv) {
      const p = document.createElement('p');
      p.className = 'quick-facts-subtext';
      p.textContent = subtextDiv.textContent.trim();
      card.append(p);
      subtextDiv.remove();
    }

    li.append(card);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
