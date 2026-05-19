import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // Parse items from authored rows: col[0]=title, col[1]=link
  const items = rows.map((row) => {
    const cols = [...row.children];
    const title = cols[0]?.textContent?.trim() || '';
    const linkEl = cols[1]?.querySelector('a');
    const href = linkEl?.href || cols[1]?.textContent?.trim() || '#';
    return { title, href, row };
  });

  // Clear block
  block.textContent = '';

  // Search bar
  const searchWrapper = document.createElement('div');
  searchWrapper.className = 'hospital-search-search';
  const searchIcon = document.createElement('span');
  searchIcon.className = 'hospital-search-search-icon';
  searchIcon.setAttribute('aria-hidden', 'true');
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'hospital-search-search-input';
  searchInput.placeholder = 'Search for hospital';
  searchInput.setAttribute('aria-label', 'Search for hospital');
  searchWrapper.append(searchIcon, searchInput);

  // Pills container
  const pillsWrapper = document.createElement('div');
  pillsWrapper.className = 'hospital-search-pills';

  items.forEach((item) => {
    const pill = document.createElement('a');
    pill.className = 'hospital-search-pill';
    pill.href = item.href;
    pill.setAttribute('aria-label', item.title);
    moveInstrumentation(item.row, pill);

    const label = document.createElement('span');
    label.className = 'hospital-search-pill-label';
    label.textContent = item.title;

    const arrow = document.createElement('span');
    arrow.className = 'hospital-search-pill-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '\u2192';

    pill.append(label, arrow);
    pillsWrapper.append(pill);
  });

  // See All button
  const seeAll = document.createElement('button');
  seeAll.className = 'hospital-search-see-all';
  seeAll.type = 'button';
  seeAll.textContent = 'See All';

  pillsWrapper.append(seeAll);

  // Assemble
  block.append(searchWrapper, pillsWrapper);

  // Search filter
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const pills = pillsWrapper.querySelectorAll('.hospital-search-pill');
    pills.forEach((pill) => {
      const text = pill.querySelector('.hospital-search-pill-label').textContent.toLowerCase();
      pill.style.display = text.includes(query) ? '' : 'none';
    });
  });

  // See All toggle
  let expanded = false;
  const maxVisible = 10;
  const pills = pillsWrapper.querySelectorAll('.hospital-search-pill');

  function applyVisibility() {
    pills.forEach((pill, i) => {
      if (!expanded && i >= maxVisible) {
        pill.classList.add('hospital-search-hidden');
      } else {
        pill.classList.remove('hospital-search-hidden');
      }
    });
    seeAll.textContent = expanded ? 'Show Less' : 'See All';
    if (pills.length <= maxVisible) seeAll.style.display = 'none';
  }

  seeAll.addEventListener('click', () => {
    expanded = !expanded;
    applyVisibility();
  });

  applyVisibility();
}
