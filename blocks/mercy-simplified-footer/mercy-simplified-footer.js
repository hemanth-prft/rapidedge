export default function decorate(block) {
  const currentYear = new Date().getFullYear();
  const cells = block.firstElementChild
    ? [...block.firstElementChild.children]
    : [];

  // ── Helper ────────────────────────────────────────────────────────────
  const getText = (el) => el?.textContent?.trim() ?? '';

  // ── Tab 1 — Address (cells 0–5) ───────────────────────────────────────
  const community = getText(cells[0]) || 'St. Louis';
  const streetAddress = getText(cells[1]) || '615 South New Ballas Road';
  const city = getText(cells[2]) || 'Saint Louis';
  const state = getText(cells[3]) || 'Missouri';
  const zip = getText(cells[4]) || '63141';

  // ── Tab 2 — Footer Links (cells 5–19, 5 fields × 3 slots) ────────────
  // Per slot: [title, metadataTitle, target, windowTarget, noFollow]
  const LINK_OFFSET = 5;
  const LINK_STRIDE = 5;
  const LINK_COUNT = 3;

  const linkItems = [];
  for (let i = 0; i < LINK_COUNT; i += 1) {
    const base = LINK_OFFSET + i * LINK_STRIDE;
    const title = getText(cells[base]);
    const href = getText(cells[base + 2]);
    const newTab = getText(cells[base + 3]) === 'true';
    const noFollow = getText(cells[base + 4]) === 'true';
    if (title || href) {
      linkItems.push({
        title, href, newTab, noFollow,
      });
    }
  }

  if (linkItems.length === 0) {
    linkItems.push({
      title: 'Terms & Privacy',
      href: 'https://www.mercy.net/about/legal-notices/',
      newTab: false,
      noFollow: false,
    });
  }

  // ── Tab 3 — Logo (cells 20–22) ────────────────────────────────────────
  const LOGO_OFFSET = LINK_OFFSET + LINK_COUNT * LINK_STRIDE; // 20
  const logoImg = cells[LOGO_OFFSET]?.querySelector('picture, img');
  const logoLinkURL = getText(cells[LOGO_OFFSET + 1]) || '/';
  const logoTitle = getText(cells[LOGO_OFFSET + 2]) || 'Mercy Home';

  let logoMarkup = '<img src="/blocks/footer/reversedLogo.png" alt="Mercy" />';
  if (logoImg) {
    logoMarkup = logoImg.tagName === 'PICTURE'
      ? logoImg.outerHTML
      : `<img src="${logoImg.src}" alt="${logoImg.alt || 'Mercy'}" />`;
  }

  // ── Build HTML ────────────────────────────────────────────────────────
  const addressParts = [
    `Mercy, ${community}`,
    streetAddress,
    [city, state, zip].filter(Boolean).join(', '),
  ].filter(Boolean);

  const addressHTML = addressParts
    .map((p) => `<li class="mercy-simplified-footer-item"><span class="mercy-simplified-footer-copyright">${p}</span></li>`)
    .join('');

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
