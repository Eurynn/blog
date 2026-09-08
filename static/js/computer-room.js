(() => {
  const room = document.querySelector('.computer-room');
  const status = document.querySelector('[data-computer-status]');
  if (!room || !status) return;

  const key = 'memory-computer-room-visited';
  const returned = sessionStorage.getItem(key) === '1';
  if (returned) {
    room.classList.add('room-returned');
    status.textContent = '最后登录：16:07 / 你已经来过这里。';
  }
  sessionStorage.setItem(key, '1');
})();
