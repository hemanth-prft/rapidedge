const SORT = {
  FEATURED: 'featured',
  DATE_DESC: 'date-desc',
  ALPHA_ASC: 'alpha-asc',
  ALPHA_DESC: 'alpha-desc',
};

const BREAKPOINT_SM = 767;
let quickFactsInstanceCount = 0;

// Edge Delivery content-bus coordinates (must match fstab.yaml mountpoint:
// /bin/franklin.delivery/<owner>/<repo>/<branch>). The Git repo name (rapidedge)
// differs from the AEM content path segment (rapid-edge), so it is pinned here
// instead of being derived from window.location.
const AEM_OWNER = 'hemanthsreenu';
const AEM_REPO = 'rapidedge';
const PAGES_INDEX = 'rapid-edge-pages-index.json';

function getQueryIndexUrls() {
  const urls = [];
  const isAuthorHost = window.location.hostname.includes('adobeaemcloud.com');

  if (isAuthorHost) {
    // Universal Editor preview renders on the AEM author. The query index is
    // served by the Edge Delivery content-bus delivery servlet — the SAME
    // endpoint declared in fstab.yaml:
    //   /bin/franklin.delivery/<owner>/<repo>/<branch>/<index>.json
    // The branch is a PATH segment here (taken from the ?ref preview param,
    // defaulting to main) — NOT an AEM `.resource` selector.
    const branch = new URLSearchParams(window.location.search).get('ref') || 'main';
    urls.push(`/bin/franklin.delivery/${AEM_OWNER}/${AEM_REPO}/${branch}/${PAGES_INDEX}`);

    // Fallback: the stable, branch-agnostic paths.json-mapped resource route.
    const previewPathMatch = window.location.pathname.match(/^\/content\/([^/.]+)/);
    if (previewPathMatch) {
      urls.push(`/content/${previewPathMatch[1]}.resource/${PAGES_INDEX}`);
    }
  } else {
    // Edge (aem.page / aem.live) and published sites serve from the site root.
    urls.push(`/${PAGES_INDEX}`);
  }

  return [...new Set(urls)];
}

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

function getRowCells(row) {
  if (!(row instanceof HTMLElement)) {
    return [];
  }

  const directCells = [...row.children].filter((child) => child instanceof HTMLDivElement);
  if (directCells.length !== 1) {
    return directCells;
  }

  const nestedCells = [...directCells[0].children]
    .filter((child) => child instanceof HTMLDivElement);
  return nestedCells.length ? nestedCells : directCells;
}

function getCellText(row, index) {
  const cells = getRowCells(row);
  return cells[index] ? cells[index].textContent.trim() : '';
}

// Resolve the source cells that carry the Universal Editor instrumentation for
// each model field so the binding can be re-applied after the block is re-rendered.
function getFieldSources(block) {
  const rows = [...block.children].filter((child) => child instanceof HTMLDivElement);
  if (!rows.length) {
    return { titleEl: null, contentZoneEl: null };
  }

  const firstRowCells = getRowCells(rows[0]);
  if (firstRowCells.length >= 2) {
    return { titleEl: firstRowCells[0], contentZoneEl: firstRowCells[1] };
  }

  const secondRowCells = rows.length > 1 ? getRowCells(rows[1]) : [];
  return {
    titleEl: firstRowCells[0] || rows[0],
    contentZoneEl: secondRowCells[0] || rows[1] || null,
  };
}

// Snapshot the data-aue-*/data-richtext-* attributes so they can be copied onto
// the rendered elements on every render (render() wipes block.innerHTML, so a
// one-time moveInstrumentation would be lost after the first re-render).
function captureInstrumentation(element) {
  if (!(element instanceof HTMLElement)) {
    return [];
  }

  return [...element.attributes]
    .filter(({ nodeName }) => nodeName.startsWith('data-aue-') || nodeName.startsWith('data-richtext-'))
    .map(({ nodeName, value }) => ({ name: nodeName, value }));
}

function applyInstrumentation(element, attributes) {
  if (!(element instanceof HTMLElement) || !attributes) {
    return;
  }

  attributes.forEach(({ name, value }) => element.setAttribute(name, value));
}

