/**
 * Mercy Video Block
 * Recreated from AEM Video Component
 * Supports Brightcove and YouTube video types with optional
 * sidebar text content, caption, and countdown timer.
 *
 * Brightcove account ID is read from:
 *   <meta name="brightcove-account-id" content="YOUR_ACCOUNT_ID">
 * in the page <head>.
 */

function getBrightcoveAccountId() {
  return (
    document.querySelector('meta[name="brightcove-account-id"]')?.content || ''
  );
}

function loadBrightcoveScript(accountId, playerId) {
  if (!accountId) return;
  const effectivePlayerId = playerId || 'default';
  const scriptSrc = `https://players.brightcove.net/${accountId}/${effectivePlayerId}_default/index.min.js`;
  if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
    const script = document.createElement('script');
    script.src = scriptSrc;
    document.head.appendChild(script);
  }
}

function createBrightcovePlayer(videoId, playlistId, playerId, autoplay, disableControls) {
  const videoEl = document.createElement('video-js');
  if (videoId) videoEl.dataset.videoId = videoId;
  if (playlistId) videoEl.dataset.playlistId = playlistId;
  videoEl.dataset.player = playerId || 'default';
  videoEl.dataset.embed = 'default';
  if (disableControls) {
    videoEl.dataset.controls = 'false';
  } else {
    videoEl.setAttribute('controls', '');
  }
  if (autoplay) {
    videoEl.setAttribute('autoplay', '');
    videoEl.setAttribute('muted', '');
  }
  videoEl.className = 'video-js';
  return videoEl;
}

function createYouTubePlayer(videoId, autoplay) {
  const container = document.createElement('div');
  container.className = 'mercy-video-youtube-wrap';
  const iframe = document.createElement('iframe');
  const params = new URLSearchParams({ rel: '0' });
  if (autoplay) {
    params.set('autoplay', '1');
    params.set('mute', '1');
  }
  iframe.src = `https://www.youtube.com/embed/${videoId}?${params}`;
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute(
    'allow',
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
  );
  iframe.title = 'YouTube video player';
  container.appendChild(iframe);
  return container;
}

function buildSidebar({
  title,
  subtitle,
  bodyText,
  footing,
  buttonText,
  buttonUrl,
  buttonDataAttribute,
  buttonIcon,
}) {
  const hasSidebar = title || subtitle || bodyText || footing || buttonText;
  if (!hasSidebar) return null;

  const sidebar = document.createElement('div');
  sidebar.className = 'widget-video-sidebar';

  if (title) {
    const el = document.createElement('h3');
    el.className = 'widget-video-title';
    el.textContent = title;
    sidebar.appendChild(el);
  }
  if (subtitle) {
    const el = document.createElement('p');
    el.className = 'widget-video-subtitle';
    el.textContent = subtitle;
    sidebar.appendChild(el);
  }
  if (bodyText) {
    const el = document.createElement('p');
    el.className = 'widget-video-body';
    el.textContent = bodyText;
    sidebar.appendChild(el);
  }
  if (footing) {
    const el = document.createElement('p');
    el.className = 'widget-video-footing';
    el.textContent = footing;
    sidebar.appendChild(el);
  }
  if (buttonText) {
    const btnWrap = document.createElement('p');
    btnWrap.className = 'button-container';
    const btn = document.createElement('a');
    btn.className = `button${buttonIcon ? ` button--icon-${buttonIcon}` : ''}`;
    btn.href = buttonUrl || '#';
    btn.textContent = buttonText;
    if (buttonDataAttribute) btn.dataset.attribute = buttonDataAttribute;
    btnWrap.appendChild(btn);
    sidebar.appendChild(btnWrap);
  }

  return sidebar;
}

function buildTimerOverlay({
  enabled,
  headerText,
  countdown,
  footerText,
  redirectUrl,
  dataAttribute,
  showButton,
  buttonText,
}) {
  if (!enabled) return null;

  const overlay = document.createElement('div');
  overlay.className = 'mercy-video-timer';
  if (redirectUrl) overlay.dataset.redirectUrl = redirectUrl;
  if (dataAttribute) overlay.dataset.timerAttribute = dataAttribute;

  if (headerText) {
    const el = document.createElement('p');
    el.className = 'mercy-video-timer-header';
    el.textContent = headerText;
    overlay.appendChild(el);
  }

  const countdownEl = document.createElement('span');
  countdownEl.className = 'mercy-video-timer-countdown';
  countdownEl.textContent = countdown || '0';
  overlay.appendChild(countdownEl);

  if (footerText) {
    const el = document.createElement('p');
    el.className = 'mercy-video-timer-footer';
    el.textContent = footerText;
    overlay.appendChild(el);
  }

  if (showButton && buttonText) {
    const btn = document.createElement('a');
    btn.className = 'button mercy-video-timer-btn';
    btn.href = redirectUrl || '#';
    btn.textContent = buttonText;
    overlay.appendChild(btn);
  }

  return overlay;
}

function startCountdown(timerEl, { countdown, redirectUrl }) {
  const countdownEl = timerEl.querySelector('.mercy-video-timer-countdown');
  if (!countdownEl) return;

  let seconds = parseInt(countdown, 10);
  if (Number.isNaN(seconds) || seconds <= 0) return;

  countdownEl.textContent = seconds;

  const interval = setInterval(() => {
    seconds -= 1;
    countdownEl.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(interval);
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }
  }, 1000);
}

