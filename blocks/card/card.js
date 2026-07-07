export default function decorate(block) {
  const rows = [...block.children];

  const ul = document.createElement('ul');

  rows.forEach((row) => {
    const cols = [...row.children];
    const getText = (col) => col?.textContent?.trim() || '';
    const getHref = (col) => col?.querySelector('a')?.href || getText(col);

    const imageCol = cols[0];
    const title = getText(cols[1]);
    const link = getHref(cols[2]);

    const li = document.createElement('li');
    const wrapper = document.createElement('a');
    wrapper.className = 'card-link';
    wrapper.href = link || '#';

    const iconDiv = document.createElement('div');
    iconDiv.className = 'card-icon';

    const existingImg = imageCol?.querySelector('img');
    if (existingImg) {
      existingImg.alt = existingImg.alt || title;
      existingImg.loading = 'lazy';
      iconDiv.append(existingImg);
    } else {
      const imgUrl = getText(imageCol);
      if (imgUrl && (imgUrl.startsWith('http') || imgUrl.startsWith('/'))) {
        const img = document.createElement('img');
        img.src = imgUrl;
        img.alt = title;
        img.loading = 'lazy';
        iconDiv.append(img);
      }
    }

    const titleDiv = document.createElement('div');
    titleDiv.className = 'card-title';
    const p = document.createElement('p');
    p.textContent = title;
    titleDiv.append(p);

    wrapper.append(iconDiv, titleDiv);
    li.append(wrapper);
    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}
