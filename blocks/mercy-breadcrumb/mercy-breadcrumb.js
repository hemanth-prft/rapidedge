function getPagePath() {
  const { pathname } = window.location;
  // On AEM author the path is /content/<sitename>/... — strip that prefix
  const authorMatch = pathname.match(/^\/content\/[^/]+(\/.*?)(?:\.html)?$/);
  if (authorMatch) return authorMatch[1];
  return pathname.replace(/\.html$/, '');
}

function buildCrumbs(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [{ label: 'Home', url: '/', current: segments.length === 0 }];
  segments.forEach((segment, i) => {
    crumbs.push({
      label: segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      url: `/${segments.slice(0, i + 1).join('/')}`,
      current: i === segments.length - 1,
    });
  });
  return crumbs;
}

export default function decorate(block) {
  const crumbs = buildCrumbs(getPagePath());

  const nav = document.createElement('nav');
  nav.className = 'breadcrumb-nav';
  nav.setAttribute('aria-label', 'Breadcrumb');

  const ol = document.createElement('ol');

  crumbs.forEach((crumb, i) => {
    const li = document.createElement('li');

    if (crumb.current) {
      li.textContent = crumb.label;
      li.setAttribute('aria-current', 'page');
    } else {
      const a = document.createElement('a');
      a.href = crumb.url;
      a.textContent = crumb.label;
      li.append(a);
    }

    if (i < crumbs.length - 1) {
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
