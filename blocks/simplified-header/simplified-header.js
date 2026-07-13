import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
 
const DEFAULT_LOGO_SRC = '/blocks/simplified-header/MercyColorLogo.svg';
const DEFAULT_LOGO_TITLE = 'Home';
const DEFAULT_LOGO_LINK = '/';
const DEFAULT_TAGLINE = 'Your life is our life\'s work.';
const DEFAULT_ALERT_ARIA_LABEL = 'Dismiss alert';

const BOOLEAN_TRUE_RE = /^(?:true|yes|on|enabled|checked|1)$/;
const BOOLEAN_FALSE_RE = /^(?:false|no|off|0|disabled|unchecked)$/;
const BOOLEAN_TEXT_RE = /^(?:true|false|yes|no|on|off|enabled|disabled|checked|unchecked|1|0)$/i;
const ALERT_COLOR_RE = /halert-(?:primary|danger|warning)|high alert|normal alert|generic/i;
 
function getValueCell(row) {
  if (!row) {
    return null;
  }

  const cells = [...row.children];
  return cells.length ? cells[cells.length - 1] : row;
}

function getRowText(row) {
  const cell = getValueCell(row);
  return cell ? (cell.textContent || '').trim() : '';
}

function getRowHtml(row) {
  const cell = getValueCell(row);
  return cell ? cell.innerHTML.trim() : '';
}

function getRowLink(row, fallback = '') {
  const cell = getValueCell(row);
  if (!cell) {
    return fallback;
  }

  const anchor = cell.querySelector('a[href]');
  if (anchor) {
    const href = anchor.getAttribute('href');
    return href ? href.trim() : fallback;
  }

  const text = (cell.textContent || '').trim();
  return text || fallback;
}

function getRowBoolean(row, fallback = false) {
  if (!row) return fallback;

  // UE boolean fields carry data-aue-value directly on the element.
  const aueVal = (row.getAttribute('data-aue-value') || '').trim().toLowerCase();
  if (aueVal === 'true') return true;
  if (aueVal === 'false') return false;

  const cell = getValueCell(row);
  if (!cell) return fallback;

  // Also check data-aue-value on any nested element.
  const aueValEl = row.querySelector('[data-aue-value]');
  if (aueValEl) {
    const val = (aueValEl.getAttribute('data-aue-value') || '').trim().toLowerCase();
    if (val === 'true') return true;
    if (val === 'false') return false;
  }

  const checkbox = cell.querySelector('input[type="checkbox"]');
  if (checkbox) return checkbox.checked;

  const ariaChecked = cell.querySelector('[aria-checked]')?.getAttribute('aria-checked');
  if (ariaChecked === 'true' || ariaChecked === 'false') return ariaChecked === 'true';

  const text = (cell.textContent || row.textContent || '').trim().toLowerCase();
  if (BOOLEAN_TRUE_RE.test(text)) return true;
  if (BOOLEAN_FALSE_RE.test(text)) return false;

  return fallback;
}

function getRowPicture(row) {
  const cell = getValueCell(row);
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
  const src = (cell.textContent || '').trim();
  if (src && src.startsWith('/')) {
    return createOptimizedPicture(src, '', false, [{ width: '400' }]);
  }

  return null;
}

function rowHasImage(row) {
  const cell = getValueCell(row);
  return !!(cell && cell.querySelector('picture, img'));
}

// Universal Editor renders each field with instrumentation attributes that name
// the model property. Mapping rows by that name (instead of a fixed positional
// index) keeps parsing correct when optional fields are left empty and omitted.
function buildFieldMap(rows) {
  const map = {};

  rows.forEach((row) => {
    const propEl = row.matches('[data-aue-prop], [data-richtext-prop]')
      ? row
      : row.querySelector('[data-aue-prop], [data-richtext-prop]');

    if (!propEl) {
      return;
    }

    const prop = propEl.getAttribute('data-aue-prop') || propEl.getAttribute('data-richtext-prop');
    if (prop && !(prop in map)) {
      // Store propEl (the element that carries data-aue-value / data-aue-type)
      // not the outer row, so value attributes are always directly accessible.
      map[prop] = propEl;
    }
  });

  return map;
}

