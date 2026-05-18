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

  const prevBtn = document.createElement('button');
  prevBtn.className = 'pagination-btn pagination-prev';
  prevBtn.textContent = '\u00AB';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener('click', () => onPageChange(currentPage - 1));
  paginationEl.append(prevBtn);

  for (let i = 1; i <= totalPages; i += 1) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `pagination-btn pagination-page${i === currentPage ? ' active' : ''}`;
    pageBtn.textContent = i;
    pageBtn.addEventListener('click', () => onPageChange(i));
    paginationEl.append(pageBtn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'pagination-btn pagination-next';
  nextBtn.textContent = '\u00BB';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener('click', () => onPageChange(currentPage + 1));
  paginationEl.append(nextBtn);

  container.append(paginationEl);
}

function createAccordionItem(item, listContainer) {
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

  const panelContent = document.createElement('div');
  panelContent.className = 'quick-facts-panel-content';
  if (item.content) {
    panelContent.innerHTML = item.content;
  }

  if (item.link) {
    const learnMore = document.createElement('a');
    learnMore.className = 'quick-facts-learn-more';
    learnMore.href = item.link;
    learnMore.innerHTML = 'Learn More <span class="quick-facts-arrow">&rsaquo;</span>';
    panelContent.append(learnMore);
  }

  panel.append(panelContent);

  const toggleItem = (open) => {
    if (open) {
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

  accordionItem.append(trigger, panel);
  return accordionItem;
}

export default function decorate(block) {
  const rows = [...block.children];
  const listContainer = document.createElement('div');
  listContainer.className = 'quick-facts-list';

  // Parse items from rows and build accordion elements
  const items = [];
  rows.forEach((row) => {
    const cols = [...row.children];
    const item = {
      title: cols[0] ? cols[0].textContent.trim() : '',
      link: cols[1] ? cols[1].textContent.trim() : '',
      content: cols[2] ? cols[2].innerHTML : '',
    };

    const accordionItem = createAccordionItem(item, listContainer);
    moveInstrumentation(row, accordionItem);
    item.el = accordionItem;
    items.push(item);
    row.replaceWith(accordionItem);
  });

  // Move all accordion items into the list container
  items.forEach((item) => listContainer.append(item.el));

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

  // Pagination container
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'quick-facts-pagination-wrapper';

  let currentPage = 1;
  let sortedItems = sortItems(items, 'az');

  const render = () => {
    // Reorder DOM
    sortedItems.forEach((item) => listContainer.append(item.el));

    // Show/hide based on page
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    sortedItems.forEach((item, i) => {
      item.el.style.display = (i >= start && i < end) ? '' : 'none';
    });

    // Render pagination
    paginationContainer.innerHTML = '';
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

  block.innerHTML = '';
  block.append(sortWrapper, listContainer, paginationContainer);
  render();
}
