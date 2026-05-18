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

  // Section-level 2-col / 3-col layout.
  // Blocks 1–4 in a section sit 2-per-row; block 5 onwards sit 3-per-row.
  // The layout is applied once the section finishes loading all its blocks.
  const section = block.closest('.section');
  if (section) {
    const updateLayout = () => {
      // In UE authoring the block is a direct child of .section (no wrapper).
      // In preview/published EDS wraps each block in .quick-facts-wrapper first.
      // Detect which structure is present and target the right flex item.
      const wrappers = [...section.querySelectorAll(':scope > .quick-facts-wrapper')];
      const items = wrappers.length > 0
        ? wrappers
        : [...section.querySelectorAll(':scope > .quick-facts')];
      items.forEach((item, i) => {
        item.classList.toggle('quick-facts-col-3', i >= 4);
      });
    };
    if (section.dataset.sectionStatus === 'loaded') {
      // UE authoring: section is already loaded, update immediately.
      updateLayout();
    } else if (!section.dataset.qfLayoutObserved) {
      // Initial page load: register once per section and wait for all blocks.
      section.dataset.qfLayoutObserved = 'true';
      const observer = new MutationObserver(() => {
        if (section.dataset.sectionStatus === 'loaded') {
          observer.disconnect();
          updateLayout();
        }
      });
      observer.observe(section, { attributes: true, attributeFilter: ['data-section-status'] });
    }
  }
}
