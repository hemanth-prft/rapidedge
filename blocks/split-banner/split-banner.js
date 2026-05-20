function buildPictureFromUrl(url) {
  const img = document.createElement('img');
  img.src = url;
  img.loading = 'lazy';
  const pic = document.createElement('picture');
  pic.appendChild(img);
  return pic;
}

function isImageUrl(text) {
  const t = (text || '').trim();
  return /^https?:\/\/.+/i.test(t)
    && (/\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i.test(t)
      || /\/as\/[^/?#]+\.(jpg|jpeg|png|gif|webp|avif|svg)/i.test(t)
      || /delivery-[^.]+\.adobeaemcloud\.com/i.test(t));
}

function extractImageEl(cell) {
  const pic = cell.querySelector('picture');
  if (pic) return pic;

  const img = cell.querySelector('img');
  if (img) {
    const wrapper = document.createElement('picture');
    wrapper.appendChild(img.cloneNode(true));
    return wrapper;
  }

  const anchor = cell.querySelector('a');
  if (anchor) {
    if (isImageUrl(anchor.href)) return buildPictureFromUrl(anchor.href);
    const anchorText = anchor.textContent.trim();
    if (isImageUrl(anchorText)) return buildPictureFromUrl(anchorText);
  }

  const text = cell.textContent.trim();
  if (isImageUrl(text)) return buildPictureFromUrl(text);

  return null;
}

function injectIcon(contentCol) {
  if (!contentCol) return;

  [...contentCol.querySelectorAll('p')].forEach((p) => {
    if (p.querySelector('picture, img')) return;
    const anchor = p.querySelector('a');
    const url = (anchor && isImageUrl(anchor.href)) ? anchor.href
      : (anchor && isImageUrl(anchor.textContent.trim())) ? anchor.textContent.trim()
      : isImageUrl(p.textContent.trim()) ? p.textContent.trim() : '';
    if (url) {
      p.textContent = '';
      p.appendChild(buildPictureFromUrl(url));
    }
  });

  contentCol.querySelectorAll('p > a:only-child').forEach((link) => {
    link.closest('p').classList.add('split-banner-cta');
    const nextP = link.closest('p').nextElementSibling;
    if (!nextP) return;
    const icon = nextP.querySelector('picture');
    if (icon && nextP.children.length === 1) {
      const iconImg = icon.querySelector('img');
      if (iconImg) iconImg.classList.add('split-banner-cta-icon');
      link.append(icon);
      nextP.remove();
    }
  });
}

function buildFlatCta(contentCol) {
  if (!contentCol) return;
  const ps = [...contentCol.querySelectorAll('p')];
  for (let i = 0; i < ps.length - 1; i += 1) {
    const labelP = ps[i];
    const label = labelP.textContent.trim();
    if (!label || isImageUrl(label) || labelP.querySelector('a, picture, img')) continue;

    const linkP = ps[i + 1];
    const linkAnchor = linkP.querySelector('a');
    const linkText = linkP.textContent.trim();
    if (!linkAnchor && !/^(https?:\/\/|\/|#)/.test(linkText)) continue;

    const href = linkAnchor?.href || linkText;
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    labelP.textContent = '';
    labelP.classList.add('split-banner-cta');
    labelP.appendChild(a);
    linkP.remove();
    break;
  }
}

function promoteHeading(contentCol) {
  if (contentCol.querySelector('h1, h2, h3, h4, h5, h6')) return;
  const ps = [...contentCol.querySelectorAll('p')];
  for (const p of ps) {
    const kids = [...p.children];
    if (kids.length === 1 && kids[0].tagName === 'STRONG' && p.textContent.trim().length > 5) {
      const h2 = document.createElement('h2');
      h2.innerHTML = kids[0].innerHTML;
      p.replaceWith(h2);
      break;
    }
  }
}

export default function decorate(block) {
  const allCells = [...block.querySelectorAll(':scope > div > div')];

  let imageEl = null;
  let imageAltSet = false;
  const contentCol = document.createElement('div');
  contentCol.classList.add('split-banner-content');

  allCells.forEach((cell) => {
    if (!imageEl) {
      const detected = extractImageEl(cell);
      if (detected) {
        imageEl = detected;
        return;
      }
    }

    const cellText = cell.textContent.trim();

    if (imageEl && !imageAltSet && cellText
      && !cell.querySelector('picture, img, a, h1, h2, h3, h4, h5, h6')
      && !isImageUrl(cellText)) {
      const imgEl = imageEl.querySelector('img');
      if (imgEl) imgEl.alt = cellText;
      imageAltSet = true;
      return;
    }

    if (!cellText && !cell.querySelector('picture, img')) return;

    [...cell.childNodes].forEach((node) => contentCol.appendChild(node.cloneNode(true)));
  });

  promoteHeading(contentCol);

  block.innerHTML = '';
  const row = document.createElement('div');
  const imageCol = document.createElement('div');
  imageCol.classList.add('split-banner-image');
  if (imageEl) imageCol.appendChild(imageEl);
  row.appendChild(imageCol);
  row.appendChild(contentCol);
  block.appendChild(row);

  buildFlatCta(contentCol);
  injectIcon(contentCol);
}
