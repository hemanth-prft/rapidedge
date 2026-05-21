export default function decorate(block) {
  const items = [...block.children];
  const nav = document.createElement('nav');
  nav.className = 'breadcrumb-nav';
  nav.setAttribute('aria-label', 'Breadcrumb');

  const ol = document.createElement('ol');

  items.forEach((row, i) => {
    const cols = [...row.children];
    const text = cols[0]?.textContent.trim() || '';
    const link = cols[1]?.textContent.trim() || '';

    const li = document.createElement('li');

    if (link) {
      const a = document.createElement('a');
      a.href = link;
      a.textContent = text;
      li.append(a);
    } else {
      li.textContent = text;
    }

    if (i < items.length - 1) {
      li.setAttribute('data-separator', '/');
    }

    ol.append(li);
  });

  nav.append(ol);
  block.textContent = '';
  block.append(nav);

  // Remove section margin so breadcrumb sits flush under header
  const section = block.closest('.section');
  if (section) {
    section.style.margin = '0';
  }
}
