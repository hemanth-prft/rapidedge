import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const DEFAULT_LOGO_SRC = '/blocks/simplified-header/MercyColorLogo.svg';
const DEFAULT_LOGO_TITLE = 'Home';
const DEFAULT_LOGO_LINK = '/';
const DEFAULT_TAGLINE = 'Your life is our life\'s work.';

function getCell(row, index) {
  const cells = [...row.children];
  return cells[index];
}

function getFieldCell(rows, fieldIndex) {
  if (!rows.length) {
    return null;
  }

  // Single-row layout: all fields are columns in the first row.
  if (rows.length === 1) {
    return getCell(rows[0], fieldIndex);
  }

  // Multi-row layout: each field is its own row, usually [label, value].
  const row = rows[fieldIndex];
  if (!row) {
    return null;
  }

  const cells = [...row.children];
  if (!cells.length) {
    return null;
  }

  return cells[cells.length - 1];
}

function getFieldText(rows, fieldIndex) {
  const cell = getFieldCell(rows, fieldIndex);
  return cell ? (cell.textContent || '').trim() : '';
}

function getFieldHtml(rows, fieldIndex) {
  const cell = getFieldCell(rows, fieldIndex);
  return cell ? cell.innerHTML.trim() : '';
}

function getFieldLink(rows, fieldIndex, fallback = '') {
  const cell = getFieldCell(rows, fieldIndex);
  if (!cell) {
    return fallback;
  }

  const anchor = cell.querySelector('a[href]');
  if (anchor) {
    const href = anchor.getAttribute('href');
    return href ? href.trim() : fallback;
  }

  const text = cell.textContent.trim();
  return text || fallback;
}

function getFieldBoolean(rows, fieldIndex, fallback = false) {
  const cell = getFieldCell(rows, fieldIndex);
  if (!cell) {
    return fallback;
  }

  const checkbox = cell.querySelector('input[type="checkbox"]');
  if (checkbox) {
    return checkbox.checked;
  }

  const ariaChecked = cell.querySelector('[aria-checked]')?.getAttribute('aria-checked');
  if (ariaChecked === 'true' || ariaChecked === 'false') {
    return ariaChecked === 'true';
  }

  const text = (cell.textContent || '').trim().toLowerCase();
  if (/\b(true|yes|on|enabled|checked|1)\b/.test(text)) {
    return true;
  }

  if (/\b(false|no|off|0|disabled|unchecked)\b/.test(text)) {
    return false;
  }

  return fallback;
}

function getFieldPicture(rows, fieldIndex) {
  const cell = getFieldCell(rows, fieldIndex);
  if (!cell) return null;

  // UE delivery: <picture> element rendered directly in cell.
  const pic = cell.querySelector('picture');
  if (pic) return pic;

  // Fallback: document-based authoring or plain img.
  const img = cell.querySelector('img');
  if (img) {
    return createOptimizedPicture(img.src, img.alt || '', false, [{ width: '400' }]);
  }

  // Fallback: DAM path as text.
  const src = cell.textContent.trim();
  if (src && src.startsWith('/')) {
    return createOptimizedPicture(src, '', false, [{ width: '400' }]);
  }

  return null;
}

function getPictureFromSource(src, alt = '') {
  if (!src) {
    return null;
  }

  return createOptimizedPicture(src, alt, false, [{ width: '400' }]);
}

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
}

function normalizeAlertColor(value) {
  const normalized = (value || '').trim().toLowerCase();

  if (!normalized) {
    return 'halert-primary';
  }

  if (normalized.includes('danger') || normalized.includes('high alert') || normalized.includes('red')) {
    return 'halert-danger';
  }

  if (normalized.includes('warning') || normalized.includes('normal alert') || normalized.includes('yellow')) {
    return 'halert-warning';
  }

  return 'halert-primary';
}

function readModel(block) {
  const rows = [...block.children].filter((child) => child instanceof HTMLDivElement);
  const data = {
    logoPicture: getFieldPicture(rows, 0),
    logoLinkURL: getFieldLink(rows, 1, DEFAULT_LOGO_LINK),
    logoTitle: getFieldText(rows, 2) || DEFAULT_LOGO_TITLE,
    coBrandingLogoPicture: getFieldPicture(rows, 3),
    coBrandingLogoLinkURL: getFieldLink(rows, 4, ''),
    coBrandingLogoTitle: getFieldText(rows, 5),
    alertEnabled: getFieldBoolean(rows, 6, false),
    alertColor: normalizeAlertColor(getFieldText(rows, 7)),
    alertText: getFieldHtml(rows, 8) || getFieldText(rows, 8),
  };

  if (!data.logoPicture) {
    data.logoPicture = getPictureFromSource(DEFAULT_LOGO_SRC, DEFAULT_LOGO_TITLE);
  }

  return data;
}

function buildLogoWrapper({ picture, alt, link, wrapperClass, logoClass }) {
  if (!picture) {
    return null;
  }

  const img = picture.querySelector('img');
  if (img) {
    img.classList.add(logoClass);
  }

  if (!link) {
    const wrapper = document.createElement('div');
    wrapper.className = wrapperClass;
    wrapper.append(picture);
    return wrapper;
  }

  const wrapper = document.createElement('div');
  wrapper.className = wrapperClass;
  
  const anchor = document.createElement('a');
  anchor.className = `${logoClass}-link`;
  anchor.href = link;
  anchor.setAttribute('aria-label', alt || 'Logo');
  anchor.append(picture);
  
  wrapper.append(anchor);
  return wrapper;
}

export default function decorate(block) {
  const firstRow = block.querySelector(':scope > div');
  const model = readModel(block);
  const hasCoBranding = !!model.coBrandingLogoPicture;

  block.textContent = '';

  const root = document.createElement('header');
  root.className = 'mcy-simplified-header';

  if (hasCoBranding) {
    root.classList.add('mcy-simplified-header--has-co-branding-logo');
  }

  if (firstRow) {
    moveInstrumentation(firstRow, root);
  }

  const content = document.createElement('div');
  content.className = 'mcy-simplified-header__content';

  const logos = document.createElement('div');
  logos.className = 'mcy-simplified-header__logos';

  const primaryLogo = buildLogoWrapper({
    picture: model.logoPicture,
    alt: model.logoTitle,
    link: model.logoLinkURL,
    wrapperClass: 'mcy-simplified-header__logo-wrapper',
    logoClass: 'mcy-simplified-header__logo',
  });

  if (primaryLogo) {
    logos.append(primaryLogo);
  }

  if (hasCoBranding) {
    const coBrandingLogo = buildLogoWrapper({
      picture: model.coBrandingLogoPicture,
      alt: model.coBrandingLogoTitle,
      link: model.coBrandingLogoLinkURL,
      wrapperClass: 'mcy-simplified-header__logo-wrapper mcy-simplified-header__logo-wrapper--co-branding',
      logoClass: 'mcy-simplified-header__logo',
    });

    if (coBrandingLogo) {
      logos.append(coBrandingLogo);
    }
  }

  content.append(logos);

  const tagline = document.createElement('p');
  tagline.className = 'mcy-simplified-header__tagline';
  tagline.textContent = DEFAULT_TAGLINE;
  content.append(tagline);

  root.append(content);
  block.append(root);

  if (model.alertEnabled && model.alertText) {
    const alert = document.createElement('aside');
    alert.className = `mcy-simplified-header__alert ${model.alertColor}`;
    alert.setAttribute('role', 'status');
    alert.innerHTML = model.alertText;
    block.append(alert);
  }
}
