export type SoundCue = 'start' | 'tick' | 'step' | 'arrive' | 'whoosh';

let audioContext: AudioContext | null = null;

function context() {
  if (typeof window === 'undefined') return null;
  audioContext ??= new window.AudioContext();
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

function tone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  delay = 0,
  type: OscillatorType = 'sine',
  volume = 0.035,
) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + delay;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function noise(ctx: AudioContext) {
  const length = Math.floor(ctx.sampleRate * 0.26);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / length);
  }
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  gain.gain.setValueAtTime(0.018, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.26);
  source.buffer = buffer;
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
}

export function playCinematicSound(cue: SoundCue) {
  const ctx = context();
  if (!ctx) return;
  if (cue === 'tick') tone(ctx, 520, 0.07, 0, 'square', 0.018);
  if (cue === 'step') tone(ctx, 115, 0.08, 0, 'triangle', 0.022);
  if (cue === 'whoosh') noise(ctx);
  if (cue === 'start') {
    tone(ctx, 196, 0.42, 0, 'triangle', 0.025);
    tone(ctx, 293.7, 0.48, 0.08, 'sine', 0.03);
    tone(ctx, 392, 0.58, 0.16, 'sine', 0.03);
  }
  if (cue === 'arrive') {
    tone(ctx, 392, 0.24, 0, 'triangle', 0.035);
    tone(ctx, 523.3, 0.34, 0.09, 'sine', 0.04);
    tone(ctx, 659.3, 0.46, 0.18, 'sine', 0.035);
  }
}
