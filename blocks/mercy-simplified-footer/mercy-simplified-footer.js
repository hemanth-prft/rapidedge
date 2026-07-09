export default function decorate(block) {
  const currentYear = new Date().getFullYear();

  // In Universal Editor each authored field is its own single-cell row.
  const rows = [...block.children];
  const getText = (row) => row?.children[0]?.textContent?.trim() ?? '';

  // Multifield data is serialised as a JSON array in a single row cell.
  const parseJSON = (row) => {
    try {
      const raw = getText(row);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  // ── Tab 1 — Default Address (rows 0–5) ────────────────────────────────
  const community = getText(rows[0]) || 'St. Louis';
  const streetAddress = getText(rows[1]) || '615 South New Ballas Road';
  const city = getText(rows[2]) || 'Saint Louis';
  const state = getText(rows[3]) || 'Missouri';
  const zip = getText(rows[4]) || '63141';
  const phone = getText(rows[5]) || '';

  // ── Segment Addresses multifield (row 6) ─────────────────────────────
  // Each item: { segment, segmentCommunity, segmentStreetAddress,
  //              segmentCity, segmentState, segmentZip, segmentPhone }
  const segmentAddresses = parseJSON(rows[6]);

  // Detect the active segment from page metadata or leading URL path part.
  const pageSegment = (
    document.querySelector('meta[name="segment"]')?.content
    || window.location.pathname.split('/').filter(Boolean)[0]
    || ''
  ).toLowerCase();

  let addr = {
    community, streetAddress, city, state, zip, phone,
  };
  if (pageSegment && segmentAddresses.length > 0) {
    const match = segmentAddresses.find((sa) => sa.segment === pageSegment);
    if (match) {
      addr = {
        community: match.segmentCommunity || community,
        streetAddress: match.segmentStreetAddress || streetAddress,
        city: match.segmentCity || city,
        state: match.segmentState || state,
        zip: match.segmentZip || zip,
        phone: match.segmentPhone || phone,
      };
    }
  }

  // ── Footer Links multifield (row 7) ──────────────────────────────────
  // Each item: { title, metadataTitle, linkTarget, openInNewWindow, noFollow }
  let linkItems = parseJSON(rows[7]).filter((l) => l.title || l.linkTarget);
  if (linkItems.length === 0) {
    linkItems = [{
      title: 'Terms & Privacy',
      linkTarget: 'https://www.mercy.net/about/legal-notices/',
      openInNewWindow: 'No',
      noFollow: 'No',
    }];
  }

  // ── Tab 3 — Logo (rows 8–10) ──────────────────────────────────────────
  const logoImg = rows[8]?.querySelector('picture, img');
  const logoLinkURL = getText(rows[9]) || '/';
  const logoTitle = getText(rows[10]) || 'Mercy Home';

  let logoMarkup = '<img src="/blocks/footer/reversedLogo.png" alt="Mercy" />';
  if (logoImg) {
    logoMarkup = logoImg.tagName === 'PICTURE'
      ? logoImg.outerHTML
      : `<img src="${logoImg.src}" alt="${logoImg.alt || 'Mercy'}" />`;
  }

  // ── Build address HTML ────────────────────────────────────────────────
  const cityStateZip = [addr.city, addr.state, addr.zip].filter(Boolean).join(', ');
  const addressParts = [`Mercy, ${addr.community}`, addr.streetAddress, cityStateZip]
    .filter(Boolean);
  if (addr.phone) addressParts.push(addr.phone);

  const addressHTML = addressParts
    .map((p) => `<li class="mercy-simplified-footer-item"><span class="mercy-simplified-footer-copyright">${p}</span></li>`)
    .join('');

  // ── Build links HTML ──────────────────────────────────────────────────
  const linkHTML = linkItems.map(({
    title, metadataTitle, linkTarget, openInNewWindow, noFollow,
  }) => {
    const newTab = openInNewWindow === 'Yes';
    const noFollowFlag = noFollow === 'Yes';
    const rel = [newTab && 'noopener noreferrer', noFollowFlag && 'nofollow']
      .filter(Boolean).join(' ');
    const attrs = [
      `href="${linkTarget || '#'}"`,
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
