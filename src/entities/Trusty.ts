import Phaser from 'phaser';
import { COLORS } from '../data/theme';

export class Trusty {
  readonly container: Phaser.GameObjects.Container;
  private readonly body: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number, scale = 1) {
    this.body = scene.add.circle(0, 0, 34, COLORS.trusty);
    const smile = scene.add.arc(0, 2, 16, 20, 160, false).setStrokeStyle(4, 0xffffff);
    const eyeA = scene.add.circle(-12, -9, 4, 0xffffff);
    const eyeB = scene.add.circle(12, -9, 4, 0xffffff);
    const arm = scene.add.rectangle(34, 4, 38, 12, COLORS.trusty).setAngle(-22);
    const thumb = scene.add.rectangle(51, -10, 12, 24, COLORS.trusty).setAngle(-22);
    this.container = scene.add.container(x, y, [arm, thumb, this.body, eyeA, eyeB, smile]).setScale(scale);
    scene.tweens.add({
      targets: this.container,
      y: y - 8,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}
