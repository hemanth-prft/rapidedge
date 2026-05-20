import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  let contactName = '';
  let email = '';
  let phone = '';
  let ctaRaw = '#';

  if (rows.length === 1) {
    // Single row with multiple columns
    const cols = [...rows[0].children];
    contactName = cols[0]?.textContent?.trim() || '';
    email = cols[1]?.textContent?.trim() || '';
    phone = cols[2]?.textContent?.trim() || '';
    ctaRaw = cols[3]?.textContent?.trim() || 'See All Media Contacts, #';
  } else {
    // Multiple rows, one field per row
    contactName = rows[0]?.children[0]?.textContent?.trim() || '';
    email = rows[1]?.children[0]?.textContent?.trim() || '';
    phone = rows[2]?.children[0]?.textContent?.trim() || '';
    ctaRaw = rows[3]?.children[0]?.textContent?.trim() || 'See All Media Contacts, #';
  }

  const ctaParts = ctaRaw.split(',');
  const ctaText = ctaParts[0]?.trim() || 'See All Media Contacts';
  const ctaLink = ctaParts.slice(1).join(',').trim() || '#';

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
