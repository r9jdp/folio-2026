/** Original procedural EV sound; no Porsche recordings or external assets. */
export class DriveAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private motor: OscillatorNode[] = [];
  private motorGains: GainNode[] = [];
  private wind: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private sources = new Set<AudioScheduledSourceNode>();
  private nodes: AudioNode[] = [];
  private muted = false;
  private disposed = false;
  private wantsPlayback = false;
  private started = false;
  private speed = 0;
  private throttle = 0;

  /** Call directly from a Start, Resume, or sound-button gesture. */
  async unlock(): Promise<boolean> {
    if (this.disposed || typeof window === 'undefined') return false;
    this.wantsPlayback = true;

    try {
      if (!this.context) {
        const Context =
          window.AudioContext ??
          (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Context) return false;
        this.context = new Context();
        this.createGraph(this.context);
      }

      const context = this.context;
      await context.resume();
      if (this.disposed || context.state === 'closed') return false;
      // A pause or route exit can arrive while the browser unlock is pending.
      if (!this.wantsPlayback) {
        await context.suspend();
        return false;
      }
      if (context.state !== 'running') return false;

      this.update(this.speed, this.throttle);
      this.applyVolume();
      if (!this.started) {
        this.started = true;
        if (!this.muted) this.playStartup(context);
      }
      return true;
    } catch {
      // Audio is optional: blocked or unavailable audio never stops the game.
      this.silence();
      return false;
    }
  }

  update(speed: number, throttle: number): void {
    this.speed = Number.isFinite(speed) ? Math.max(0, Math.min(72, speed)) : 0;
    this.throttle = Number.isFinite(throttle) ? Math.max(0, Math.min(1, throttle)) : 0;
    const context = this.context;
    if (!context || context.state !== 'running' || !this.wantsPlayback) return;

    const motion = this.speed / 72;
    const frequency = 78 + this.speed * 3.4 + this.throttle * 18;
    const harmonics = [1, 2.005, 3.99];
    const levels = [
      0.008 + motion * 0.017 + this.throttle * 0.014,
      0.002 + motion * 0.008 + this.throttle * 0.004,
      motion * 0.0035,
    ];

    this.motor.forEach((oscillator, index) => {
      this.smooth(oscillator.frequency, frequency * harmonics[index], 0.13);
      this.smooth(this.motorGains[index].gain, levels[index], 0.15);
    });
    if (this.wind) this.smooth(this.wind.gain, motion ** 1.6 * 0.11, 0.3);
    if (this.windFilter) {
      this.smooth(this.windFilter.frequency, 550 + motion * 2100, 0.3);
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyVolume();
  }

  async suspend(): Promise<void> {
    this.wantsPlayback = false;
    this.silence();
    try {
      if (this.context && this.context.state !== 'closed') {
        await this.context.suspend();
      }
    } catch {
      // A simultaneous unmount may already have closed the context.
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.wantsPlayback = false;
    this.silence();
    for (const source of this.sources) {
      source.onended = null;
      try {
        source.stop();
      } catch {
        // A startup tone may have finished just before disposal.
      }
      source.disconnect();
    }
    for (const node of this.nodes) node.disconnect();
    this.sources.clear();
    this.nodes = [];
    this.motor = [];
    this.motorGains = [];
    const context = this.context;
    this.context = null;
    this.master = null;
    this.wind = null;
    this.windFilter = null;
    if (context && context.state !== 'closed') void context.close().catch(() => {});
  }

  private createGraph(context: AudioContext): void {
    const master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
    this.master = master;
    this.nodes.push(master);

    for (let index = 0; index < 3; index += 1) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 78 * 2 ** index;
      gain.gain.value = 0;
      oscillator.connect(gain).connect(master);
      this.sources.add(oscillator);
      this.nodes.push(gain);
      this.motor.push(oscillator);
      this.motorGains.push(gain);
      oscillator.start();
    }

    const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) {
      samples[index] = (Math.random() * 2 - 1) * 0.4;
    }
    const noise = context.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const lowpass = context.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 550;
    lowpass.Q.value = 0.5;
    const highpass = context.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 180;
    const wind = context.createGain();
    wind.gain.value = 0;
    noise.connect(lowpass).connect(highpass).connect(wind).connect(master);
    this.sources.add(noise);
    this.nodes.push(lowpass, highpass, wind);
    this.wind = wind;
    this.windFilter = lowpass;
    noise.start();
  }

  private playStartup(context: AudioContext): void {
    if (!this.master) return;
    const tone = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    tone.type = 'sine';
    tone.frequency.setValueAtTime(523.25, now);
    tone.frequency.exponentialRampToValueAtTime(783.99, now + 0.24);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.025, now + 0.045);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);
    tone.connect(gain).connect(this.master);
    this.sources.add(tone);
    tone.onended = () => {
      this.sources.delete(tone);
      tone.disconnect();
      gain.disconnect();
    };
    // Track the gain as well so disposal can disconnect a pending startup tone.
    this.nodes.push(gain);
    tone.start(now);
    tone.stop(now + 0.38);
  }

  private smooth(parameter: AudioParam, value: number, timeConstant: number): void {
    const now = this.context?.currentTime ?? 0;
    parameter.cancelScheduledValues(now);
    parameter.setTargetAtTime(value, now, timeConstant);
  }

  private applyVolume(): void {
    if (!this.master || !this.context || this.context.state === 'closed') return;
    const audible = this.wantsPlayback && !this.muted && !this.disposed;
    this.smooth(this.master.gain, audible ? 0.72 : 0, 0.04);
  }

  private silence(): void {
    if (!this.master || !this.context || this.context.state === 'closed') return;
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(0, now);
  }
}
