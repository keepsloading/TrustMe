import Phaser from 'phaser';
import { COLORS, FONT } from '../data/theme';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    this.add.text(480, 270, 'Trust Me', {
      fontFamily: FONT,
      fontSize: '56px',
      color: '#F5F5F5'
    }).setOrigin(0.5);
    this.time.delayedCall(450, () => this.scene.start('MenuScene'));
  }
}
