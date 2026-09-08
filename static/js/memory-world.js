(() => {
  const stage = document.querySelector('.world-stage');
  const place = document.querySelector('[data-memory-place]');
  const status = document.querySelector('[data-memory-status]');
  const targets = document.querySelectorAll('[data-memory][data-place]');
  const directory = document.querySelector('#scene-directory');
  const openButton = document.querySelector('.scene-directory-toggle');
  const closeButton = document.querySelector('.scene-directory-close');
  const arrival = document.querySelector('[data-scene-arrival]');
  const enterWithSound = document.querySelector('[data-enter-sound]');
  const enterSilent = document.querySelector('[data-enter-silent]');
  const soundButton = document.querySelector('[data-sound-toggle]');
  if (!stage || !place || !status) return;

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

  let context;
  let master;
  let soundReady = false;
  let bellTimer;
  let melodyTimer;
  const soundTitle = stage.dataset.soundTitle || '走廊里的广播';
  const preferredVolume = Math.min(Math.max(Number(stage.dataset.soundVolume || 24), 0), 100) / 100;

  const makeNoise = (audioContext) => {
    const length = audioContext.sampleRate * 3;
    const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    let previous = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      previous = previous * 0.985 + white * 0.015;
      data[i] = previous;
    }
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  };

  const playNote = (frequency, duration = 2.4, level = 0.08) => {
    if (!context || !master) return;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(level, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(master);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);
  };

  const createSoundscape = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext || soundReady) return;
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);

    const air = makeNoise(context);
    const airFilter = context.createBiquadFilter();
    const airGain = context.createGain();
    airFilter.type = 'lowpass';
    airFilter.frequency.value = 510;
    airGain.gain.value = 0.23;
    air.connect(airFilter).connect(airGain).connect(master);
    air.start();

    [54.8, 82.2, 109.6].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index === 1 ? 'triangle' : 'sine';
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index === 1 ? 5 : -4;
      gain.gain.value = index === 0 ? 0.07 : 0.026;
      oscillator.connect(gain).connect(master);
      oscillator.start();
    });

    const hum = context.createOscillator();
    const humGain = context.createGain();
    hum.type = 'sine';
    hum.frequency.value = 59.6;
    humGain.gain.value = 0.012;
    hum.connect(humGain).connect(master);
    hum.start();

    const ringBell = () => {
      if (!context || !master || master.gain.value <= 0.001) return;
      const now = context.currentTime;
      [523.25, 659.25].forEach((frequency, index) => {
        const bell = context.createOscillator();
        const bellGain = context.createGain();
        bell.type = 'sine';
        bell.frequency.value = frequency;
        bellGain.gain.setValueAtTime(0.0001, now + index * 0.13);
        bellGain.gain.exponentialRampToValueAtTime(0.025, now + index * 0.13 + 0.03);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.13 + 3.8);
        bell.connect(bellGain).connect(master);
        bell.start(now + index * 0.13);
        bell.stop(now + index * 0.13 + 4);
      });
    };
    const melody = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 392];
    let melodyIndex = 0;
    const playMelody = () => {
      if (!context || !master || master.gain.value <= 0.001) return;
      playNote(melody[melodyIndex % melody.length], 2.6, 0.075);
      melodyIndex += 1;
    };
    bellTimer = window.setInterval(ringBell, 22000);
    melodyTimer = window.setInterval(playMelody, 4200);
    soundReady = true;
    playNote(392, 0.7, 0.12);
  };

  const setSound = async (enabled) => {
    if (enabled) {
      createSoundscape();
      if (context) await context.resume();
    }
    if (master && context) {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.linearRampToValueAtTime(enabled ? preferredVolume : 0, context.currentTime + 0.55);
    }
    stage.classList.toggle('sound-on', enabled);
    soundButton?.setAttribute('aria-pressed', String(enabled));
    soundButton?.setAttribute('aria-label', enabled ? '关闭场景声音' : '打开场景声音');
    if (soundButton) soundButton.textContent = enabled ? '声音：开' : '声音：关';
    localStorage.setItem('memory-world-sound', enabled ? 'on' : 'off');
    if (enabled) {
      place.textContent = soundTitle;
      status.textContent = context?.state === 'running' ? '远处的广播没有说完。' : '浏览器没有放行声音，再点一次声音按钮。';
    }
  };

  const enter = async (withSound) => {
    arrival?.classList.add('is-leaving');
    stage.classList.add('is-awake');
    window.setTimeout(() => arrival?.setAttribute('hidden', ''), 620);
    if (withSound) await setSound(true);
  };
  enterWithSound?.addEventListener('click', () => enter(true));
  enterSilent?.addEventListener('click', () => enter(false));
  soundButton?.addEventListener('click', () => setSound(!stage.classList.contains('sound-on')));

  let navigating = false;
  const transitionDelay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300;
  document.querySelectorAll('[data-scene-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (navigating || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigating = true;
      stage.classList.add('is-transitioning');
      window.setTimeout(() => { window.location.assign(link.href); }, transitionDelay);
      window.setTimeout(() => { stage.classList.remove('is-transitioning'); navigating = false; }, 2600);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && directory && !directory.hidden) setDirectory(false);
  });
  window.addEventListener('pagehide', () => { window.clearInterval(bellTimer); window.clearInterval(melodyTimer); });
})();
