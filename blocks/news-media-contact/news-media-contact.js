function parseDocumentRow(imageCell, infoCell) {
  const contact = {};
  contact.imageEl = imageCell.querySelector('picture') || imageCell.querySelector('img');

  const lines = [...infoCell.querySelectorAll('p')];
  lines.forEach((line, idx) => {
    const text = line.textContent.trim();
    if (!text) return;

    if (idx === 0) {
      contact.fullName = text;
      return;
    }

    const anchor = line.querySelector('a');
    if (anchor && anchor.href && anchor.href.includes('mailto')) {
      contact.email = anchor.textContent.trim();
    } else if (/^phone:/i.test(text)) {
      contact.phone = text.replace(/^phone:\s*/i, '').trim();
    } else if (/^cell:/i.test(text)) {
      contact.cell = text.replace(/^cell:\s*/i, '').trim();
    } else if (/^page:/i.test(text)) {
      contact.page = text.replace(/^page:\s*/i, '').trim();
    } else if (/^twitter:/i.test(text)) {
      contact.twitter = anchor
        ? anchor.textContent.trim()
        : text.replace(/^twitter:\s*/i, '').trim();
      if (anchor) {
        contact.twitterLink = anchor.href
          .replace(/https?:\/\/(www\.)?twitter\.com\//i, '')
          .replace(/^\/\/twitter\.com\//i, '');
      }
    }
  });

  return contact;
}

function parseUERow(cells) {
  const [imgCell, nameCell, emailCell, phoneCell] = cells;
  return {
    imageEl: imgCell?.querySelector('picture') || imgCell?.querySelector('img'),
    fullName: nameCell?.textContent?.trim() || '',
    email: emailCell?.textContent?.trim() || '',
    phone: phoneCell?.textContent?.trim() || '',
  };
}

function buildCard(contact) {
  const card = document.createElement('div');
  card.className = 'news-media-contact-card';

  // Image
  if (contact.imageEl) {
    const imgContainer = document.createElement('div');
    imgContainer.className = 'news-media-contact-img-container';
    const imgWrapper = contact.imageEl.closest('picture') || contact.imageEl;
    const img = imgWrapper.tagName === 'IMG' ? imgWrapper : imgWrapper.querySelector('img');
    if (img) img.className = 'news-media-contact-img';
    imgContainer.append(imgWrapper);
    card.append(imgContainer);
  }

  // Info section
  const info = document.createElement('div');
  info.className = 'news-media-contact-info';

  // Full Name
  const nameDiv = document.createElement('div');
  nameDiv.className = 'news-media-contact-full-name';
  nameDiv.textContent = contact.fullName;
  info.append(nameDiv);

  // Email
  if (contact.email) {
    const emailDiv = document.createElement('div');
    emailDiv.className = 'news-media-contact-email';
    const a = document.createElement('a');
    a.className = 'news-media-contact-email-link';
    a.href = `mailto:${contact.email}`;
    a.textContent = contact.email;
    emailDiv.append(a);
    info.append(emailDiv);
  }

  // Phone
  if (contact.phone) {
    const div = document.createElement('div');
    div.className = 'phone';
    const label = document.createElement('span');
    label.className = 'news-media-contact-label';
    label.textContent = ' Phone: ';
    const a = document.createElement('a');
    a.href = `tel:${contact.phone}`;
    a.className = 'news-media-contact-phone-link';
    a.textContent = contact.phone;
    div.append(label, a);
    info.append(div);
  }

  // Cell
  if (contact.cell) {
    const div = document.createElement('div');
    div.className = 'cell';
    const label = document.createElement('span');
    label.className = 'news-media-contact-label';
    label.textContent = ' Cell: ';
    const a = document.createElement('a');
    a.href = `tel:${contact.cell}`;
    a.className = 'news-media-contact-phone-link';
    a.textContent = contact.cell;
    div.append(label, a);
    info.append(div);
  }

  // Page
  if (contact.page) {
    const div = document.createElement('div');
    div.className = 'page';
    const label = document.createElement('span');
    label.className = 'news-media-contact-label';
    label.textContent = ' Page:';
    div.append(label, document.createTextNode(` ${contact.page}`));
    info.append(div);
  }

  // Twitter
  if (contact.twitter) {
    const div = document.createElement('div');
    div.className = 'twitter';
    const label = document.createElement('span');
    label.className = 'news-media-contact-label';
    label.textContent = ' Twitter:';
    const username = (contact.twitterLink || contact.twitter).replace(/^@/, '');
    const a = document.createElement('a');
    a.href = `//twitter.com/${username}`;
    a.textContent = contact.twitter;
    div.append(label, a);
    info.append(div);
  }

  card.append(info);
  return card;
}

export default function decorate(block) {
  const rows = [...block.children];
  const contactItems = [];
  let seeAllLink = null;
  let quickFactsEl = null;

  rows.forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    // Single-cell row
    if (cells.length === 1) {
      const cell = cells[0];
      const anchor = cell.querySelector('a');
      const text = cell.textContent.trim();

      // Document authoring: row with an anchor link (no image)
      if (anchor && !cell.querySelector('picture') && !cell.querySelector('img')) {
        seeAllLink = anchor;
        return;
      }

      // UE authoring: seeAllLink text field renders as a plain-text URL
      if (text && (text.startsWith('/') || text.startsWith('http')) && !cell.querySelector('picture')) {
        const a = document.createElement('a');
        a.href = text;
        a.textContent = 'See All Media Contacts';
        seeAllLink = a;
      }
      return;
    }

    // Two-cell row
    if (cells.length === 2) {
      const [firstCell, secondCell] = cells;
      const firstText = firstCell.textContent.trim().toLowerCase();

      // Quick Facts row: first cell labeled "quick facts"
      if (firstText === 'quick facts') {
        quickFactsEl = secondCell;
        return;
      }

      // Document-mode contact: first cell has a picture/image
      if (firstCell.querySelector('picture') || firstCell.querySelector('img')) {
        const contact = parseDocumentRow(firstCell, secondCell);
        if (contact.fullName) contactItems.push(contact);
        return;
      }
    }

    // UE-mode: each contact item renders as one row with 4 field-columns
    if (cells.length >= 3) {
      const contact = parseUERow(cells);
      if (contact.fullName) contactItems.push(contact);
    }
  });

  // Build DOM
  block.innerHTML = '';

  // Contact cards container
  const swiperContainer = document.createElement('div');
  swiperContainer.className = 'news-media-contact-swiper-container';
  contactItems.forEach((contact) => {
    swiperContainer.append(buildCard(contact));
  });
  block.append(swiperContainer);

  // Quick Facts section
  if (quickFactsEl) {
    const hasMultipleCards = contactItems.length > 1;
    const qf = document.createElement('div');
    qf.className = `news-media-contact-quick-facts${hasMultipleCards ? ' news-media-contact-quick-facts-with-margin' : ''}`;
    qf.append(document.createTextNode('Quick Facts: '));
    const anchors = [...quickFactsEl.querySelectorAll('a')];
    anchors.forEach((a, i) => {
      qf.append(a.cloneNode(true));
      if (i < anchors.length - 1) qf.append(document.createTextNode(', '));
    });
    block.append(qf);
  }

  // See All Media Contacts link
  if (seeAllLink) {
    const bottomSection = document.createElement('div');
    bottomSection.className = 'news-media-contact-see-all';
    const a = seeAllLink.cloneNode(true);
    a.className = 'news-media-contact-view-more-link';
    if (!a.textContent.trim()) a.textContent = 'See All Media Contacts';
    bottomSection.append(a);
    block.append(bottomSection);
  }
}
