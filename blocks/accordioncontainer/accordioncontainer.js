export default function decorate(block) {
  block.classList.add('accordion');

  [...block.children].forEach((row, index) => {
    const item = document.createElement('div');
    item.setAttribute('aria-expanded', 'false');

    const header = document.createElement('button');
    header.className = 'accordion-item-header';
    header.setAttribute('aria-expanded', 'false');
    header.setAttribute('aria-controls', `accordion-content-${index}`);

    const body = document.createElement('div');
    body.className = 'accordion-item-body';
    body.id = `accordion-content-${index}`;
    body.setAttribute('role', 'region');
    body.setAttribute('aria-labelledby', `accordion-header-${index}`);

    header.id = `accordion-header-${index}`;

    // Extract header text from first cell and body content from rest
    if (row.children.length > 0) {
      header.textContent = row.children[0].textContent;

      // Move remaining content to body
      for (let i = 1; i < row.children.length; i += 1) {
        body.append(row.children[i].cloneNode(true));
      }
    }

    // Add click handler for toggle
    header.addEventListener('click', (e) => {
      e.preventDefault();
      const isExpanded = item.getAttribute('aria-expanded') === 'true';
      item.setAttribute('aria-expanded', !isExpanded);
      header.setAttribute('aria-expanded', !isExpanded);
    });

    item.append(header, body);
    row.replaceWith(item);
  });
}
