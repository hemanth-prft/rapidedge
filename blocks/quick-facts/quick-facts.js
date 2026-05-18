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
  //
  // IMPORTANT: We must set container flex styles inside applyLayout(), NOT
  // during block decoration. aem.js loadSection() calls
  //   section.dataset.sectionStatus = 'loaded'
  //   section.style.display = null          ← clears any display:flex we set early
  // The MutationObserver fires asynchronously AFTER display=null, so
  // applyLayout() runs after the clear and can safely re-apply display:flex.
  //
  // Structure:
  //   Published / preview → .section > .quick-facts-wrapper > .quick-facts
  //   UE authoring        → [section div] > .quick-facts  (no wrapper added)
  const inWrapper = block.parentElement?.classList.contains('quick-facts-wrapper');
  const container = inWrapper ? block.parentElement?.parentElement : block.parentElement;
  const flexItem = inWrapper ? block.parentElement : block;

  if (container && flexItem) {
    // Set initial width so blocks don't jump when the section becomes visible.
    flexItem.style.flex = '0 0 calc(50% - 8px)';
    flexItem.style.minWidth = '0';

    // applyLayout re-sets ALL container + item styles.
    // It is always called after sectionStatus='loaded' (post display=null),
    // so it reliably overrides the cleared inline display.
    const applyLayout = () => {
      container.style.display = 'flex';
      container.style.flexWrap = 'wrap';
      container.style.gap = '16px';
      container.style.alignItems = 'stretch';

      const els = inWrapper
        ? [...container.querySelectorAll(':scope > .quick-facts-wrapper')]
        : [...container.querySelectorAll(':scope > .quick-facts')];
      els.forEach((el, i) => {
        el.style.flex = i >= 4
          ? '0 0 calc((100% - 32px) / 3)'
          : '0 0 calc(50% - 8px)';
        el.style.minWidth = '0';
      });
    };

    // Register once per container; the first block to decorate owns the observer.
    if (!container.dataset.qfLayoutObserved) {
      container.dataset.qfLayoutObserved = '1';
      if (container.dataset.sectionStatus === 'loaded') {
        // Section already fully loaded (e.g. UE single-block re-decoration).
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