export default function decorate(block) {
  const rows = [...block.children];
  const getText = (i) => rows[i]?.querySelector('div')?.textContent?.trim() || '';
  const getHtml = (i) => rows[i]?.querySelector('div')?.innerHTML?.trim() || '';
  const getBool = (i) => getText(i).toLowerCase() === 'true';
  const getLink = (i) => rows[i]?.querySelector('a')?.href || getText(i);

  // ── Video Info ──────────────────────────────────────────────────────────
  const videoType = getText(0) || 'brightcove';
  const videoId = getText(1);
  const playlistId = getText(2);
  const videoOrientation = getText(3);
  const portraitSize = getText(4);
  const playlistDirection = getText(5);
  const playerId = getText(6);

  // ── Options ─────────────────────────────────────────────────────────────
  const autoplay = getBool(7);
  const disableControls = getBool(8);

  // ── Appearance ──────────────────────────────────────────────────────────
  const videoTemplate = getText(9);
  const videoWidth = getText(10);
  const sidebarPosition = getText(11);

  // ── Text Content ────────────────────────────────────────────────────────
  const heading = getText(12);
  const title = getText(13);
  const subtitle = getText(14);
  const bodyText = getText(15);
  const footing = getText(16);
  const buttonText = getText(17);
  const buttonUrl = getLink(18);
  const buttonDataAttribute = getText(19);
  const buttonIcon = getText(20);

  // ── Caption ─────────────────────────────────────────────────────────────
  const captionHtml = getHtml(21);

  // ── Timer ────────────────────────────────────────────────────────────────
  const timerConfig = {
    enabled: getBool(22),
    headerText: getText(23),
    countdown: getText(24),
    footerText: getText(25),
    redirectUrl: getText(26),
    dataAttribute: getText(27),
    showButton: getBool(28),
    buttonText: getText(29),
  };

  // Clear authored content
  block.innerHTML = '';

  // Apply template data attribute on wrapper for SCSS targeting
  if (videoTemplate) {
    const container = block.closest('.mercy-video-container') || block;
    container.dataset.pageTpl = videoTemplate;
  }

  // Optional heading above video
  if (heading) {
    const h2 = document.createElement('h2');
    h2.className = 'widget-heading';
    h2.textContent = heading;
    block.appendChild(h2);
  }

  // ── Outer layout container ───────────────────────────────────────────────
  const outerEl = document.createElement('div');
  outerEl.className = 'widget-video-outer';
  if (sidebarPosition) outerEl.dataset.sidebarPosition = sidebarPosition;
  if (playlistDirection) outerEl.dataset.playlistDirection = playlistDirection;

  const hasSidebar = !!(title || subtitle || bodyText || footing || buttonText);
  const hasPlaylist = !!playlistId;

  // ── Video player wrapper ─────────────────────────────────────────────────
  const videoWrap = document.createElement('div');
  videoWrap.className = `widget-video mcy-video${videoType === 'youtube' ? ' mcy-video--youtube' : ''}`;
  if (videoOrientation) videoWrap.dataset.orientation = videoOrientation;
  if (portraitSize) videoWrap.dataset.portraitSize = portraitSize;
  if (hasSidebar) videoWrap.dataset.hasSidebar = '';
  if (hasPlaylist) videoWrap.dataset.hasPlaylist = '';
  if (disableControls) videoWrap.dataset.controls = 'false';
  if (videoWidth) videoWrap.dataset.videoWidth = videoWidth;

  // Create the appropriate player element
  let playerEl;
  if (videoType === 'youtube') {
    playerEl = createYouTubePlayer(videoId, autoplay);
  } else {
    // Brightcove
    playerEl = createBrightcovePlayer(videoId, playlistId, playerId, autoplay, disableControls);
    const accountId = getBrightcoveAccountId();
    loadBrightcoveScript(accountId, playerId);
  }
  videoWrap.appendChild(playerEl);

  // Mute toggle button for autoplay Brightcove videos
  if (autoplay && videoType === 'brightcove') {
    const muteBtn = document.createElement('button');
    muteBtn.type = 'button';
    muteBtn.className = 'btn-mute btn-mute--volume-off';
    muteBtn.setAttribute('aria-label', 'Toggle mute');
    muteBtn.addEventListener('click', () => {
      const video = videoWrap.querySelector('video');
      if (!video) return;
      video.muted = !video.muted;
      muteBtn.classList.toggle('btn-mute--volume-off', video.muted);
      muteBtn.classList.toggle('btn-mute--volume-up', !video.muted);
      muteBtn.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
    });
    videoWrap.appendChild(muteBtn);
  }

  // Timer overlay
  const timerEl = buildTimerOverlay(timerConfig);
  if (timerEl) videoWrap.appendChild(timerEl);

  outerEl.appendChild(videoWrap);

  // Sidebar text content
  const sidebarEl = buildSidebar({
    title,
    subtitle,
    bodyText,
    footing,
    buttonText,
    buttonUrl,
    buttonDataAttribute,
    buttonIcon,
  });
  if (sidebarEl) outerEl.appendChild(sidebarEl);

  block.appendChild(outerEl);

  // Caption (richtext)
  const captionText = captionHtml.replace(/<[^>]+>/g, '').trim();
  if (captionText) {
    const captionEl = document.createElement('div');
    captionEl.className = 'mercy-video-caption';
    captionEl.innerHTML = captionHtml;
    block.appendChild(captionEl);
  }

  // Start countdown if timer is enabled
  if (timerEl) {
    startCountdown(timerEl, timerConfig);
  }
}
