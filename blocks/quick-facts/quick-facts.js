import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const defaultCardType = block.classList.contains('small') ? 'small' : 'large';
  const rows = [...block.children];
  const ul = document.createElement('ul');
  ul.className = 'quick-facts-list';

  // UE model-based authoring stores each field as its own single-column row:
  //   rows[0] = icon, rows[1] = eyeBrow, rows[2] = statistic, rows[3] = subtext
  // Document authoring stores each card as one row with multiple columns.
  // Detect UE mode: 2+ rows where every row has at most 1 column.
  const isUEModel = rows.length >= 2 && rows.every((r) => r.children.length <= 1);

  const buildCard = (cardType, iconSrc, eyeBrow, statistic, subtext) => {
    const card = document.createElement('div');
    card.className = `quick-facts-card quick-facts-card-${cardType}`;

    if (cardType === 'large' && (iconSrc || eyeBrow)) {
      // Header row: icon on left, eyeBrow text on right (matches reference design)
      const header = document.createElement('div');
      header.className = 'quick-facts-card-header';

      if (iconSrc) {
        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'quick-facts-icon';
        const img = document.createElement('img');
        img.src = iconSrc;
        img.alt = eyeBrow || '';
        img.loading = 'lazy';
        iconWrapper.append(img);
        header.append(iconWrapper);
      }

      if (eyeBrow) {
        const span = document.createElement('span');
        span.className = 'quick-facts-eye-brow';
        span.textContent = eyeBrow;
        header.append(span);
      }

      card.append(header);
    }

    // Large card: label text (subtext) sits above the statistic; no HR
    if (cardType === 'large' && subtext) {
      const p = document.createElement('p');
      p.className = 'quick-facts-subtext';
      p.textContent = subtext;
      card.append(p);
    }

    const statisticDiv = document.createElement('div');
    statisticDiv.className = cardType === 'large'
      ? 'quick-facts-statistic quick-facts-statistic-responsive'
      : 'quick-facts-statistic';
    statisticDiv.textContent = statistic;
    card.append(statisticDiv);

    // Small card: HR + subtext below the statistic
    if (cardType === 'small') {
      const hr = document.createElement('hr');
      hr.className = 'quick-facts-border';
      card.append(hr);

      if (subtext) {
        const p = document.createElement('p');
        p.className = 'quick-facts-subtext';
        p.textContent = subtext;
        card.append(p);
      }
    }

    return card;
  };

  if (isUEModel) {
    // All rows are fields of a single card: [icon, eyeBrow, statistic, subtext]
    const getText = (row) => (row && row.children[0] ? row.children[0].textContent.trim() : '');
    const getIconSrc = (row) => {
      if (!row || !row.children[0]) return '';
      const img = row.children[0].querySelector('img');
      if (img) return img.src;
      const a = row.children[0].querySelector('a');
      return a ? a.href : '';
    };
    // rows[0]=variant, rows[1]=icon, rows[2]=eyeBrow, rows[3]=statistic, rows[4]=subtext
    const variantVal = getText(rows[0]);
    const cardType = (variantVal === 'small' || variantVal === 'large') ? variantVal : defaultCardType;
    const li = document.createElement('li');
    li.className = 'quick-facts-item';
    li.append(buildCard(
      cardType,
      getIconSrc(rows[1]),
      getText(rows[2]),
      getText(rows[3]),
      getText(rows[4]),
    ));
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

      let iconDiv = null;
      let eyeBrowDiv = null;
      let statisticDiv = null;
      let subtextDiv = null;

      if (cols.length >= 4) {
        [iconDiv, eyeBrowDiv, statisticDiv, subtextDiv] = cols;
      } else if (cols.length === 3) {
        [eyeBrowDiv, statisticDiv, subtextDiv] = cols;
      } else if (cols.length === 2) {
        [statisticDiv, subtextDiv] = cols;
      } else {
        [statisticDiv] = cols;
      }

      let iconSrc = '';
      if (iconDiv) {
        const img = iconDiv.querySelector('img');
        iconSrc = img ? img.src : '';
      }

      li.append(buildCard(
        defaultCardType,
        iconSrc,
        eyeBrowDiv ? eyeBrowDiv.textContent.trim() : '',
        statisticDiv ? statisticDiv.textContent.trim() : '',
        subtextDiv ? subtextDiv.textContent.trim() : '',
      ));
      ul.append(li);
    });
  }

  block.replaceChildren(ul);

  // Section-level grid layout.
  // After all blocks in the section finish loading, JS groups them into CSS Grid
  // containers based on card type:
  //   .qf-grid.qf-grid-4col  — large cards (4 columns on desktop)
  //   .qf-grid.qf-grid-3col  — small cards (3 columns on desktop)
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

      // Split by card variant: large cards → 4-col, small cards → 3-col.
      const isSmall = (el) => !!el.querySelector('.quick-facts-card-small');
      const largeItems = items.filter((el) => !isSmall(el));
      const smallItems = items.filter((el) => isSmall(el));

      // Large cards: single 4-col grid — row separation is handled via
      // margin-bottom on grid items (increases row track height).
      if (largeItems.length > 0) {
        const grid4 = document.createElement('div');
        grid4.className = 'qf-grid qf-grid-4col';
        largeItems.forEach((el) => grid4.append(el));
        container.append(grid4);
      }

      // Small cards: single 3-col grid.
      if (smallItems.length > 0) {
        const grid3 = document.createElement('div');
        grid3.className = 'qf-grid qf-grid-3col';
        smallItems.forEach((el) => grid3.append(el));
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
