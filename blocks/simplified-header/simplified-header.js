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

function normalizeLabelText(text) {
  return (text || '').toString().replace(/[\s\u00A0]+/g, ' ').trim().toLowerCase();
}

function getFieldCell(rows, fieldIndex, labelMatchers = []) {
  if (!rows.length) {
    return null;
  }

  const row = rows[fieldIndex];
  if (row) {
    const cells = [...row.children];
    if (cells.length) {
      return cells[cells.length - 1];
    }
  }

  if (!labelMatchers.length) {
    return null;
  }

  const normalizedMatchers = labelMatchers.map(normalizeLabelText).filter(Boolean);
  if (!normalizedMatchers.length) {
    return null;
  }

  for (const candidate of rows) {
    const candidateText = normalizeLabelText([
      candidate.getAttribute('aria-label'),
      candidate.querySelector('label')?.textContent,
      candidate.textContent,
    ].filter(Boolean).join(' '));

    if (!candidateText) {
      continue;
    }

    if (normalizedMatchers.some((matcher) => candidateText.includes(matcher))) {
      const cells = [...candidate.children];
      if (cells.length) {
        return cells[cells.length - 1];
      }
    }
  }

  return null;
}

function getFieldText(rows, fieldIndex, labelMatchers = []) {
  const cell = getFieldCell(rows, fieldIndex, labelMatchers);
  if (!cell) {
    return '';
  }

  const input = cell.querySelector('input:not([type="checkbox"]):not([type="radio"]), textarea, select');
  if (input && input.value !== undefined) {
    return (input.value || '').trim();
  }

  const dataValue = cell.getAttribute('data-value') || cell.getAttribute('value');
  if (dataValue) {
    return dataValue.trim();
  }

  return (cell.textContent || '').trim();
}

function getFieldHtml(rows, fieldIndex, labelMatchers = []) {
  const cell = getFieldCell(rows, fieldIndex, labelMatchers);
  if (!cell) {
    return '';
  }

  const richTextContent = cell.querySelector('[data-richtext], .richtext, .text, p, div');
  if (richTextContent && richTextContent.innerHTML.trim()) {
    return richTextContent.innerHTML.trim();
  }

  return cell.innerHTML.trim();
}

function getFieldLink(rows, fieldIndex, fallback = '', labelMatchers = []) {
  const cell = getFieldCell(rows, fieldIndex, labelMatchers);
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

function getFieldBoolean(rows, fieldIndex, fallback = false, labelMatchers = []) {
  const cell = getFieldCell(rows, fieldIndex, labelMatchers);
  if (!cell) {
    return fallback;
  }

  const checkbox = cell.querySelector('input[type="checkbox"], input[type="radio"], [role="checkbox"], [role="switch"]');
  if (checkbox) {
    const checked = checkbox.checked || checkbox.getAttribute('aria-checked') === 'true';
    if (checked !== undefined) {
      return checked;
    }
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

function getFieldPicture(rows, fieldIndex, labelMatchers = []) {
  const cell = getFieldCell(rows, fieldIndex, labelMatchers);
  if (!cell) return null;

  // UE delivery: <picture> element rendered directly in cell.
  const pic = cell.querySelector('picture');
  if (pic) return pic;

  const image = cell.querySelector('img');
  if (image) {
    const src = image.getAttribute('src')
      || image.getAttribute('data-src')
      || image.getAttribute('srcset')
      || '';

    if (src) {
      const firstSrc = src.split(',')[0].trim().split(' ')[0];
      return createOptimizedPicture(firstSrc, image.getAttribute('alt') || '', false, [{ width: '400' }]);
    }
  }

  const source = cell.querySelector('source');
  if (source) {
    const src = source.getAttribute('srcset')
      || source.getAttribute('src')
      || '';

    if (src) {
      const firstSrc = src.split(',')[0].trim().split(' ')[0];
      return createOptimizedPicture(firstSrc, '', false, [{ width: '400' }]);
    }
  }

  // Fallback: DAM path or URL entered as text.
  const rawText = (cell.textContent || '').trim();
  if (rawText && (/^https?:\/\//i.test(rawText) || rawText.startsWith('/') || rawText.startsWith('data:'))) {
    return createOptimizedPicture(rawText, '', false, [{ width: '400' }]);
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
  const alertText = getFieldHtml(rows, 8, ['alert content', 'alert text']) || getFieldText(rows, 8, ['alert content', 'alert text']);
  const data = {
    logoPicture: getFieldPicture(rows, 0, ['logo', 'primary logo']),
    logoLinkURL: getFieldLink(rows, 1, DEFAULT_LOGO_LINK, ['logo link url', 'logo link']),
    logoTitle: getFieldText(rows, 2, ['logo title']) || DEFAULT_LOGO_TITLE,
    coBrandingLogoPicture: getFieldPicture(rows, 3, ['co-branding logo', 'co branding logo']),
    coBrandingLogoLinkURL: getFieldLink(rows, 4, '', ['co-branding logo link url', 'co branding logo link']),
    coBrandingLogoTitle: getFieldText(rows, 5, ['co-branding logo title', 'co branding logo title']),
    alertEnabled: getFieldBoolean(rows, 6, false, ['enable alert', 'enable alert banner']),
    alertColor: normalizeAlertColor(getFieldText(rows, 7, ['alert color'])),
    alertText,
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

  const showAlert = model.alertEnabled && model.alertText && model.alertText.replace(/<[^>]+>/g, '').trim();

  if (showAlert) {
    const alert = document.createElement('aside');
    alert.className = `mcy-simplified-header__alert ${model.alertColor}`;
    alert.setAttribute('role', 'status');

    const alertIcon = document.createElement('span');
    alertIcon.className = 'mcy-simplified-header__alert-icon';
    alertIcon.textContent = '⚠️';

    const alertContent = document.createElement('div');
    alertContent.className = 'mcy-simplified-header__alert-content';
    alertContent.innerHTML = model.alertText;

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'mcy-simplified-header__alert-close';
    closeButton.setAttribute('aria-label', 'Dismiss alert');
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => alert.remove());

    alert.append(alertIcon, alertContent, closeButton);
    block.append(alert);
  }
}
