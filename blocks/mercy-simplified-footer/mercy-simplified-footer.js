export default function decorate(block) {
  const currentYear = new Date().getFullYear();

  block.innerHTML = `
    <div class="mercy-simplified-footer__content">
      <div class="mercy-simplified-footer__section">
        <a class="mercy-simplified-footer__logo" href="/" aria-label="Mercy Home">
          <img src="/blocks/footer/reversedLogo.png" alt="Mercy" />
        </a>
      </div>
      <div class="mercy-simplified-footer__links">
        <ul class="mercy-simplified-footer__list">
          <li class="mercy-simplified-footer__item">
            <span class="mercy-simplified-footer__copyright">Mercy, St. Louis</span>
          </li>
          <li class="mercy-simplified-footer__item">
            <span class="mercy-simplified-footer__copyright">615 South New Ballas Road</span>
          </li>
          <li class="mercy-simplified-footer__item">
            <span class="mercy-simplified-footer__copyright">Saint Louis, Missouri 63141</span>
          </li>
        </ul>
        <ul class="mercy-simplified-footer__list">
          <li class="mercy-simplified-footer__item">
            <a class="mercy-simplified-footer__link" href="https://www.mercy.net/about/legal-notices/">Terms &amp; Privacy</a>
          </li>
          <li class="mercy-simplified-footer__item">
            <p class="mercy-simplified-footer__copyright">&copy; ${currentYear} Mercy</p>
          </li>
        </ul>
      </div>
    </div>
  `;
}
