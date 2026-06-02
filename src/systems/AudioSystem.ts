import Phaser from 'phaser';
import { SaveSystem } from './SaveSystem';

export class AudioSystem {
  private context?: AudioContext;

  constructor(private readonly scene: Phaser.Scene) {}

  setMuted(muted: boolean): void {
    SaveSystem.setMuted(muted);
  }

  pop(): void {
    this.play([180, 90], 0.08, 'square');
  }

  chime(): void {
    this.play([523, 659, 784], 0.12, 'sine');
  }

  private play(notes: number[], duration: number, type: OscillatorType): void {
    if (SaveSystem.load().muted) return;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;
    this.context ??= new AudioContextCtor();
    const start = this.context.currentTime;
    notes.forEach((frequency, index) => {
      const oscillator = this.context!.createOscillator();
      const gain = this.context!.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start + index * duration);
      gain.gain.exponentialRampToValueAtTime(0.08, start + index * duration + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + (index + 1) * duration);
      oscillator.connect(gain).connect(this.context!.destination);
      oscillator.start(start + index * duration);
      oscillator.stop(start + (index + 1) * duration);
    });
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.context?.suspend());
  }
}
