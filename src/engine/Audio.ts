let audioCtx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export function resumeAudio() {
  if (audioCtx?.state === 'suspended') audioCtx.resume();
}

export function playShoot() {
  const c = ctx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(880, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, c.currentTime + 0.05);
  gain.gain.setValueAtTime(0.08, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.06);
  osc.connect(gain).connect(c.destination);
  osc.start(); osc.stop(c.currentTime + 0.06);
}

export function playExplosion(isBoss: boolean) {
  const c = ctx();
  const bufferSize = c.sampleRate * (isBoss ? 0.4 : 0.2);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.15, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + (isBoss ? 0.4 : 0.2));
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, c.currentTime);
  filter.frequency.exponentialRampToValueAtTime(200, c.currentTime + (isBoss ? 0.4 : 0.2));
  src.connect(filter).connect(gain).connect(c.destination);
  src.start();
}

export function playPickup() {
  const c = ctx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(660, c.currentTime);
  osc.frequency.setValueAtTime(880, c.currentTime + 0.06);
  osc.frequency.setValueAtTime(1320, c.currentTime + 0.12);
  gain.gain.setValueAtTime(0.1, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
  osc.connect(gain).connect(c.destination);
  osc.start(); osc.stop(c.currentTime + 0.2);
}

export function playBomb() {
  const c = ctx();
  const bufferSize = c.sampleRate * 0.5;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * Math.sin(i * 0.02);
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.3, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
  src.connect(gain).connect(c.destination);
  src.start();
}

export function playBossAlert() {
  const c = ctx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, c.currentTime);
  osc.frequency.setValueAtTime(440, c.currentTime + 0.1);
  osc.frequency.setValueAtTime(220, c.currentTime + 0.2);
  osc.frequency.setValueAtTime(440, c.currentTime + 0.3);
  gain.gain.setValueAtTime(0.12, c.currentTime);
  gain.gain.linearRampToValueAtTime(0.001, c.currentTime + 0.4);
  osc.connect(gain).connect(c.destination);
  osc.start(); osc.stop(c.currentTime + 0.4);
}
