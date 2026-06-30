const SORT = {
  FEATURED: 'featured',
  DATE_DESC: 'date-desc',
  ALPHA_ASC: 'alpha-asc',
  ALPHA_DESC: 'alpha-desc',
};

const BREAKPOINT_SM = 767;
let quickFactsInstanceCount = 0;

function parseDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function compareByAlpha(a, b) {
  return (a.name || '').localeCompare((b.name || ''), undefined, { sensitivity: 'base' });
}

function compareByDate(a, b) {
  const dateA = parseDate(a.date);
  const dateB = parseDate(b.date);

  if (!dateA && !dateB) {
    return 0;
  }

  if (!dateA) {
    return 1;
  }

  if (!dateB) {
    return -1;
  }

  return dateB.getTime() - dateA.getTime();
}

function getItemsPerPage() {
  return window.innerWidth <= BREAKPOINT_SM ? 5 : 10;
}

function getSortSelectId(block) {
  quickFactsInstanceCount += 1;
  const baseId = block.id ? block.id.replace(/[^a-zA-Z0-9_-]/g, '-') : `quick-facts-${quickFactsInstanceCount}`;
  return `${baseId}-sort`;
}

function getCellText(row, index) {
  return row.children[index] ? row.children[index].textContent.trim() : '';
}

function getCellHtml(row, index) {
  return row.children[index] ? row.children[index].innerHTML.trim() : '';
}

function getCellLink(row, index) {
  const link = row.children[index] ? row.children[index].querySelector('a') : null;
  return link;
}

function buildSortOptions(items) {
  const hasDate = items.some((item) => !!item.date);

  const options = [
    { value: SORT.FEATURED, label: 'Featured' },
    { value: SORT.ALPHA_ASC, label: 'A-Z' },
    { value: SORT.ALPHA_DESC, label: 'Z-A' },
  ];

  if (hasDate) {
    options.splice(1, 0, { value: SORT.DATE_DESC, label: 'Date' });
  }

  return options;
}

function readBlockRows(block) {
  const rows = [...block.children].filter((child) => child instanceof HTMLDivElement);

  if (!rows.length) {
    return { title: '', contentZone: '', items: [] };
  }

  const title = getCellText(rows[0], 0);
  let contentZone = getCellText(rows[0], 1);
  let itemRows = rows.slice(1);

  // Universal Editor may render block-level fields as stacked rows.
  // When that happens, the second row can be Content Zone metadata,
  // not a child item row.
  if (!contentZone && rows.length > 2) {
    const maybeContentZoneRow = rows[1];
    const hasLikelyItemStructure = maybeContentZoneRow.children.length >= 3
      || !!getCellLink(maybeContentZoneRow, 2)
      || !!getCellHtml(maybeContentZoneRow, 1)
      || !!getCellText(maybeContentZoneRow, 4)
      || !!getCellText(maybeContentZoneRow, 5);

    if (!hasLikelyItemStructure) {
      contentZone = getCellText(maybeContentZoneRow, 0) || getCellText(maybeContentZoneRow, 1);
      itemRows = rows.slice(2);
    }
  }

  const items = itemRows
    .map((row, index) => {
      const link = getCellLink(row, 2);
      const ctaText = getCellText(row, 3);
      const dateText = getCellText(row, 4);
      const newWindowFlag = getCellText(row, 5).toLowerCase();

      return {
        featuredOrder: index,
        name: getCellText(row, 0),
        description: getCellHtml(row, 1),
        linkUrl: link ? link.href : '',
        buttonText: ctaText || 'Learn More',
        date: dateText,
        newWindow: ['true', 'yes', 'y', '1'].includes(newWindowFlag),
      };
    })
    .filter((item) => {
      if (!(item.name || item.linkUrl || item.description)) {
        return false;
      }

      // Guard against metadata rows accidentally becoming accordion items.
      if (contentZone
        && item.name === contentZone
        && !item.linkUrl
        && !item.description
        && !item.date) {
        return false;
      }

      return true;
    });

  return { title, contentZone, items };
}

function getSortedItems(items, sortValue) {
  const copy = [...items];

  switch (sortValue) {
    case SORT.DATE_DESC:
      return copy.sort(compareByDate);
    case SORT.ALPHA_ASC:
      return copy.sort(compareByAlpha);
    case SORT.ALPHA_DESC:
      return copy.sort(compareByAlpha).reverse();
    default:
      return copy.sort((a, b) => a.featuredOrder - b.featuredOrder);
  }
}

function createPaginationButton(label, page, disabled) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'quick-facts-accordion-pager-button';
  button.textContent = label;
  button.dataset.page = String(page);

  if (disabled) {
    button.disabled = true;
  }

  return button;
}

