export default function decorate(block) {
  const currentYear = new Date().getFullYear();

  // In Universal Editor each authored field is its own single-cell row.
  const rows = [...block.children];
  const getText = (row) => row?.children[0]?.textContent?.trim() ?? '';

  // ── Tab 1 — Address (rows 0–5) ────────────────────────────────────────
  const community = getText(rows[0]) || 'St. Louis';
  const streetAddress = getText(rows[1]) || '615 South New Ballas Road';
  const city = getText(rows[2]) || 'Saint Louis';
  const state = getText(rows[3]) || 'Missouri';
  const zip = getText(rows[4]) || '63141';
  const phone = getText(rows[5]) || '';

  // ── Tab 2 — Footer Links (rows 6–20, 5 fields × 3 slots) ─────────────
  // Per slot: title, metadataTitle, target, openInNewWindow, noFollow
  const LINK_OFFSET = 6;
  const LINK_STRIDE = 5;
  const LINK_COUNT = 3;

  const linkItems = [];
  for (let i = 0; i < LINK_COUNT; i += 1) {
    const base = LINK_OFFSET + i * LINK_STRIDE;
    const title = getText(rows[base]);
    const metadataTitle = getText(rows[base + 1]);
    const href = getText(rows[base + 2]);
    const newTab = getText(rows[base + 3]) === 'Yes';
    const noFollow = getText(rows[base + 4]) === 'Yes';
    if (title || href) {
      linkItems.push({
        title, metadataTitle, href, newTab, noFollow,
      });
    }
  }

  if (linkItems.length === 0) {
    linkItems.push({
      title: 'Terms & Privacy',
      metadataTitle: '',
      href: 'https://www.mercy.net/about/legal-notices/',
      newTab: false,
      noFollow: false,
    });
  }

  // ── Tab 3 — Logo (rows 21–23) ─────────────────────────────────────────
  const LOGO_OFFSET = LINK_OFFSET + LINK_COUNT * LINK_STRIDE; // 21
  const logoImg = rows[LOGO_OFFSET]?.querySelector('picture, img');
  const logoLinkURL = getText(rows[LOGO_OFFSET + 1]) || '/';
  const logoTitle = getText(rows[LOGO_OFFSET + 2]) || 'Mercy Home';

  let logoMarkup = '<img src="/blocks/footer/reversedLogo.png" alt="Mercy" />';
  if (logoImg) {
    logoMarkup = logoImg.tagName === 'PICTURE'
      ? logoImg.outerHTML
      : `<img src="${logoImg.src}" alt="${logoImg.alt || 'Mercy'}" />`;
  }

  // ── Build address HTML ────────────────────────────────────────────────
  const cityStateZip = [city, state, zip].filter(Boolean).join(', ');
  const addressParts = [`Mercy, ${community}`, streetAddress, cityStateZip]
    .filter(Boolean);
  if (phone) addressParts.push(phone);

  const addressHTML = addressParts
    .map((p) => `<li class="mercy-simplified-footer-item"><span class="mercy-simplified-footer-copyright">${p}</span></li>`)
    .join('');

  // ── Build links HTML ──────────────────────────────────────────────────
  const linkHTML = linkItems.map((
    {
      title, metadataTitle, href, newTab, noFollow,
    },
  ) => {
    const rel = [newTab && 'noopener noreferrer', noFollow && 'nofollow']
      .filter(Boolean).join(' ');
    const attrs = [
      `href="${href || '#'}"`,
      newTab ? 'target="_blank"' : '',
      rel ? `rel="${rel}"` : '',
      metadataTitle ? `title="${metadataTitle}"` : '',
    ].filter(Boolean).join(' ');
    return `<li class="mercy-simplified-footer-item"><a class="mercy-simplified-footer-link" ${attrs}>${title}</a></li>`;
  }).join('');

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
