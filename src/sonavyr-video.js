// Keep YouTube disconnected until the visitor explicitly loads the player.
const loadButton = document.getElementById('sonavyr-video-load');
loadButton?.addEventListener('click', () => {
  const player = document.createElement('iframe');
  player.className = 'video-player sonavyr-video-player';
  player.src = 'https://www.youtube-nocookie.com/embed/UnhKLaEab9I';
  player.title = 'StudioZIO Sonavyr video';
  player.width = '1200';
  player.height = '675';
  player.allow = 'encrypted-media; picture-in-picture; fullscreen';
  player.allowFullscreen = true;
  player.referrerPolicy = 'strict-origin-when-cross-origin';
  loadButton.replaceWith(player);
  player.focus();
}, { once: true });