function render(block, state) {
  const {
    title,
    contentZone,
    items,
    sortValue,
    openIndex,
    page,
    itemsPerPage,
    sortSelectId,
  } = state;

  const sortedItems = getSortedItems(items, sortValue);
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / itemsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * itemsPerPage;
  const pagedItems = sortedItems.slice(start, start + itemsPerPage);

  block.innerHTML = '';

  const root = document.createElement('section');
  root.className = 'quick-facts-accordion';
  if (contentZone) {
    root.dataset.contentZone = contentZone;
  }

  if (title) {
    const heading = document.createElement('h2');
    heading.className = 'quick-facts-accordion-title';
    heading.textContent = title;
    root.append(heading);
  }

  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'quick-facts-accordion-empty';
    empty.textContent = 'No quick facts authored yet. Add at least one item with a Name to display this component.';
    root.append(empty);
    block.append(root);
    return;
  }

  const controls = document.createElement('div');
  controls.className = 'quick-facts-accordion-controls';

  const label = document.createElement('label');
  label.className = 'quick-facts-accordion-sort-label';
  label.setAttribute('for', sortSelectId);
  label.textContent = 'Sort by:';

  const select = document.createElement('select');
  select.id = sortSelectId;
  select.className = 'quick-facts-accordion-sort-select';

  buildSortOptions(items).forEach((optionDef) => {
    const option = document.createElement('option');
    option.value = optionDef.value;
    option.textContent = optionDef.label;
    option.selected = sortValue === optionDef.value;
    select.append(option);
  });

  controls.append(label, select);
  root.append(controls);

  const list = document.createElement('div');
  list.className = 'quick-facts-accordion-list';

  pagedItems.forEach((item, visibleIndex) => {
    const globalIndex = start + visibleIndex;
    const itemEl = document.createElement('article');
    itemEl.className = 'quick-facts-accordion-item';

    if (openIndex === globalIndex) {
      itemEl.classList.add('is-open');
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quick-facts-accordion-trigger';
    button.setAttribute('aria-expanded', String(openIndex === globalIndex));
    button.id = `${sortSelectId}-trigger-${globalIndex}`;
    button.dataset.index = String(globalIndex);

    const name = document.createElement('span');
    name.className = 'quick-facts-accordion-name';
    name.textContent = item.name || 'Untitled';

    const icon = document.createElement('span');
    icon.className = 'quick-facts-accordion-icon';
    icon.setAttribute('aria-hidden', 'true');

    button.append(name, icon);

    const panel = document.createElement('div');
    panel.className = 'quick-facts-accordion-panel';
    panel.id = `${sortSelectId}-panel-${globalIndex}`;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', button.id);
    button.setAttribute('aria-controls', panel.id);

    if (openIndex !== globalIndex) {
      panel.hidden = true;
    }

    if (item.description) {
      const body = document.createElement('div');
      body.className = 'quick-facts-accordion-description';
      body.innerHTML = item.description;
      panel.append(body);
    }

    if (item.linkUrl) {
      const link = document.createElement('a');
      link.className = 'quick-facts-accordion-cta';
      link.href = item.linkUrl;
      link.textContent = item.buttonText;
      link.target = item.newWindow ? '_blank' : '_self';

      if (item.newWindow) {
        link.rel = 'noopener noreferrer';
      }

      panel.append(link);
    }

    itemEl.append(button, panel);
    list.append(itemEl);
  });

  root.append(list);

  if (totalPages > 1) {
    const pager = document.createElement('nav');
    pager.className = 'quick-facts-accordion-pager';
    pager.setAttribute('aria-label', 'Quick facts pagination');

    pager.append(createPaginationButton('Prev', safePage - 1, safePage === 1));

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      const pageButton = createPaginationButton(String(pageNumber), pageNumber, false);
      if (pageNumber === safePage) {
        pageButton.classList.add('is-active');
        pageButton.setAttribute('aria-current', 'page');
      }
      pager.append(pageButton);
    }

    pager.append(createPaginationButton('Next', safePage + 1, safePage === totalPages));
    root.append(pager);
  }

  block.append(root);
}

export default async function decorate(block) {
  const parsed = readBlockRows(block);

  const state = {
    title: parsed.title,
    contentZone: parsed.contentZone,
    items: parsed.items,
    sortValue: SORT.FEATURED,
    openIndex: -1,
    page: 1,
    itemsPerPage: getItemsPerPage(),
    sortSelectId: getSortSelectId(block),
  };

  render(block, state);

  block.addEventListener('change', (event) => {
    const { target } = event;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    if (target.classList.contains('quick-facts-accordion-sort-select')) {
      state.sortValue = target.value;
      state.page = 1;
      state.openIndex = -1;
      render(block, state);
    }
  });

  block.addEventListener('click', (event) => {
    const { target } = event;
    if (!(target instanceof Element)) {
      return;
    }

    const trigger = target.closest('.quick-facts-accordion-trigger');
    if (trigger instanceof HTMLElement) {
      const nextIndex = Number(trigger.dataset.index);
      state.openIndex = state.openIndex === nextIndex ? -1 : nextIndex;
      render(block, state);
      return;
    }

    const pageButton = target.closest('.quick-facts-accordion-pager-button');
    if (!(pageButton instanceof HTMLButtonElement) || pageButton.disabled) {
      return;
    }

    const requested = Number(pageButton.dataset.page);
    if (!Number.isNaN(requested)) {
      state.page = requested;
      state.openIndex = -1;
      render(block, state);
    }
  });

  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    if (resizeRaf) {
      cancelAnimationFrame(resizeRaf);
    }

    resizeRaf = requestAnimationFrame(() => {
      const nextItemsPerPage = getItemsPerPage();
      if (nextItemsPerPage !== state.itemsPerPage) {
        state.itemsPerPage = nextItemsPerPage;
        state.page = 1;
        state.openIndex = -1;
        render(block, state);
      }
    });
  });
}
