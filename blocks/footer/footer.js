import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Marks the last paragraph in the brand section that contains icon/image links as social links.
 * @param {Element} brandSection
 */
function decorateBrandSection(brandSection) {
  brandSection.classList.add('footer-brand');
  const paragraphs = [...brandSection.querySelectorAll(':scope > p, :scope > .default-content-wrapper > p')];
  paragraphs.forEach((p) => {
    if (p.querySelector('a .icon, a img')) {
      p.classList.add('footer-social');
    }
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  const sections = [...footer.querySelectorAll(':scope > .section')];

  // Wrap brand (section 0) and nav (section 1) in a top row
  if (sections.length >= 2) {
    const topRow = document.createElement('div');
    topRow.classList.add('footer-top-row');
    sections[0].parentNode.insertBefore(topRow, sections[0]);
    topRow.append(sections[0]);
    topRow.append(sections[1]);
    decorateBrandSection(sections[0]);
    sections[1].classList.add('footer-nav');
  } else if (sections[0]) {
    decorateBrandSection(sections[0]);
  }

  if (sections[2]) sections[2].classList.add('footer-languages');
  if (sections[3]) sections[3].classList.add('footer-legal');

  block.append(footer);
}
