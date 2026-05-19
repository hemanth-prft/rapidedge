import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // Fields come as separate rows: name, email, phone, ctaLink
  const getName = (r) => r?.children[0]?.textContent?.trim() || '';
  const name = getName(rows[0]);
  const email = rows[1] ? rows[1].children[0]?.textContent?.trim() : '';
  const phone = rows[2] ? rows[2].children[0]?.textContent?.trim() : '';
  const ctaLink = rows[3]
    ? (rows[3].children[0]?.querySelector('a')?.href || rows[3].children[0]?.textContent?.trim())
    : '';

  const wrapper = document.createElement('div');
  wrapper.className = 'media-contact-card';
  moveInstrumentation(rows[0], wrapper);

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
