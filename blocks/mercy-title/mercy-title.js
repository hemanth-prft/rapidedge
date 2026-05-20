import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Extracts the AEM content path from the block's data-aue-resource attribute.
 * @param {Element} block
 * @returns {string|null}
 */
function getContentPath(block) {
  const resource = block.getAttribute('data-aue-resource');
  if (!resource) return null;
  // urn:aemconnection:/content/...
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
  let titleText = '';
  let tag = 'h2';
  let style = 'large-teal';
  let alignment = 'left';

  const row = block.children[0];

  // Try reading from block table rows (standard EDS delivery)
  if (row && row.children && row.children.length > 0) {
    const cols = [...row.children];
    titleText = cols[0]?.textContent?.trim() || '';
    tag = cols[1]?.textContent?.trim()?.toLowerCase() || 'h2';
    style = cols[2]?.textContent?.trim() || 'large-teal';
    alignment = cols[3]?.textContent?.trim() || 'left';
  } else {
    // Fallback: fetch properties from AEM resource (Universal Editor / xwalk)
    const contentPath = getContentPath(block);
    if (contentPath) {
      const props = await fetchBlockProperties(contentPath);
      if (props) {
        titleText = props.title || '';
        tag = (props.tag || 'h2').toLowerCase();
        style = props.style || 'large-teal';
        alignment = props.alignment || 'left';
      }
    }
  }

  const heading = document.createElement(tag.match(/^h[1-6]$/) ? tag : 'h2');
  heading.className = `mercy-title-heading mercy-title-${style}`;
  heading.textContent = titleText;
  if (row) moveInstrumentation(row, heading);

  if (alignment && alignment !== 'left') {
    heading.style.textAlign = alignment;
  }

  block.textContent = '';
  block.append(heading);
}
