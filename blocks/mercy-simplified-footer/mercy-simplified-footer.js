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

  // ── Tab 2 — Footer Links (rows 6–10) ──────────────────────────────────
  const linkTitle = getText(rows[6]) || 'Terms & Privacy';
  const linkMetadataTitle = getText(rows[7]);
  const linkHref = getText(rows[8]) || 'https://www.mercy.net/about/legal-notices/';
  const linkNewTab = getText(rows[9]) === 'Yes';
  const linkNoFollow = getText(rows[10]) === 'Yes';

  // ── Tab 3 — Logo (rows 11–13) ─────────────────────────────────────────
  const LOGO_OFFSET = 11;
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

  // ── Build link HTML ───────────────────────────────────────────────────
  const linkRel = [linkNewTab && 'noopener noreferrer', linkNoFollow && 'nofollow']
    .filter(Boolean).join(' ');
  const linkAttrs = [
    `href="${linkHref}"`,
    linkNewTab ? 'target="_blank"' : '',
    linkRel ? `rel="${linkRel}"` : '',
    linkMetadataTitle ? `title="${linkMetadataTitle}"` : '',
  ].filter(Boolean).join(' ');
  const linkHTML = `<li class="mercy-simplified-footer-item"><a class="mercy-simplified-footer-link" ${linkAttrs}>${linkTitle}</a></li>`;

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
