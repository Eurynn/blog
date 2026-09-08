(() => {
  const place = document.querySelector('[data-memory-place]');
  const status = document.querySelector('[data-memory-status]');
  const targets = document.querySelectorAll('[data-memory][data-place]');
  const directory = document.querySelector('#scene-directory');
  const openButton = document.querySelector('.scene-directory-toggle');
  const closeButton = document.querySelector('.scene-directory-close');
  if (!place || !status) return;

  const describe = (target) => {
    place.textContent = target.dataset.place || '入口';
    status.textContent = target.dataset.memory || '';
  };
  targets.forEach((target) => {
    target.addEventListener('mouseenter', () => describe(target));
    target.addEventListener('focus', () => describe(target));
  });

  const setDirectory = (open) => {
    if (!directory || !openButton) return;
    directory.hidden = !open;
    openButton.setAttribute('aria-expanded', String(open));
    openButton.textContent = open
      ? (openButton.dataset.closeLabel || '关闭目录')
      : (openButton.dataset.openLabel || '打开目录');
    if (open) closeButton?.focus();
    else openButton.focus();
  };
  openButton?.addEventListener('click', () => setDirectory(directory.hidden));
  closeButton?.addEventListener('click', () => setDirectory(false));
  directory?.addEventListener('click', (event) => {
    if (event.target.closest('a')) setDirectory(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && directory && !directory.hidden) setDirectory(false);
  });
})();
