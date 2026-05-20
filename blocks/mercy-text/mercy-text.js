import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Extracts the AEM content path from the block's data-aue-resource attribute.
 * @param {Element} block
 * @returns {string|null}
 */
function getContentPath(block) {
  const resource = block.getAttribute('data-aue-resource');
  if (!resource) return null;
  const match = resource.match(/urn:aemconnection:(.+)/);
  return match ? match[1] : null;
}

/**
 * Fetches block model properties from AEM's JSON endpoint.
 * @param {string} path
 * @returns {Promise<object|null>}
 */
async function fetchBlockProperties(path) {
  try {
    const resp = await fetch(`${path}.json`);
    if (resp.ok) {
      return resp.json();
    }
  } catch (e) {
    // silent fail
  }
  return null;
}

export default async function decorate(block) {
  let text = '';
  let fontSize = '12px';
  let fontWeight = '500';
  let lineHeight = '100%';
  let letterSpacing = '-5%';
  let color = '#9BABB1';
  let alignment = 'left';

  const row = block.children[0];

  // Try reading from block table rows (standard EDS delivery)
  if (row && row.children && row.children.length > 0) {
    const cols = [...row.children];
    text = cols[0]?.innerHTML?.trim() || '';
    fontSize = cols[1]?.textContent?.trim() || '12px';
    fontWeight = cols[2]?.textContent?.trim() || '500';
    const stylesRaw = cols[3]?.textContent?.trim() || '100%, -5%, #9BABB1, left';
    const parts = stylesRaw.split(',').map((s) => s.trim());
    lineHeight = parts[0] || '100%';
    letterSpacing = parts[1] || '-5%';
    color = parts[2] || '#9BABB1';
    alignment = parts[3] || 'left';
  } else {
    // Fallback: fetch properties from AEM resource (Universal Editor / xwalk)
    const contentPath = getContentPath(block);
    if (contentPath) {
      const props = await fetchBlockProperties(contentPath);
      if (props) {
        text = props.content || '';
        fontSize = props.fontSize || '12px';
        fontWeight = props.fontWeight || '500';
        const stylesRaw = props.styles || '100%, -5%, #9BABB1, left';
        const parts = stylesRaw.split(',').map((s) => s.trim());
        lineHeight = parts[0] || '100%';
        letterSpacing = parts[1] || '-5%';
        color = parts[2] || '#9BABB1';
        alignment = parts[3] || 'left';
      }
    }
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'mercy-text-content';
  wrapper.innerHTML = text;
  if (row) moveInstrumentation(row, wrapper);

  wrapper.style.fontSize = fontSize;
  wrapper.style.fontWeight = fontWeight;
  wrapper.style.lineHeight = lineHeight;
  wrapper.style.letterSpacing = letterSpacing;
  wrapper.style.color = color;
  wrapper.style.textAlign = alignment;

  block.textContent = '';
  block.append(wrapper);
}
