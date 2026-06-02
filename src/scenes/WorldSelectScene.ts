import Phaser from 'phaser';
import { LEVELS, WORLDS } from '../data/levels';
import { COLORS, FONT } from '../data/theme';
import { SaveSystem } from '../systems/SaveSystem';

export class WorldSelectScene extends Phaser.Scene {
  constructor() {
    super('WorldSelectScene');
  }

  create(): void {
    const save = SaveSystem.load();
    this.cameras.main.setBackgroundColor(COLORS.background);
    this.add.text(480, 54, 'World Select', { fontFamily: FONT, fontSize: '42px', color: '#F5F5F5', fontStyle: '700' }).setOrigin(0.5);
    this.add.text(480, 96, `Deaths: ${save.totalDeaths}`, { fontFamily: FONT, fontSize: '20px', color: '#F5F5F5' }).setOrigin(0.5);

    WORLDS.forEach((world, index) => {
      const worldNumber = index + 1;
      this.add.text(110 + index * 142, 148, `${worldNumber}. ${world}`, {
        fontFamily: FONT,
        fontSize: '17px',
        color: '#F5F5F5',
        align: 'center',
        wordWrap: { width: 120 }
      }).setOrigin(0.5);
    });

    LEVELS.forEach((level) => {
      const col = (level.world - 1) * 142;
      const row = (level.id - 1) % 5;
      const x = 110 + col;
      const y = 205 + row * 56;
      const unlocked = level.id <= save.highestUnlockedLevel;
      const color = unlocked ? COLORS.platform : 0x4b5060;
      const rect = this.add.rectangle(x, y, 94, 40, color).setInteractive({ useHandCursor: unlocked });
      this.add.text(x, y, `${level.id}`, { fontFamily: FONT, fontSize: '22px', color: '#10131A', fontStyle: '700' }).setOrigin(0.5);
      if (unlocked) {
        rect.on('pointerover', () => rect.setFillStyle(COLORS.success));
        rect.on('pointerout', () => rect.setFillStyle(COLORS.platform));
        rect.on('pointerdown', () => this.scene.start('GameScene', { levelId: level.id }));
      }
    });

    this.add.text(480, 506, 'R restarts levels. Esc pauses. Arrow keys, WASD, Space.', {
      fontFamily: FONT,
      fontSize: '18px',
      color: '#F5F5F5'
    }).setOrigin(0.5);
  }
}
