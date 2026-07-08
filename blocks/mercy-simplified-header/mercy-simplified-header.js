export default function decorate(block) {
  block.innerHTML = `
    <div class="mercy-simplified-header-content">
      <div class="mercy-simplified-header-logos">
        <div class="mercy-simplified-header-logo-wrapper">
          <a class="mercy-simplified-header-logo" href="/" aria-label="Mercy Home">
            <img src="/icons/MercyLogo.svg" alt="Mercy" width="160" height="60" />
          </a>
        </div>
      </div>
      <p class="mercy-simplified-header-tagline">Your life is our life&rsquo;s work.</p>
    </div>
  `;
}
