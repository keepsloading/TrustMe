import Phaser from 'phaser';
import { COLORS, FONT } from '../data/theme';
import { Trusty } from '../entities/Trusty';
import { SaveSystem } from '../systems/SaveSystem';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    new Trusty(this, 480, 178, 1.15);
    const title = this.add.text(480, 286, 'TRUST ME', {
      fontFamily: FONT,
      fontSize: '76px',
      color: '#F5F5F5',
      fontStyle: '700'
    }).setOrigin(0.5);
    this.add.text(480, 348, 'Just a fun game.', {
      fontFamily: FONT,
      fontSize: '28px',
      color: '#FFD54A'
    }).setOrigin(0.5);
    this.addButton(480, 420, 'Play', () => this.scene.start('WorldSelectScene'));
    this.addButton(480, 476, 'Continue', () => this.scene.start('GameScene', { levelId: SaveSystem.load().highestUnlockedLevel }));
    this.tweens.add({ targets: title, scale: 1.04, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private addButton(x: number, y: number, label: string, action: () => void): void {
    const rect = this.add.rectangle(x, y, 190, 42, COLORS.platform).setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, { fontFamily: FONT, fontSize: '24px', color: '#10131A', fontStyle: '600' }).setOrigin(0.5);
    rect.on('pointerover', () => rect.setFillStyle(COLORS.success));
    rect.on('pointerout', () => rect.setFillStyle(COLORS.platform));
    rect.on('pointerdown', action);
    text.setDepth(1);
  }
}
