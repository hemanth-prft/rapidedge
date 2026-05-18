import { moveInstrumentation } from '../../scripts/scripts.js';

const ITEMS_PER_PAGE = 10;

function sortItems(items, order) {
  return [...items].sort((a, b) => {
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();
    if (order === 'az') return titleA.localeCompare(titleB);
    return titleB.localeCompare(titleA);
  });
}

function renderPagination(container, totalItems, currentPage, onPageChange) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  if (totalPages <= 1) return;

  const paginationEl = document.createElement('div');
  paginationEl.className = 'quick-facts-pagination';

  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'pagination-btn pagination-prev';
  prevBtn.textContent = '\u00AB';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener('click', () => onPageChange(currentPage - 1));
  paginationEl.append(prevBtn);

  // Page numbers
  for (let i = 1; i <= totalPages; i += 1) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `pagination-btn pagination-page${i === currentPage ? ' active' : ''}`;
    pageBtn.textContent = i;
    pageBtn.addEventListener('click', () => onPageChange(i));
    paginationEl.append(pageBtn);
  }

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'pagination-btn pagination-next';
  nextBtn.textContent = '\u00BB';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener('click', () => onPageChange(currentPage + 1));
  paginationEl.append(nextBtn);

  container.append(paginationEl);
}

function renderItems(block, items, page, listContainer) {
  listContainer.innerHTML = '';
  const start = (page - 1) * ITEMS_PER_PAGE;
  const pageItems = items.slice(start, start + ITEMS_PER_PAGE);

  pageItems.forEach((item) => {
    const accordionItem = document.createElement('div');
    accordionItem.className = 'quick-facts-item';

    const trigger = document.createElement('button');
    trigger.className = 'quick-facts-trigger';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('type', 'button');

    const titleSpan = document.createElement('span');
    titleSpan.className = 'quick-facts-trigger-title';
    titleSpan.textContent = item.title;

    const icon = document.createElement('span');
    icon.className = 'quick-facts-trigger-icon';

    trigger.append(titleSpan, icon);

    const panel = document.createElement('div');
    panel.className = 'quick-facts-panel';
    panel.setAttribute('hidden', '');

    // Close button inside panel
    const closeBtn = document.createElement('button');
    closeBtn.className = 'quick-facts-close';
    closeBtn.setAttribute('type', 'button');
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '\u00D7';

    // Panel content
    const panelContent = document.createElement('div');
    panelContent.className = 'quick-facts-panel-content';
    if (item.content) {
      panelContent.innerHTML = item.content;
    }

    // Learn More link
    if (item.link) {
      const learnMore = document.createElement('a');
      learnMore.className = 'quick-facts-learn-more';
      learnMore.href = item.link;
      learnMore.textContent = 'Learn More';
      const arrow = document.createElement('span');
      arrow.className = 'quick-facts-arrow';
      arrow.textContent = ' \u203A';
      learnMore.append(arrow);
      panelContent.append(learnMore);
    }

    panel.append(closeBtn, panelContent);

    // Toggle behavior - only one open at a time
    const toggleItem = (open) => {
      if (open) {
        // Close all other items
        listContainer.querySelectorAll('.quick-facts-item').forEach((otherItem) => {
          const otherTrigger = otherItem.querySelector('.quick-facts-trigger');
          const otherPanel = otherItem.querySelector('.quick-facts-panel');
          if (otherTrigger && otherPanel && otherItem !== accordionItem) {
            otherTrigger.setAttribute('aria-expanded', 'false');
            otherPanel.setAttribute('hidden', '');
          }
        });
        trigger.setAttribute('aria-expanded', 'true');
        panel.removeAttribute('hidden');
      } else {
        trigger.setAttribute('aria-expanded', 'false');
        panel.setAttribute('hidden', '');
      }
    };

    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      toggleItem(!expanded);
    });

    closeBtn.addEventListener('click', () => {
      toggleItem(false);
    });

    accordionItem.append(trigger, panel);
    listContainer.append(accordionItem);
  });
}

export default function decorate(block) {
  const rows = [...block.children];

  // First row: block heading
  const headingRow = rows[0];
  const heading = headingRow ? headingRow.textContent.trim() : '';

  // Remaining rows: accordion items (title | link | content)
  const items = rows.slice(1).map((row) => {
    const cols = [...row.children];
    return {
      title: cols[0] ? cols[0].textContent.trim() : '',
      link: cols[1] ? cols[1].textContent.trim() : '',
      content: cols[2] ? cols[2].innerHTML : '',
    };
  });

  block.innerHTML = '';

  // Heading
  const headingEl = document.createElement('h2');
  headingEl.className = 'quick-facts-heading';
  headingEl.textContent = heading;

  // Sort dropdown
  const sortWrapper = document.createElement('div');
  sortWrapper.className = 'quick-facts-sort';

  const sortLabel = document.createElement('span');
  sortLabel.className = 'quick-facts-sort-label';
  sortLabel.textContent = 'Sort by:';

  const sortSelect = document.createElement('select');
  sortSelect.className = 'quick-facts-sort-select';
  const optAZ = document.createElement('option');
  optAZ.value = 'az';
  optAZ.textContent = 'A-Z';
  const optZA = document.createElement('option');
  optZA.value = 'za';
  optZA.textContent = 'Z-A';
  sortSelect.append(optAZ, optZA);

  sortWrapper.append(sortLabel, sortSelect);

  // List container
  const listContainer = document.createElement('div');
  listContainer.className = 'quick-facts-list';

  // Pagination container
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'quick-facts-pagination-wrapper';

  let currentPage = 1;
  let sortedItems = sortItems(items, 'az');

  const render = () => {
    paginationContainer.innerHTML = '';
    renderItems(block, sortedItems, currentPage, listContainer);
    renderPagination(paginationContainer, sortedItems.length, currentPage, (page) => {
      currentPage = page;
      render();
    });
  };

  sortSelect.addEventListener('change', () => {
    sortedItems = sortItems(items, sortSelect.value);
    currentPage = 1;
    render();
  });

  block.append(headingEl, sortWrapper, listContainer, paginationContainer);
  render();
}
