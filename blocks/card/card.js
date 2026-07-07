import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const rows = [...block.children];

  const getText = (row) => row?.querySelector('div')?.textContent?.trim() || '';
  const getHref = (row) => row?.querySelector('a')?.href || getText(row);

  const imageRow = rows[0];
  const title = getText(rows[1]);
  const link = getHref(rows[2]);

  block.textContent = '';

  const wrapper = document.createElement('a');
  wrapper.className = 'card-link';
  wrapper.href = link || '#';

  const iconDiv = document.createElement('div');
  iconDiv.className = 'card-icon';

  const img = imageRow?.querySelector('img');
  if (img) {
    const optimizedPic = createOptimizedPicture(img.src, img.alt || title, false, [{ width: '120' }]);
    iconDiv.append(optimizedPic);
  }

  const titleDiv = document.createElement('div');
  titleDiv.className = 'card-title';
  const p = document.createElement('p');
  p.textContent = title;
  titleDiv.append(p);

  wrapper.append(iconDiv, titleDiv);
  block.append(wrapper);
}
