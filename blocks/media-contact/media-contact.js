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

  card.innerHTML = `
    <h3 class="media-contact-title">
      <span class="media-contact-icon"></span> Media Contact
    </h3>
    <p class="media-contact-name">${name}</p>
    <div class="media-contact-info">
      <a href="mailto:${email}" class="media-contact-email">${email}</a>
      <a href="tel:${phone.replace(/[^+\d]/g, '')}" class="media-contact-phone">${phone}</a>
    </div>
    <a href="${ctaLink}" class="media-contact-cta">See All Media Contacts</a>
  `;

  block.textContent = '';
  block.append(card);
}
