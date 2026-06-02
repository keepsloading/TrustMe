const KEY = 'trust-me-save';

export interface SaveData {
  highestUnlockedLevel: number;
  totalDeaths: number;
  completionTime: number;
  startedAt: number;
  muted: boolean;
}

const defaults = (): SaveData => ({
  highestUnlockedLevel: 1,
  totalDeaths: 0,
  completionTime: 0,
  startedAt: Date.now(),
  muted: false
});

export class SaveSystem {
  static load(): SaveData {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) ?? '') as Partial<SaveData>;
      const data = { ...defaults(), ...parsed };
      if (!Number.isFinite(data.startedAt) || data.startedAt > Date.now()) data.startedAt = Date.now();
      if (!Number.isFinite(data.totalDeaths) || data.totalDeaths < 0) data.totalDeaths = 0;
      if (!Number.isFinite(data.highestUnlockedLevel) || data.highestUnlockedLevel < 1) data.highestUnlockedLevel = 1;
      return data;
    } catch {
      return defaults();
    }
  }

  static save(data: SaveData): void {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  static unlock(level: number): void {
    const data = this.load();
    data.highestUnlockedLevel = Math.max(data.highestUnlockedLevel, level);
    this.save(data);
  }

  static addDeath(): number {
    const data = this.load();
    data.totalDeaths += 1;
    this.save(data);
    return data.totalDeaths;
  }

  static setMuted(muted: boolean): void {
    const data = this.load();
    data.muted = muted;
    this.save(data);
  }

  static finish(elapsedMs: number): void {
    const data = this.load();
    data.completionTime = data.completionTime ? Math.min(data.completionTime, elapsedMs) : elapsedMs;
    this.save(data);
  }
}