function getPictureFromSource(src, alt = '') {
  if (!src) {
    return null;
  }
 
  return createOptimizedPicture(src, alt, false, [{ width: '400' }]);
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

function rowIsBoolean(row) {
  const cell = getValueCell(row);
  if (!cell) return false;
  if (cell.querySelector('input[type="checkbox"], [aria-checked]')) return true;
  return BOOLEAN_TEXT_RE.test(getRowText(row));
}

function rowIsAlertColor(row) {
  if (rowHasImage(row)) return false;
  const text = getRowText(row);
  return text.length <= 40 && ALERT_COLOR_RE.test(text);
}

// Fallback for published pages that carry no Universal Editor instrumentation.
// Images are matched by order, alert fields by their distinctive signatures, and
// the remaining plain-text rows are assigned relative to those anchors.
function readModelByPosition(rows) {
  const imageRows = rows.filter(rowHasImage);
  const logoRow = imageRows[0] || null;
  const coBrandingRow = imageRows[1] || null;

  const booleanRow = rows.find(rowIsBoolean) || null;
  const colorRow = rows.find(rowIsAlertColor) || null;

  const indexOfRow = (row) => (row ? rows.indexOf(row) : -1);
  const coBrandingIndex = indexOfRow(coBrandingRow);
  const booleanIndex = indexOfRow(booleanRow);
  const colorIndex = indexOfRow(colorRow);

  const alertAnchors = [booleanIndex, colorIndex].filter((i) => i >= 0);
  const alertSectionStart = alertAnchors.length ? Math.min(...alertAnchors) : rows.length;
  const alertTextStart = Math.max(booleanIndex, colorIndex);

  const isPlainTextRow = (row) => !rowHasImage(row) && !rowIsBoolean(row) && !rowIsAlertColor(row);

  const primaryBoundary = coBrandingIndex >= 0 ? coBrandingIndex : alertSectionStart;
  const primaryTextRows = rows.filter((row, i) => i < primaryBoundary && isPlainTextRow(row));

  const coBrandingTextRows = coBrandingIndex >= 0
    ? rows.filter((row, i) => i > coBrandingIndex && i < alertSectionStart && isPlainTextRow(row))
    : [];

  const alertTextRow = rows.find((row, i) => i > alertTextStart && isPlainTextRow(row)) || null;

  return {
    logoPicture: getRowPicture(logoRow),
    logoLinkURL: getRowLink(primaryTextRows[0], DEFAULT_LOGO_LINK),
    logoTitle: getRowText(primaryTextRows[1]) || DEFAULT_LOGO_TITLE,
    coBrandingLogoPicture: getRowPicture(coBrandingRow),
    coBrandingLogoLinkURL: getRowLink(coBrandingTextRows[0], ''),
    coBrandingLogoTitle: getRowText(coBrandingTextRows[1]),
    alertEnabled: booleanRow ? getRowBoolean(booleanRow, false) : false,
    alertColor: normalizeAlertColor(getRowText(colorRow)),
    alertText: getRowHtml(alertTextRow) || getRowText(alertTextRow),
  };
}

function readModel(block) {
  const rows = [...block.children].filter((child) => child instanceof HTMLDivElement);
  const fieldMap = buildFieldMap(rows);

  let data;
  if (Object.keys(fieldMap).length) {
    // Universal Editor: map each row by its instrumented property name so empty
    // optional fields never shift the fields that follow them.
    data = {
      logoPicture: getRowPicture(fieldMap.logo),
      logoLinkURL: getRowLink(fieldMap.logoLinkURL, DEFAULT_LOGO_LINK),
      logoTitle: getRowText(fieldMap.logoTitle) || DEFAULT_LOGO_TITLE,
      coBrandingLogoPicture: getRowPicture(fieldMap.coBrandingLogo),
      coBrandingLogoLinkURL: getRowLink(fieldMap.coBrandingLogoLinkURL, ''),
      coBrandingLogoTitle: getRowText(fieldMap.coBrandingLogoTitle),
      alertEnabled: getRowBoolean(fieldMap.enableAlert, false),
      alertColor: normalizeAlertColor(getRowText(fieldMap.alertColor)),
      alertText: getRowHtml(fieldMap.alertText) || getRowText(fieldMap.alertText),
    };
  } else {
    data = readModelByPosition(rows);
  }

  if (!data.logoPicture) {
    data.logoPicture = getPictureFromSource(DEFAULT_LOGO_SRC, DEFAULT_LOGO_TITLE);
  }

  // --- debug: dump all block rows + enableAlert details ---
  // eslint-disable-next-line no-console
  console.log('[simplified-header] fieldMap keys:', Object.keys(fieldMap));
  // eslint-disable-next-line no-console
  console.log('[simplified-header] ALL block rows HTML:', rows.map((r) => r.outerHTML));
  const enableAlertEl = fieldMap.enableAlert;
  // eslint-disable-next-line no-console
  console.log('[simplified-header] enableAlert el:', enableAlertEl ? {
    outerHTML: enableAlertEl.outerHTML,
    textContent: JSON.stringify(enableAlertEl.textContent?.trim()),
    'data-aue-value': enableAlertEl.getAttribute('data-aue-value'),
    'data-aue-type': enableAlertEl.getAttribute('data-aue-type'),
  } : 'NOT FOUND');
  // --- end debug ---

  // eslint-disable-next-line no-console
  console.log('[simplified-header] alert content:', {
    alertEnabled: data.alertEnabled,
    alertColor: data.alertColor,
    alertText: data.alertText,
  });

  return data;
}
 
function buildLogoWrapper({
  picture,
  alt,
  link,
  wrapperClass,
  logoClass,
  imageModifierClass = '',
}) {
  if (!picture) {
    return null;
  }
 
  const img = picture.querySelector('img');
  if (img) {
    img.classList.add(logoClass);
    if (imageModifierClass) {
      img.classList.add(imageModifierClass);
    }
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
 
function buildAlert(model) {
  const alert = document.createElement('aside');
  alert.className = `mcy-simplified-header__alert ${model.alertColor}`;
  alert.setAttribute('role', 'region');
  alert.setAttribute('aria-live', 'polite');
 
  const alertInner = document.createElement('div');
  alertInner.className = 'mcy-simplified-header__alert-inner';
 
  const icon = document.createElement('span');
  icon.className = 'mcy-simplified-header__alert-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '!';
 
  const alertContent = document.createElement('div');
  alertContent.className = 'mcy-simplified-header__alert-content';
  alertContent.innerHTML = model.alertText;
 
  const closeButton = document.createElement('button');
  closeButton.className = 'mcy-simplified-header__alert-close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', DEFAULT_ALERT_ARIA_LABEL);
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', () => {
    alert.remove();
  });
 
  alertInner.append(icon, alertContent, closeButton);
  alert.append(alertInner);
 
  return alert;
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
 
  const inner = document.createElement('div');
  inner.className = 'mcy-simplified-header__inner';
 
  const content = document.createElement('div');
  content.className = 'mcy-simplified-header__content';
 
  const logos = document.createElement('div');
  logos.className = 'mcy-simplified-header__logos';
 
  const primaryLogo = buildLogoWrapper({
    picture: model.logoPicture,
    alt: model.logoTitle,
    link: model.logoLinkURL,
    wrapperClass: 'mcy-simplified-header__logo-wrapper mcy-simplified-header__logo-wrapper--primary',
    logoClass: 'mcy-simplified-header__logo',
    imageModifierClass: 'mcy-simplified-header__logo-image--primary',
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
      imageModifierClass: 'mcy-simplified-header__logo-image--co-branding',
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
 
  inner.append(content);
  root.append(inner);
  block.append(root);
 
  if (model.alertEnabled && model.alertText) {
    const alertEl = buildAlert(model);
    const wrapper = block.closest('.simplified-header-wrapper');
    if (wrapper) {
      wrapper.insertAdjacentElement('afterend', alertEl);
    } else {
      block.append(alertEl);
    }
  }
}