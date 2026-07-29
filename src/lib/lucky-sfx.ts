// Lightweight sound + haptics helpers using WebAudio (no assets required).

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
        .AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export function unlockAudio() {
  getCtx();
}

function envTone(opts: {
  freq: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  freqEnd?: number;
}) {
  const c = getCtx();
  if (!c || !master) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, now);
  if (opts.freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(1, opts.freqEnd),
      now + opts.duration,
    );
  }
  const peak = opts.gain ?? 0.4;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(peak, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + opts.duration);
  osc.connect(g).connect(master);
  osc.start(now);
  osc.stop(now + opts.duration + 0.02);
}

export const sfx = {
  tick() {
    envTone({ freq: 900, freqEnd: 600, duration: 0.06, type: "square", gain: 0.18 });
  },
  coin() {
    envTone({ freq: 1400, freqEnd: 2200, duration: 0.09, type: "triangle", gain: 0.3 });
    setTimeout(
      () => envTone({ freq: 1800, freqEnd: 1200, duration: 0.12, type: "triangle", gain: 0.25 }),
      50,
    );
  },
  stop() {
    envTone({ freq: 320, freqEnd: 180, duration: 0.22, type: "sawtooth", gain: 0.4 });
  },
  win() {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
    notes.forEach((n, i) => {
      setTimeout(
        () => envTone({ freq: n, duration: 0.4, type: "triangle", gain: 0.45 }),
        i * 120,
      );
    });
    setTimeout(
      () => envTone({ freq: 1568, freqEnd: 2093, duration: 0.6, type: "sine", gain: 0.4 }),
      500,
    );
  },
};

export function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* noop */
    }
  }
}
