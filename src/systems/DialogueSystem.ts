import Phaser from 'phaser';
import { COLORS, FONT } from '../data/theme';
import { Trusty } from '../entities/Trusty';

export class DialogueSystem {
  private readonly bubble: Phaser.GameObjects.Container;
  private readonly text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, line: string) {
    const trusty = new Trusty(scene, 76, 84, 0.78);
    const panel = scene.add.rectangle(266, 86, 356, 78, 0xffffff, 1).setStrokeStyle(4, COLORS.trusty);
    panel.setOrigin(0.5);
    this.text = scene.add.text(118, 58, line, {
      fontFamily: FONT,
      fontSize: '20px',
      color: '#10131A',
      wordWrap: { width: 292 }
    });
    this.bubble = scene.add.container(0, 0, [panel, this.text, trusty.container]).setDepth(80);
  }

  setLine(line: string): void {
    this.text.setText(line);
  }

  setVisible(visible: boolean): void {
    this.bubble.setVisible(visible);
  }
}
