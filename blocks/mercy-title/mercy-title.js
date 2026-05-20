import { moveInstrumentation } from '../../scripts/scripts.js';

function getContentPath(block) {
  const resource = block.getAttribute('data-aue-resource');
  if (!resource) return null;
  const match = resource.match(/urn:aemconnection:(.+)/);
  return match ? match[1] : null;
}

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

/**
 * Reads model properties from the block using multiple strategies:
 * 1. data-aue-prop attributes (Universal Editor inline mode)
 * 2. Table row/columns (standard EDS delivery)
 * 3. Fetch from AEM JSON API (fallback)
 */
async function getBlockProperties(block) {
  const defaults = {
    title: '', tag: 'h2', style: 'large-teal', alignment: 'left',
  };

  // Strategy 1: Read from data-aue-prop attributes (UE editor mode)
  const propElements = block.querySelectorAll('[data-aue-prop]');
  if (propElements.length > 0) {
    const props = { ...defaults };
    propElements.forEach((el) => {
      const propName = el.getAttribute('data-aue-prop');
      const value = el.textContent.trim();
      if (propName && value) props[propName] = value;
    });
    return props;
  }

  // Strategy 2: Read from table columns (standard EDS delivery)
  const row = block.children[0];
  const cols = row ? [...row.children] : [];
  const hasContent = cols.length > 1 && cols.some((col) => col.textContent.trim() !== '');
  if (hasContent) {
    return {
      title: cols[0]?.textContent.trim() || defaults.title,
      tag: cols[1]?.textContent.trim().toLowerCase() || defaults.tag,
      style: cols[2]?.textContent.trim() || defaults.style,
      alignment: cols[3]?.textContent.trim() || defaults.alignment,
    };
  }

  // Strategy 3: Fetch from AEM JSON endpoint
  const contentPath = getContentPath(block);
  if (contentPath) {
    const props = await fetchBlockProperties(contentPath);
    if (props) {
      return {
        title: props.title || defaults.title,
        tag: (props.tag || defaults.tag).toLowerCase(),
        style: props.style || defaults.style,
        alignment: props.alignment || defaults.alignment,
      };
    }
  }

  return defaults;
}

export default async function decorate(block) {
  const props = await getBlockProperties(block);

  const style = props.style.replace(/\s+/g, '-').toLowerCase();
  const tag = /^h[1-6]$/.test(props.tag) ? props.tag : 'h2';

  const heading = document.createElement(tag);
  heading.className = `mercy-title-heading mercy-title-${style}`;
  heading.textContent = props.title;

  const row = block.children[0];
  if (row) moveInstrumentation(row, heading);

  if (props.alignment !== 'left') {
    heading.style.textAlign = props.alignment;
  }

  block.innerHTML = '';
  block.append(heading);
}
