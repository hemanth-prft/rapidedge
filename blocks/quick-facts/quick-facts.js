import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const defaultCardType = block.classList.contains('small') ? 'small' : 'large';
  const rows = [...block.children];
  const ul = document.createElement('ul');
  ul.className = 'quick-facts-list';

  // UE model-based authoring stores each field as its own single-column row:
  //   rows[0] = variant, rows[1] = eyeBrow, rows[2] = statistic, rows[3] = subtext
  // Document authoring stores each card as one row with multiple columns.
  // Detect UE mode: 2+ rows where every row has at most 1 column.
  const isUEModel = rows.length >= 2 && rows.every((r) => r.children.length <= 1);

  const buildCard = (cardType, eyeBrow, statistic, subtext) => {
    const card = document.createElement('div');
    card.className = `quick-facts-card quick-facts-card-${cardType}`;

    if (eyeBrow) {
      const span = document.createElement('span');
      span.className = 'quick-facts-eye-brow';
      span.textContent = eyeBrow;
      card.append(span);
    }

    const statisticDiv = document.createElement('div');
    statisticDiv.className = cardType === 'large'
      ? 'quick-facts-statistic quick-facts-statistic-responsive'
      : 'quick-facts-statistic';
    statisticDiv.textContent = statistic;
    card.append(statisticDiv);

    const hr = document.createElement('hr');
    hr.className = 'quick-facts-border';
    card.append(hr);

    if (subtext) {
      const p = document.createElement('p');
      p.className = 'quick-facts-subtext';
      p.textContent = subtext;
      card.append(p);
    }

    return card;
  };

  if (isUEModel) {
    // All rows are fields of a single card: [variant, eyeBrow, statistic, subtext]
    const getText = (row) => (row && row.children[0] ? row.children[0].textContent.trim() : '');
    const variantVal = getText(rows[0]);
    const cardType = (variantVal === 'small' || variantVal === 'large') ? variantVal : defaultCardType;
    const li = document.createElement('li');
    li.className = 'quick-facts-item';
    li.append(buildCard(cardType, getText(rows[1]), getText(rows[2]), getText(rows[3])));
    ul.append(li);
  } else {
    // Document authoring: each row is one card with 1–4 columns
    // cols: [variant, eyeBrow, statistic, subtext] | [eyeBrow, statistic, subtext] | etc.
    rows.forEach((row) => {
      const cols = [...row.children];
      if (cols.length === 0) return;

      const li = document.createElement('li');
      li.className = 'quick-facts-item';
      moveInstrumentation(row, li);

      let cardTypeDiv = null;
      let eyeBrowDiv = null;
      let statisticDiv = null;
      let subtextDiv = null;

      if (cols.length >= 4) {
        [cardTypeDiv, eyeBrowDiv, statisticDiv, subtextDiv] = cols;
      } else if (cols.length === 3) {
        [eyeBrowDiv, statisticDiv, subtextDiv] = cols;
      } else if (cols.length === 2) {
        [statisticDiv, subtextDiv] = cols;
      } else {
        [statisticDiv] = cols;
      }

      let cardType = defaultCardType;
      if (cardTypeDiv) {
        const val = cardTypeDiv.textContent.trim().toLowerCase();
        if (val === 'small' || val === 'large') cardType = val;
      }

      li.append(buildCard(
        cardType,
        eyeBrowDiv ? eyeBrowDiv.textContent.trim() : '',
        statisticDiv ? statisticDiv.textContent.trim() : '',
        subtextDiv ? subtextDiv.textContent.trim() : '',
      ));
      ul.append(li);
    });
  }

  block.replaceChildren(ul);

  // Section-level 2-col / 3-col layout applied via inline styles.
  // Using inline styles (not CSS classes) because in UE authoring AEM may
  // pre-set data-section-status which skips JS class decoration, making
  // CSS class selectors unreliable. Inline styles work in every environment.
  //
  // Structure detection:
  //   UE authoring  → block is direct child of the section-like container
  //   Preview/published → block is inside .quick-facts-wrapper inside section
  const inWrapper = block.parentElement?.classList.contains('quick-facts-wrapper');
  const container = inWrapper ? block.parentElement?.parentElement : block.parentElement;
  const flexItem = inWrapper ? block.parentElement : block;

  if (container && flexItem) {
    // Make the section-level container a flex row (applied once per container).
    if (!container.dataset.qfFlex) {
      container.dataset.qfFlex = '1';
      container.style.display = 'flex';
      container.style.flexWrap = 'wrap';
      container.style.gap = '16px';
      container.style.alignItems = 'stretch';
    }

    // Default: 2 per row.
    flexItem.style.flex = '0 0 calc(50% - 8px)';
    flexItem.style.minWidth = '0';

    // After all blocks in the container load, upgrade blocks 5+ to 3-per-row.
    if (!container.dataset.qfLayoutObserved) {
      container.dataset.qfLayoutObserved = '1';
      const applyLayout = () => {
        const els = inWrapper
          ? [...container.querySelectorAll(':scope > .quick-facts-wrapper')]
          : [...container.querySelectorAll(':scope > .quick-facts')];
        els.forEach((el, i) => {
          el.style.flex = i >= 4
            ? '0 0 calc((100% - 32px) / 3)'
            : '0 0 calc(50% - 8px)';
        });
      };
      if (container.dataset.sectionStatus === 'loaded') {
        applyLayout();
      } else {
        const observer = new MutationObserver(() => {
          if (container.dataset.sectionStatus === 'loaded') {
            observer.disconnect();
            applyLayout();
          }
        });
        observer.observe(container, { attributes: true, attributeFilter: ['data-section-status'] });
      }
    }
  }
}
