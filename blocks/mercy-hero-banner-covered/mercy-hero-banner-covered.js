export default function decorate(block) {
  const picture = block.querySelector('picture') || block.querySelector('img');

  block.textContent = '';

  if (picture) {
    block.appendChild(picture);
  }
}
