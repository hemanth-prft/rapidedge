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

export default async function decorate(block) {
  let titleText = '';
  let tag = 'h2';
  let style = 'large-teal';
  let alignment = 'left';

  const row = block.children[0];
  const cols = row ? [...row.children] : [];

  const hasContent = cols.some((col) => col.textContent.trim() !== '');

  if (hasContent) {
    titleText = cols[0]?.textContent.trim() || '';
    tag = cols[1]?.textContent.trim().toLowerCase() || 'h2';
    style = cols[2]?.textContent.trim() || 'large-teal';
    alignment = cols[3]?.textContent.trim() || 'left';
  } else {
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

  style = style.replace(/\s+/g, '-').toLowerCase();

  const heading = document.createElement(/^h[1-6]$/.test(tag) ? tag : 'h2');
  heading.className = `mercy-title-heading mercy-title-${style}`;
  heading.textContent = titleText;

  if (row) moveInstrumentation(row, heading);

  if (alignment !== 'left') {
    heading.style.textAlign = alignment;
  }

  block.innerHTML = '';
  block.append(heading);
}