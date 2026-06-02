import Phaser from 'phaser';
import { getLevel, LEVELS, LevelConfig } from '../data/levels';
import { COLORS, FONT } from '../data/theme';
import { DEATH_MESSAGES } from '../data/dialogue';
import { Player } from '../entities/Player';
import { LevelLoader } from '../systems/LevelLoader';
import { TrapManager } from '../systems/TrapManager';
import { DialogueSystem } from '../systems/DialogueSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { AudioSystem } from '../systems/AudioSystem';

export class GameScene extends Phaser.Scene {
  private level!: LevelConfig;
  private player!: Player;
  private traps!: TrapManager;
  private dialogue!: DialogueSystem;
  private audioSystem!: AudioSystem;
  private paused = false;
  private pauseLayer?: Phaser.GameObjects.Container;
  private deathsText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private reverseText?: Phaser.GameObjects.Text;
  private startedAt = 0;

  constructor() {
    super('GameScene');
  }

  create(data: { levelId?: number }): void {
    this.level = getLevel(data.levelId ?? 1);
    this.startedAt = Date.now();
    this.audioSystem = new AudioSystem(this);
    this.cameras.main.setBackgroundColor(COLORS.background);
    this.physics.world.setBounds(0, 0, 960, 540);
    this.physics.world.gravity.y = 1200;

    this.addHud();
    this.showTitleCard();
    const loaded = new LevelLoader(this).load(this.level);
    loaded.door.setName('door');
    this.player = new Player(this, this.level.spawn.x, this.level.spawn.y);
    this.dialogue = new DialogueSystem(this, this.level.trustyLine);
    this.traps = new TrapManager(this, this.level, this.player, () => this.killPlayer());

    this.physics.add.collider(this.player, loaded.platforms, (_, obj) => {
      const trap = (obj as Phaser.GameObjects.GameObject).getData('trap');
      if (trap?.type === 'fakeFloor' || trap?.type === 'collapsingFloor') this.collapse(obj as Phaser.GameObjects.GameObject);
      if (trap?.type === 'deadlyFloor') this.killPlayer();
      this.player.squash();
    });
    this.traps.wire(loaded.platforms, loaded.hazards);
    this.physics.add.overlap(this.player, loaded.door, () => this.completeLevel());
    this.physics.add.overlap(this.player, loaded.coins, (_, coin) => {
      const config = (coin as Phaser.GameObjects.GameObject).getData('coin');
      (coin as Phaser.GameObjects.GameObject).destroy();
      if (config.trap) this.traps.armCoinTrap(config.trap);
    });

    this.input.keyboard!.on('keydown-M', () => this.toggleMute());
    if (this.level.mechanics?.timedReverse) {
      this.reverseText = this.add.text(820, 86, '', { fontFamily: FONT, fontSize: '22px', color: '#FFD54A', fontStyle: '700' }).setOrigin(0.5).setDepth(90);
    }
  }

  update(time: number): void {
    if (!this.player) return;
    if (this.player.restartPressed) this.scene.restart({ levelId: this.level.id });
    if (this.player.pausePressed) this.togglePause();
    if (this.paused) return;
    this.player.update();
    this.traps.update(time);
    this.timerText.setText(this.formatTime(Math.max(0, Date.now() - SaveSystem.load().startedAt)));
    if (this.player.y > 560 || this.player.y < -120) this.killPlayer('Gravity had notes.');
    if (this.reverseText) {
      const remaining = 5 - Math.floor((time / 1000) % 5);
      this.reverseText.setText(`${this.player.reversed ? 'REVERSED' : 'NORMAL'} ${remaining}`);
    }
  }

