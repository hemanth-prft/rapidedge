import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  let contactName = '';
  let email = '';
  let phone = '';
  let ctaText = 'See All Media Contacts';
  let ctaLink = '#';

  if (rows.length === 1) {
    // Single row with multiple columns
    const cols = [...rows[0].children];
    contactName = cols[0]?.textContent?.trim() || '';
    email = cols[1]?.textContent?.trim() || '';
    phone = cols[2]?.textContent?.trim() || '';
    // cta_text and cta_link collapse into one cell with two <p> or text nodes
    const ctaCell = cols[3];
    if (ctaCell) {
      const parts = [...ctaCell.children];
      ctaText = parts[0]?.textContent?.trim() || ctaCell.textContent?.trim() || 'See All Media Contacts';
      ctaLink = parts[1]?.textContent?.trim() || '#';
    }
  } else {
    // Multiple rows, one field per row
    contactName = rows[0]?.children[0]?.textContent?.trim() || '';
    email = rows[1]?.children[0]?.textContent?.trim() || '';
    phone = rows[2]?.children[0]?.textContent?.trim() || '';
    const ctaCell = rows[3]?.children[0];
    if (ctaCell) {
      const parts = [...ctaCell.children];
      ctaText = parts[0]?.textContent?.trim() || ctaCell.textContent?.trim() || 'See All Media Contacts';
      ctaLink = parts[1]?.textContent?.trim() || '#';
    }
  }

  const card = document.createElement('div');
  card.className = 'media-contact-card';
  moveInstrumentation(rows[0], card);

  const titleEl = document.createElement('h3');
  titleEl.className = 'media-contact-title';
  titleEl.innerHTML = '<span class="media-contact-icon"></span> Media Contact';

  const nameEl = document.createElement('p');
  nameEl.className = 'media-contact-name';
  nameEl.textContent = contactName;

  const infoEl = document.createElement('div');
  infoEl.className = 'media-contact-info';
  if (email) {
    infoEl.innerHTML += `<a href="mailto:${email}" class="media-contact-email">${email}</a>`;
  }
  if (phone) {
    infoEl.innerHTML += `<a href="tel:${phone.replace(/[^+\d]/g, '')}" class="media-contact-phone">${phone}</a>`;
  }

  const ctaEl = document.createElement('a');
  ctaEl.href = ctaLink;
  ctaEl.className = 'media-contact-cta';
  ctaEl.textContent = ctaText;

  card.append(titleEl, nameEl, infoEl, ctaEl);

  block.textContent = '';
  block.append(card);
}
