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
  const cols = row ? [...row.children] : [];

  if (cols[0]?.innerHTML?.trim()) {
    // Standard EDS / Franklin delivery: richtext content is always in cols[0].
    // Style overrides (fontSize, fontWeight, styles) are optional extra columns —
    // only present when the author explicitly set them; fall back to defaults otherwise.
    text = cols[0].innerHTML.trim();
    if (cols[1]?.textContent?.trim()) fontSize = cols[1].textContent.trim();
    if (cols[2]?.textContent?.trim()) fontWeight = cols[2].textContent.trim();
    const stylesRaw = cols[3]?.textContent?.trim();
    if (stylesRaw) {
      const parts = stylesRaw.split(',').map((s) => s.trim());
      [lineHeight, letterSpacing, color, alignment] = [
        parts[0] || lineHeight,
        parts[1] || letterSpacing,
        parts[2] || color,
        parts[3] || alignment,
      ];
    }
  } else {
    // Fallback: fetch properties from AEM resource (UE / xwalk context where
    // field values are not rendered inline by the delivery endpoint).
    const contentPath = getContentPath(block);
    if (contentPath) {
      const props = await fetchBlockProperties(contentPath);
      if (props) {
        text = props.content || '';
        if (props.fontSize) fontSize = props.fontSize;
        if (props.fontWeight) fontWeight = props.fontWeight;
        const stylesRaw = props.styles;
        if (stylesRaw) {
          const parts = stylesRaw.split(',').map((s) => s.trim());
          [lineHeight, letterSpacing, color, alignment] = [
            parts[0] || lineHeight,
            parts[1] || letterSpacing,
            parts[2] || color,
            parts[3] || alignment,
          ];
        }
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
