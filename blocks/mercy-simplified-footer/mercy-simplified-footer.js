export default function decorate(block) {
  const currentYear = new Date().getFullYear();

  block.innerHTML = `
    <div class="mercy-simplified-footer-content">
      <div class="mercy-simplified-footer-section">
        <a class="mercy-simplified-footer-logo" href="/" aria-label="Mercy Home">
          <img src="/blocks/footer/reversedLogo.png" alt="Mercy" />
        </a>
      </div>
      <div class="mercy-simplified-footer-links">
        <ul class="mercy-simplified-footer-list">
          <li class="mercy-simplified-footer-item">
            <span class="mercy-simplified-footer-copyright">Mercy, St. Louis</span>
          </li>
          <li class="mercy-simplified-footer-item">
            <span class="mercy-simplified-footer-copyright">615 South New Ballas Road</span>
          </li>
          <li class="mercy-simplified-footer-item">
            <span class="mercy-simplified-footer-copyright">Saint Louis, Missouri 63141</span>
          </li>
        </ul>
        <ul class="mercy-simplified-footer-list">
          <li class="mercy-simplified-footer-item">
            <a class="mercy-simplified-footer-link" href="https://www.mercy.net/about/legal-notices/">Terms &amp; Privacy</a>
          </li>
          <li class="mercy-simplified-footer-item">
            <p class="mercy-simplified-footer-copyright">&copy; ${currentYear} Mercy</p>
          </li>
        </ul>
      </div>
    </div>
  `;
}
