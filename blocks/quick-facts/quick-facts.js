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

  // Section-level grid layout.
  // After all blocks in the section finish loading, JS groups them into two
  // CSS Grid containers:
  //   .qf-grid.qf-grid-2col  — first 4 blocks  (2 columns on desktop)
  //   .qf-grid.qf-grid-3col  — blocks 5+        (3 columns on desktop)
  //
  // Structure detection:
  //   Published / preview → .section > .quick-facts-wrapper > .quick-facts
  //   UE authoring        → [section div] > .quick-facts  (no wrapper)
  const inWrapper = block.parentElement?.classList.contains('quick-facts-wrapper');
  const container = inWrapper ? block.parentElement?.parentElement : block.parentElement;

  if (container) {
    const applyLayout = () => {
      // Remove any previously created grid wrappers (idempotent on UE re-decoration).
      container.querySelectorAll(':scope > .qf-grid').forEach((g) => {
        [...g.children].forEach((child) => container.insertBefore(child, g));
        g.remove();
      });

      const selector = inWrapper
        ? ':scope > .quick-facts-wrapper'
        : ':scope > .quick-facts';
      const items = [...container.querySelectorAll(selector)];
      if (items.length === 0) return;

      // First 4 blocks → 2-col grid
      const grid2 = document.createElement('div');
      grid2.className = 'qf-grid qf-grid-2col';
      items.slice(0, 4).forEach((el) => grid2.append(el));
      container.append(grid2);

      // Blocks 5+ → 3-col grid
      if (items.length > 4) {
        const grid3 = document.createElement('div');
        grid3.className = 'qf-grid qf-grid-3col';
        items.slice(4).forEach((el) => grid3.append(el));
        container.append(grid3);
      }
    };

    // Register once per container; the first block to decorate owns the observer.
    if (!container.dataset.qfLayoutObserved) {
      container.dataset.qfLayoutObserved = '1';
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