async function fetchQuickFactsItems() {
  const queryIndexUrls = getQueryIndexUrls();
  const isAuthorHost = window.location.hostname.includes('adobeaemcloud.com');

  const titleFromPath = (pathValue) => {
    if (!pathValue) {
      return '';
    }

    const segment = pathValue.split('/').filter(Boolean).pop() || '';
    return segment
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const normalizeQueryIndexItems = (payload) => {
    const rows = payload?.data || payload?.items || payload?.results || payload?.pages || [];
    if (!Array.isArray(rows)) {
      return [];
    }

    return rows
      .map((row, index) => {
        const properties = row?.properties || row || {};
        const linkUrl = row?.path || properties.path || properties.url || '';
        const title = (
          properties.title
          || properties.name
          || row?.title
          || titleFromPath(linkUrl)
        ).trim();
        const description = (properties.description || properties.summary || '').trim();
        const date = properties.lastModified || properties.lastmod || properties.date || '';

        if (!title || !linkUrl) {
          return null;
        }

        return {
          featuredOrder: index,
          name: title,
          description,
          linkUrl,
          buttonText: 'Learn More',
          date,
          newWindow: false,
        };
      })
      .filter(Boolean);
  };

  try {
    const queryResponses = await Promise.all(
      queryIndexUrls.map(async (url) => {
        try {
          const queryResponse = await fetch(url, {
            credentials: 'same-origin',
            headers: {
              Accept: 'application/json',
            },
          });
          if (!queryResponse.ok) {
            return null;
          }

          const contentType = (queryResponse.headers.get('content-type') || '').toLowerCase();
          const responseText = await queryResponse.text();

          // Author endpoints may return HTML login/error pages with HTTP 200.
          if (contentType.includes('text/html') || responseText.trim().startsWith('<!DOCTYPE html')) {
            return null;
          }

          let queryPayload;
          try {
            queryPayload = JSON.parse(responseText);
          } catch (error) {
            return null;
          }

          const indexedItems = normalizeQueryIndexItems(queryPayload);
          if (!indexedItems.length) {
            return null;
          }

          return {
            title: queryPayload.title || '',
            items: indexedItems,
          };
        } catch (error) {
          return null;
        }
      }),
    );

    const firstUsableResponse = queryResponses.find(Boolean);
    if (firstUsableResponse) {
      return firstUsableResponse;
    }

    return {
      title: '',
      items: [],
      errorMessage: isAuthorHost
        ? 'Custom query index not reachable from author preview. Verify .resource endpoint auth and branch mapping.'
        : 'Custom query index endpoint returned no JSON data.',
    };
  } catch (e) {
    return {
      title: '',
      items: [],
      errorMessage: 'Custom query index request failed.',
    };
  }
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

function readBlockFields(block) {
  const rows = [...block.children].filter((child) => child instanceof HTMLDivElement);

  if (!rows.length) {
    return { title: '', contentZone: '' };
  }

  const firstRowCells = getRowCells(rows[0]);
  if (firstRowCells.length >= 2) {
    return {
      title: getCellText(rows[0], 0),
      contentZone: getCellText(rows[0], 1),
    };
  }

  return {
    title: getCellText(rows[0], 0),
    contentZone: rows.length > 1 ? getCellText(rows[1], 0) : '',
  };
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
    errorMessage,
    sortValue,
    openIndex,
    page,
    itemsPerPage,
    sortSelectId,
    instrumentation,
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
    applyInstrumentation(heading, instrumentation?.title);
    root.append(heading);
  }

  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'quick-facts-accordion-empty';
    empty.textContent = errorMessage || 'No quick facts available right now.';
    root.append(empty);
    block.append(root);
    return;
  }

  const controls = document.createElement('div');
  controls.className = 'quick-facts-accordion-controls';

  if (contentZone) {
    const intro = document.createElement('p');
    intro.className = 'quick-facts-accordion-intro';
    applyInstrumentation(intro, instrumentation?.contentZone);
    intro.textContent = contentZone;
    root.append(intro);
    controls.classList.add('has-intro');
  }

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

    pager.append(createPaginationButton('«', safePage - 1, safePage === 1));

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      const pageButton = createPaginationButton(String(pageNumber), pageNumber, false);
      if (pageNumber === safePage) {
        pageButton.classList.add('is-active');
        pageButton.setAttribute('aria-current', 'page');
      }
      pager.append(pageButton);
    }

    pager.append(createPaginationButton('»', safePage + 1, safePage === totalPages));
    root.append(pager);
  }

  block.append(root);
}

export default async function decorate(block) {
  const parsed = readBlockFields(block);
  const fieldSources = getFieldSources(block);
  const instrumentation = {
    title: captureInstrumentation(fieldSources.titleEl),
    contentZone: captureInstrumentation(fieldSources.contentZoneEl),
  };
  const apiData = await fetchQuickFactsItems();

  const state = {
    title: parsed.title || apiData.title,
    contentZone: parsed.contentZone,
    items: apiData.items,
    errorMessage: apiData.errorMessage || '',
    sortValue: SORT.FEATURED,
    openIndex: -1,
    page: 1,
    itemsPerPage: getItemsPerPage(),
    sortSelectId: getSortSelectId(block),
    instrumentation,
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
