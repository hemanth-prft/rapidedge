import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const item = document.createElement('div');
    item.className = 'accordion-item';
    moveInstrumentation(row, item);

    const [titleDiv, bodyDiv] = row.children;

    const button = document.createElement('button');
    button.className = 'accordion-trigger';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('type', 'button');
    button.textContent = titleDiv ? titleDiv.textContent.trim() : '';

    const panel = document.createElement('div');
    panel.className = 'accordion-panel';
    panel.setAttribute('hidden', '');
    if (bodyDiv) panel.innerHTML = bodyDiv.innerHTML;

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      if (expanded) {
        panel.setAttribute('hidden', '');
      } else {
        panel.removeAttribute('hidden');
      }
    });

    item.append(button, panel);
    row.replaceWith(item);
  });
}
