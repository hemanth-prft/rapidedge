import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const row = block.children[0];
  if (!row) return;

  const cols = [...row.children];
  const name = cols[0]?.textContent?.trim() || '';
  const email = cols[1]?.textContent?.trim() || '';
  const phone = cols[2]?.textContent?.trim() || '';
  const ctaLink = cols[3]?.querySelector('a')?.href || cols[3]?.textContent?.trim() || '';

  const wrapper = document.createElement('div');
  wrapper.className = 'media-contact-card';
  moveInstrumentation(row, wrapper);

  const title = document.createElement('h3');
  title.className = 'media-contact-title';
  title.innerHTML = '<span class="media-contact-icon"></span> Media Contact';

  const nameEl = document.createElement('p');
  nameEl.className = 'media-contact-name';
  nameEl.textContent = name;

  const contactRow = document.createElement('div');
  contactRow.className = 'media-contact-info';

  if (email) {
    const emailLink = document.createElement('a');
    emailLink.href = `mailto:${email}`;
    emailLink.className = 'media-contact-email';
    emailLink.textContent = email;
    contactRow.append(emailLink);
  }

  if (phone) {
    const phoneLink = document.createElement('a');
    phoneLink.href = `tel:${phone.replace(/[^+\d]/g, '')}`;
    phoneLink.className = 'media-contact-phone';
    phoneLink.textContent = phone;
    contactRow.append(phoneLink);
  }

  wrapper.append(title, nameEl, contactRow);

  if (ctaLink) {
    const cta = document.createElement('a');
    cta.href = ctaLink;
    cta.className = 'media-contact-cta';
    cta.textContent = 'See All Media Contacts';
    wrapper.append(cta);
  }

  block.textContent = '';
  block.append(wrapper);
}
