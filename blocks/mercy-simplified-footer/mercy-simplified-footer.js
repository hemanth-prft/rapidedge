export default function decorate(block) {
  const currentYear = new Date().getFullYear();
  const rows = [...block.children];

  // ── Helper: safe text extraction ────────────────────────────────────
  const getText = (el) => el?.textContent?.trim() ?? '';

  // ── Row 0: parent model fields (address + logo) ──────────────────────
  const cells = rows[0] ? [...rows[0].children] : [];
  const community = getText(cells[0]) || 'St. Louis';
  const streetAddress = getText(cells[1]) || '615 South New Ballas Road';
  const city = getText(cells[2]) || 'Saint Louis';
  const state = getText(cells[3]) || 'Missouri';
  const zip = getText(cells[4]) || '63141';
  const logoLinkURL = getText(cells[7]) || '/';
  const logoTitle = getText(cells[8]) || 'Mercy Home';

  // Logo: use authored reference image if present, else default reversed logo
  const logoImg = cells[6]?.querySelector('picture, img');
  let logoMarkup = '<img src="/blocks/footer/reversedLogo.png" alt="Mercy" />';
  if (logoImg) {
    logoMarkup = logoImg.tagName === 'PICTURE'
      ? logoImg.outerHTML
      : `<img src="${logoImg.src}" alt="${logoImg.alt || 'Mercy'}" />`;
  }

  // ── Rows 1+: footer link child items ─────────────────────────────────
  const linkItems = [];
  for (let i = 1; i < rows.length; i += 1) {
    const lc = [...rows[i].children];
    const title = getText(lc[0]);
    const href = getText(lc[2]) || getText(lc[1]);
    const newTab = getText(lc[3]) === 'true';
    const noFollow = getText(lc[4]) === 'true';
    if (title || href) {
      linkItems.push({
        title, href, newTab, noFollow,
      });
    }
  }

  // Default link when none are authored
  if (linkItems.length === 0) {
    linkItems.push({
      title: 'Terms & Privacy',
      href: 'https://www.mercy.net/about/legal-notices/',
      newTab: false,
      noFollow: false,
    });
  }

  // ── Build address list items ──────────────────────────────────────────
  const addressParts = [
    `Mercy, ${community}`,
    streetAddress,
    [city, state, zip].filter(Boolean).join(', '),
  ].filter(Boolean);

  const addressHTML = addressParts
    .map((part) => `<li class="mercy-simplified-footer-item"><span class="mercy-simplified-footer-copyright">${part}</span></li>`)
    .join('');

  // ── Build footer link list items ──────────────────────────────────────
  const linkHTML = linkItems.map(({
    title, href, newTab, noFollow,
  }) => {
    const rel = [newTab && 'noopener noreferrer', noFollow && 'nofollow'].filter(Boolean).join(' ');
    const attrs = [
      `href="${href}"`,
      newTab ? 'target="_blank"' : '',
      rel ? `rel="${rel}"` : '',
    ].filter(Boolean).join(' ');
    return `<li class="mercy-simplified-footer-item"><a class="mercy-simplified-footer-link" ${attrs}>${title}</a></li>`;
  }).join('');

  // ── Render ────────────────────────────────────────────────────────────
  block.innerHTML = `
    <div class="mercy-simplified-footer-content">
      <div class="mercy-simplified-footer-section">
        <a class="mercy-simplified-footer-logo" href="${logoLinkURL}" aria-label="${logoTitle}">
          ${logoMarkup}
        </a>
      </div>
      <div class="mercy-simplified-footer-links">
        <ul class="mercy-simplified-footer-list">${addressHTML}</ul>
        <ul class="mercy-simplified-footer-list">
          ${linkHTML}
          <li class="mercy-simplified-footer-item"><p class="mercy-simplified-footer-copyright">&copy; ${currentYear} Mercy</p></li>
        </ul>
      </div>
    </div>
  `;
}
