import Phaser from 'phaser';
import { LevelConfig, TrapConfig } from '../data/levels';
import { COLORS, FONT } from '../data/theme';

export interface LoadedLevel {
  platforms: Phaser.Physics.Arcade.StaticGroup;
  hazards: Phaser.Physics.Arcade.StaticGroup;
  trapObjects: Phaser.GameObjects.GameObject[];
  door: Phaser.Physics.Arcade.Sprite;
  coins: Phaser.Physics.Arcade.StaticGroup;
}

export class LevelLoader {
  constructor(private readonly scene: Phaser.Scene) {}

  load(level: LevelConfig): LoadedLevel {
    const platforms = this.scene.physics.add.staticGroup();
    const hazards = this.scene.physics.add.staticGroup();
    const coins = this.scene.physics.add.staticGroup();
    const trapObjects: Phaser.GameObjects.GameObject[] = [];

    level.platforms.forEach((platform) => this.addRect(platforms, platform.x, platform.y, platform.width, platform.height, COLORS.platform));
    level.hazards.forEach((hazard) => this.addHazard(hazards, hazard));
    level.traps.filter((trap) => trap.type !== 'movingPlatform' && trap.type !== 'movingDoor' && trap.type !== 'trustyFollower').forEach((trap) => {
      if (trap.type === 'fakeWall') {
        const wall = this.scene.add.rectangle(trap.x, trap.y, trap.width, trap.height, COLORS.platform, 0.9);
        trapObjects.push(wall);
        return;
      }
      const color = trap.type === 'safeSpike' ? COLORS.danger : COLORS.platform;
      const obj = this.addRect(platforms, trap.x, trap.y, trap.width, trap.height, color);
      obj.setData('trap', trap);
      trapObjects.push(obj);
    });

    level.signs.forEach((sign) => {
      this.scene.add.rectangle(sign.x, sign.y, 128, 32, 0xffffff).setStrokeStyle(3, COLORS.danger);
      this.scene.add.text(sign.x, sign.y, sign.text, {
        fontFamily: FONT,
        fontSize: '14px',
        color: '#10131A',
        align: 'center',
        wordWrap: { width: 118 }
      }).setOrigin(0.5);
    });

    level.coins?.forEach((coin) => {
      const sprite = this.scene.add.circle(coin.x, coin.y, 13, COLORS.player);
      this.scene.physics.add.existing(sprite, true);
      sprite.setData('coin', coin);
      coins.add(sprite);
    });

    const door = this.scene.physics.add.staticSprite(level.door.x, level.door.y, this.ensureDoorTextures().closed);
    door.setData('closedTexture', this.ensureDoorTextures().closed);
    door.setData('openTexture', this.ensureDoorTextures().open);
    door.setSize(46, 68).refreshBody();
    return { platforms, hazards, trapObjects, door, coins };
  }

  private addRect(group: Phaser.Physics.Arcade.StaticGroup, x: number, y: number, width: number, height: number, color: number): Phaser.GameObjects.Rectangle {
    const rect = this.scene.add.rectangle(x, y, width, height, color);
    group.add(rect);
    const body = rect.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(width, height);
    body.updateFromGameObject();
    return rect;
  }

  private addHazard(group: Phaser.Physics.Arcade.StaticGroup, hazard: TrapConfig): void {
    const visible = hazard.type !== 'hiddenSpike';
    const triangle = this.scene.add.triangle(hazard.x, hazard.y + hazard.height / 2, 0, hazard.height, hazard.width / 2, 0, hazard.width, hazard.height, COLORS.danger, visible ? 1 : 0);
    group.add(triangle);
    const body = triangle.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(hazard.width, hazard.height);
    body.updateFromGameObject();
  }

  private ensureDoorTextures(): { closed: string; open: string } {
    const closed = 'success-door';
    const open = 'success-door-open';
    if (!this.scene.textures.exists(closed)) {
      const graphics = this.scene.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(COLORS.success).fillRoundedRect(0, 0, 46, 68, 8);
      graphics.fillStyle(0x10131a).fillCircle(34, 36, 4);
      graphics.generateTexture(closed, 46, 68);
      graphics.clear();
      graphics.fillStyle(COLORS.success).fillRoundedRect(0, 0, 46, 68, 8);
      graphics.fillStyle(0x10131a).fillRoundedRect(10, 9, 26, 50, 5);
      graphics.generateTexture(open, 46, 68);
      graphics.destroy();
    }
    return { closed, open };
  }
}
