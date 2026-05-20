import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const row = block.children[0];
  if (!row) return;

  const cols = [...row.children];
  const name = cols[0]?.textContent?.trim() || '';
  const email = cols[1]?.textContent?.trim() || '';
  const phone = cols[2]?.textContent?.trim() || '';
  const ctaLink = cols[3]?.textContent?.trim() || '#';

  const card = document.createElement('div');
  card.className = 'media-contact-card';
  moveInstrumentation(row, card);

  const titleEl = document.createElement('h3');
  titleEl.className = 'media-contact-title';
  titleEl.innerHTML = '<span class="media-contact-icon"></span> Media Contact';

  const nameEl = document.createElement('p');
  nameEl.className = 'media-contact-name';
  nameEl.textContent = name;

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
  ctaEl.textContent = 'See All Media Contacts';

  card.append(titleEl, nameEl, infoEl, ctaEl);

  block.textContent = '';
  block.append(card);
}