  private addHud(): void {
    const save = SaveSystem.load();
    this.deathsText = this.add.text(24, 18, `Deaths: ${save.totalDeaths}`, { fontFamily: FONT, fontSize: '20px', color: '#F5F5F5' }).setDepth(90);
    this.timerText = this.add.text(24, 44, '00:00', { fontFamily: FONT, fontSize: '20px', color: '#F5F5F5' }).setDepth(90);
    this.add.text(888, 24, 'M', { fontFamily: FONT, fontSize: '18px', color: '#10131A', fontStyle: '700' }).setOrigin(0.5).setDepth(91);
    this.add.rectangle(888, 24, 36, 30, COLORS.platform).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.toggleMute()).setDepth(90);
  }

  private showTitleCard(): void {
    const card = this.add.container(480, 146).setDepth(100);
    const bg = this.add.rectangle(0, 0, 420, 72, COLORS.platform);
    const title = this.add.text(0, -12, `Level ${this.level.id}`, { fontFamily: FONT, fontSize: '25px', color: '#10131A', fontStyle: '700' }).setOrigin(0.5);
    const world = this.add.text(0, 18, `World ${this.level.world}`, { fontFamily: FONT, fontSize: '17px', color: '#10131A' }).setOrigin(0.5);
    card.add([bg, title, world]);
    this.tweens.add({ targets: card, y: 126, alpha: 0, delay: 1200, duration: 450, onComplete: () => card.destroy() });
  }

  private collapse(obj: Phaser.GameObjects.GameObject): void {
    obj.setData('trap', undefined);
    this.tweens.add({ targets: obj, y: 620, alpha: 0, duration: 280 });
    const body = (obj as Phaser.GameObjects.Rectangle).body as Phaser.Physics.Arcade.StaticBody | undefined;
    body?.destroy();
  }

  private killPlayer(message?: string): void {
    const deaths = SaveSystem.addDeath();
    this.deathsText.setText(`Deaths: ${deaths}`);
    this.audioSystem.pop();
    this.cameras.main.shake(170, 0.012);
    const line = message ?? Phaser.Utils.Array.GetRandom(DEATH_MESSAGES);
    this.dialogue.setLine(line);
    this.player.setTint(COLORS.danger);
    this.physics.pause();
    this.time.delayedCall(650, () => this.scene.restart({ levelId: this.level.id }));
  }

  private completeLevel(): void {
    this.audioSystem.chime();
    this.physics.pause();
    if (this.level.id >= LEVELS.length) {
      SaveSystem.finish(Math.max(0, Date.now() - SaveSystem.load().startedAt));
      this.scene.start('CreditsScene');
      return;
    }
    SaveSystem.unlock(this.level.id + 1);
    this.scene.start('GameScene', { levelId: this.level.id + 1 });
  }

  private togglePause(): void {
    this.paused = !this.paused;
    if (this.paused) {
      this.physics.pause();
      const bg = this.add.rectangle(480, 270, 960, 540, 0x10131a, 0.75);
      const panel = this.add.rectangle(480, 270, 330, 190, COLORS.platform);
      const title = this.add.text(480, 228, 'Paused', { fontFamily: FONT, fontSize: '34px', color: '#10131A', fontStyle: '700' }).setOrigin(0.5);
      const resume = this.menuText(480, 282, 'Resume');
      const restart = this.menuText(480, 326, 'Restart');
      resume.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.togglePause());
      restart.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.restart({ levelId: this.level.id }));
      this.pauseLayer = this.add.container(0, 0, [bg, panel, title, resume, restart]).setDepth(120);
    } else {
      this.physics.resume();
      this.pauseLayer?.destroy();
    }
  }

  private menuText(x: number, y: number, text: string): Phaser.GameObjects.Text {
    return this.add.text(x, y, text, { fontFamily: FONT, fontSize: '24px', color: '#10131A', fontStyle: '600' }).setOrigin(0.5);
  }

  private toggleMute(): void {
    const next = !SaveSystem.load().muted;
    this.audioSystem.setMuted(next);
    this.dialogue.setLine(next ? 'Muting is trustworthy.' : this.level.trustyLine);
  }

  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
}
