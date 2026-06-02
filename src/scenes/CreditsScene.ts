import Phaser from 'phaser';
import { COLORS, FONT } from '../data/theme';
import { Trusty } from '../entities/Trusty';

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super('CreditsScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    const lines = [
      'THANK YOU FOR PLAYING',
      'TRUST ME',
      '',
      'Created By',
      'Keeps Loading',
      'aka',
      'Sujay Sudhir',
      '',
      'Special Thanks',
      'To everyone who trusted me.',
      "And especially those who didn't."
    ];
    lines.forEach((line, index) => {
      this.add.text(480, 120 + index * 42, line, {
        fontFamily: FONT,
        fontSize: index === 1 ? '48px' : '28px',
        color: index === 1 ? '#FFD54A' : '#F5F5F5',
        fontStyle: index === 1 ? '700' : '500'
      }).setOrigin(0.5);
    });

    const trusty = new Trusty(this, 740, 370, 0.9);
    const bubble = this.add.rectangle(650, 310, 230, 82, COLORS.platform).setStrokeStyle(4, COLORS.trusty);
    const text = this.add.text(650, 310, '"See?"\n"You could trust me."', {
      fontFamily: FONT,
      fontSize: '22px',
      color: '#10131A',
      align: 'center'
    }).setOrigin(0.5);
    this.time.delayedCall(4300, () => {
      this.tweens.add({ targets: [trusty.container, bubble, text], y: '+=360', duration: 900, ease: 'Back.easeIn' });
      this.cameras.main.shake(220, 0.01);
    });
    this.time.delayedCall(5600, () => this.showFinal());
  }

  private showFinal(): void {
    this.children.removeAll();
    this.add.text(480, 240, 'TRUST ME 2?', {
      fontFamily: FONT,
      fontSize: '72px',
      color: '#F5F5F5',
      fontStyle: '700'
    }).setOrigin(0.5);
    this.add.text(480, 320, 'Maybe.', {
      fontFamily: FONT,
      fontSize: '34px',
      color: '#FFD54A'
    }).setOrigin(0.5);
    this.input.once('pointerdown', () => this.scene.start('MenuScene'));
    this.input.keyboard!.once('keydown-SPACE', () => this.scene.start('MenuScene'));
  }
}
