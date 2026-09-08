(() => {
  const body = document.body;
  const toggle = document.querySelector('[data-room-sound-toggle]');
  const audio = document.querySelector('[data-room-audio]');
  const room = body?.dataset.roomSound || 'quiet';
  const transition = document.querySelector('.room-transition');
  const links = document.querySelectorAll('[data-room-link]');
  if (!body) return;

  let navigating = false;
  const transitionDelay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240;
  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (navigating || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigating = true;
      body.classList.add('is-leaving');
      window.setTimeout(() => { window.location.assign(link.href); }, transitionDelay);
      window.setTimeout(() => { body.classList.remove('is-leaving'); navigating = false; }, 2600);
    });
  });

  if (!toggle || room === 'quiet') return;
  let context;
  let master;
  let ready = false;
  let audioPlaying = false;
  let pulseTimer;
  const remembered = localStorage.getItem('memory-world-sound') === 'on';
  const volume = room === 'computer' ? 0.12 : 0.1;

  const noise = (audioContext) => {
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 3, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    let previous = 0;
    for (let i = 0; i < data.length; i += 1) {
      previous = previous * 0.985 + (Math.random() * 2 - 1) * 0.015;
      data[i] = previous;
    }
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  };

  const playNote = (frequency, duration = 2, level = 0.08) => {
    if (!context || !master) return;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(level, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(master);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);
  };

  const startNativeTrack = async () => {
    if (!audio) return false;
    audio.volume = room === 'computer' ? 0.7 : 0.62;
    try {
      await audio.play();
      audioPlaying = true;
      return true;
    } catch {
      audioPlaying = false;
      return false;
    }
  };

  const stopNativeTrack = () => {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audioPlaying = false;
  };

  const makeRoomSound = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext || ready) return;
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
    const air = noise(context);
    const filter = context.createBiquadFilter();
    const airGain = context.createGain();
    filter.type = 'lowpass';
    filter.frequency.value = room === 'computer' ? 760 : 610;
    airGain.gain.value = room === 'computer' ? 0.18 : 0.2;
    air.connect(filter).connect(airGain).connect(master);
    air.start();

    const hum = context.createOscillator();
    const humGain = context.createGain();
    hum.type = 'sine';
    hum.frequency.value = room === 'computer' ? 60 : 50;
    humGain.gain.value = room === 'computer' ? 0.022 : 0.015;
    hum.connect(humGain).connect(master);
    hum.start();

    const pulse = () => {
      if (!context || !master || master.gain.value < 0.001) return;
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = room === 'computer' ? 740 : 392;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(room === 'computer' ? 0.018 : 0.012, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
      oscillator.connect(gain).connect(master);
      oscillator.start(now);
      oscillator.stop(now + 1.5);
    };
    pulseTimer = window.setInterval(pulse, room === 'computer' ? 17000 : 26000);
    ready = true;
    playNote(room === 'computer' ? 329.63 : 261.63, 0.8, 0.12);
  };

  const setSound = async (enabled) => {
    if (enabled) {
      const started = await startNativeTrack();
      if (!started) {
        makeRoomSound();
        if (context) await context.resume();
      }
    } else {
      stopNativeTrack();
    }
    if (context && master) {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.linearRampToValueAtTime(enabled && !audioPlaying ? volume : 0, context.currentTime + 0.5);
    }
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.setAttribute('aria-label', enabled ? '关闭房间声音' : '唤醒房间声音');
    toggle.textContent = enabled ? '音乐：开' : '音乐：关';
    localStorage.setItem('memory-world-sound', enabled ? 'on' : 'off');
  };

  toggle.textContent = remembered ? '声音：唤醒' : '声音：关';
  toggle.addEventListener('click', () => setSound(!(toggle.getAttribute('aria-pressed') === 'true')));
  window.addEventListener('pagehide', () => window.clearInterval(pulseTimer));
})();
