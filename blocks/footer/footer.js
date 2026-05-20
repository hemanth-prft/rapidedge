export default async function decorate(block) {
  block.innerHTML = `
    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <a href="/" class="footer-logo" aria-label="Mercy Home">
            <img src="/blocks/footer/reversedLogo.png" alt="Mercy" class="footer-logo-img">
          </a>
          <address class="footer-address">
            1200 N. One Mile Road<br>
            Dexter, MO&nbsp; 63841<br>
            (573) 624-5566
          </address>
          <div class="footer-social">
            <a href="https://www.facebook.com/mercy" aria-label="Facebook" class="footer-social-link" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://twitter.com/mercy" aria-label="Twitter" class="footer-social-link" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.youtube.com/mercy" aria-label="YouTube" class="footer-social-link" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
            </a>
            <a href="https://www.linkedin.com/company/mercy" aria-label="LinkedIn" class="footer-social-link" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>
        <nav class="footer-nav" aria-label="Footer Navigation">
          <ul class="footer-nav-col">
            <li><a href="/about-mymercy">About MyMercy</a></li>
            <li><a href="/billing-payment">Billing &amp; Payment</a></li>
            <li><a href="/careers">Careers</a></li>
            <li><a href="/health-information">Health Information</a></li>
            <li><a href="/notice-of-privacy-practices">Notice of Privacy Practices</a></li>
            <li><a href="/schedule-appointment">Schedule an Appointment</a></li>
          </ul>
          <ul class="footer-nav-col">
            <li><a href="/donate">Donate</a></li>
            <li><a href="/price-transparency">Price Transparency</a></li>
            <li><a href="/health-care-education">Health Care Education</a></li>
            <li><a href="/newsroom">Newsroom</a></li>
            <li><a href="/nondiscrimination-notice">Nondiscrimination Notice</a></li>
          </ul>
          <ul class="footer-nav-col">
            <li><a href="/cost-estimate">Cost Estimate</a></li>
            <li><a href="/community-benefit">Community Benefit</a></li>
            <li><a href="/patients-visitors">Patients &amp; Visitors</a></li>
            <li><a href="/provider-portal">Provider Portal</a></li>
            <li><a href="/vendor-resources">Vendor Resources</a></li>
          </ul>
        </nav>
      </div>
      <hr class="footer-divider">
      <div class="footer-languages">
        <a href="#">&#4768;&#4635;&#4653;&#4763; (Amharic)</a><span class="footer-sep"> | </span>
        <a href="#">Fran&#231;ais (French)</a><span class="footer-sep"> | </span>
        <a href="#">Deutsch (German)</a><span class="footer-sep"> | </span>
        <a href="#">&#54620;&#44397;&#50612; (Korean)</a><span class="footer-sep"> | </span>
        <a href="#">Portugu&#234;s (Portuguese)</a><span class="footer-sep"> | </span>
        <a href="#">&#1056;&#1091;&#1089;&#1089;&#1082;&#1080;&#1081; (Russian)</a><span class="footer-sep"> | </span>
        <a href="#">Srpsko-hrvatski (Serbian/Croatian)</a><span class="footer-sep"> | </span>
        <a href="#">Espa&#241;ol (Spanish)</a><span class="footer-sep"> | </span>
        <a href="#">Tagalog - Tagalog</a><span class="footer-sep"> | </span>
        <a href="#">Ti&#7871;ng Vi&#7879;t (Vietnamese)</a><span class="footer-sep"> | </span>
        <a href="#">Hindi - &#2361;&#2367;&#2306;&#2342;&#2368;</a><span class="footer-sep"> | </span>
        <a href="#">Lao - &#x0E9E;&#x0EB2;&#x0EAA;&#x0EB2;&#x0EA5;&#x0EB2;&#x0EA7;</a><span class="footer-sep"> | </span>
        <a href="#">Bosnian - Bosanski</a><span class="footer-sep"> | </span>
        <a href="#">Greek - &#917;&#955;&#955;&#951;&#957;&#953;&#954;&#940;</a><span class="footer-sep"> | </span>
        <a href="#">Marshallese - Kajin Maj&#244;l</a><span class="footer-sep"> | </span>
        <a href="#">Swahili - Kiswahili</a><span class="footer-sep"> | </span>
        <a href="#">Oromo - Afaan Oromoo</a><span class="footer-sep"> | </span>
        <a href="#">Polish - Polski</a><span class="footer-sep"> | </span>
        <a href="#">Hmong - Hmoob</a><span class="footer-sep"> | </span>
        <a href="#">Chinese ZHS - &#31616;&#20307;&#20013;&#25991;</a><span class="footer-sep"> | </span>
        <a href="#">Farsi - &#1601;&#1575;&#1585;&#1587;&#1740;</a><span class="footer-sep"> | </span>
        <a href="#">Urdu - &#1575;&#1585;&#1583;&#1608;</a><span class="footer-sep"> | </span>
        <a href="#">Thai - &#3652;&#3607;&#3618;</a><span class="footer-sep"> | </span>
        <a href="#">Cherokee - &#5091;&#5248;&#5261;</a><span class="footer-sep"> | </span>
        <a href="#">Arabic - &#1575;&#1604;&#1593;&#1585;&#1576;&#1610;&#1577;</a><span class="footer-sep"> | </span>
        <a href="#">Burmese - &#4121;&#4156;&#4116;&#4154;&#4121;&#4140;</a><span class="footer-sep"> | </span>
        <a href="#">Gujarati - &#2711;&#2753;&#2716;&#2736;&#2750;&#2724;&#2752;</a><span class="footer-sep"> | </span>
        <a href="#">Japanese - &#26085;&#26412;&#35486;</a><span class="footer-sep"> | </span>
        <a href="#">Italian - Italiano</a>
      </div>
      <div class="footer-legal">
        <a href="/sitemap">Sitemap</a>
        <span class="footer-sep"> | </span>
        <a href="/terms-privacy">Terms &amp; Privacy</a>
        <span class="footer-sep"> | </span>
        <a href="/21st-century-cures-act">21st Century Cures Act</a>
        <span class="footer-sep"> | </span>
        <span>&#169; 2026 Mercy</span>
      </div>
    </div>
  `;
}
