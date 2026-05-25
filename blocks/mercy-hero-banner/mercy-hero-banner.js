export default function decorate(block) {
  const rows = [...block.children];

  // Extract content from block rows
  const imageRow = rows[0]; // First row: hero image
  const textRow = rows[1]; // Second row: text content (heading + buttons)

  // Build hero structure
  const heroContent = document.createElement('div');
  heroContent.className = 'mercy-hero-banner-content';

  const heroImageWrap = document.createElement('div');
  heroImageWrap.className = 'mercy-hero-banner-image-wrap';

  // Process image
  if (imageRow) {
    const picture = imageRow.querySelector('picture');
    if (picture) {
      heroImageWrap.appendChild(picture);
    }
  }

  // Process text content
  if (textRow) {
    const cols = [...textRow.children];
    const textContent = cols[0] || textRow;

    // Move heading
    const heading = textContent.querySelector('h1, h2, h3');
    if (heading) {
      // Style "of" in teal if not already wrapped in em
      if (!heading.querySelector('em')) {
        heading.innerHTML = heading.innerHTML.replace(
          /\bof\b/,
          '<em>of <br>health care is here.</em>',
        );
      }
      heroContent.appendChild(heading);
    }

    // Extract buttons/links
    const buttonContainers = textContent.querySelectorAll('.button-container');
    if (buttonContainers.length > 0) {
      const quickLinks = document.createElement('div');
      quickLinks.className = 'mercy-hero-banner-quick-links';
      buttonContainers.forEach((container) => {
        quickLinks.appendChild(container);
      });
      heroContent.appendChild(quickLinks);
    } else {
      // Fallback: look for links in paragraphs
      const links = textContent.querySelectorAll('p a');
      if (links.length > 0) {
        const quickLinks = document.createElement('div');
        quickLinks.className = 'mercy-hero-banner-quick-links';
        links.forEach((link) => {
          link.classList.add('button');
          const wrapper = document.createElement('p');
          wrapper.className = 'button-container';
          wrapper.appendChild(link.cloneNode(true));
          quickLinks.appendChild(wrapper);
        });
        heroContent.appendChild(quickLinks);
      }
    }
  }

  // Add default quick links if none found in content
  if (!heroContent.querySelector('.mercy-hero-banner-quick-links')) {
    const defaultLinks = [
      { text: 'Book appointment', url: '#' },
      { text: 'Urgent care near me', url: '#' },
      { text: 'Pay my bill', url: '#' },
      { text: 'Virtual care', url: '#' },
      { text: 'Find a doctor', url: '#' },
    ];
    const quickLinks = document.createElement('div');
    quickLinks.className = 'mercy-hero-banner-quick-links';
    defaultLinks.forEach(({ text, url }) => {
      const wrapper = document.createElement('p');
      wrapper.className = 'button-container';
      const link = document.createElement('a');
      link.href = url;
      link.className = 'button';
      link.textContent = text;
      wrapper.appendChild(link);
      quickLinks.appendChild(wrapper);
    });
    heroContent.appendChild(quickLinks);
  }

  // Add AI search bar
  const searchBar = document.createElement('div');
  searchBar.className = 'mercy-hero-banner-search';
  searchBar.innerHTML = `
    <div class="mercy-hero-banner-search-inner">
      <span class="mercy-hero-banner-search-ai-icon">
        <img src="/icons/ColourfulStars.svg" alt="" width="20" height="20" loading="lazy"/>
      </span>
      <input type="text" class="mercy-hero-banner-search-input" placeholder="Ask anything about your health or our services..." aria-label="Search health services"/>
      <button class="mercy-hero-banner-search-btn" type="button">Search <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
    </div>
    <p class="mercy-hero-banner-search-caption">
      <img src="/icons/GrayStars.svg" alt="" width="14" height="14" loading="lazy"/>
      Powered by AI to help you find the right care, faster
    </p>
  `;
  heroContent.appendChild(searchBar);

  // Add decorative cross
  const crossDecor = document.createElement('div');
  crossDecor.className = 'mercy-hero-banner-cross-decor';
  crossDecor.innerHTML = '<img src="/icons/mercy-cross.svg" alt="" aria-hidden="true" loading="lazy"/>';

  // Clear block and rebuild
  block.textContent = '';
  block.appendChild(heroContent);
  block.appendChild(heroImageWrap);
  block.appendChild(crossDecor);
}
