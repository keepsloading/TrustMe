import Phaser from 'phaser';
import { LevelConfig, TrapConfig } from '../data/levels';
import { COLORS, FONT } from '../data/theme';
import { Player } from '../entities/Player';
import { Trusty } from '../entities/Trusty';

export class TrapManager {
  private readonly dynamicPlatforms: Phaser.Physics.Arcade.Group;
  private readonly killers: Phaser.Physics.Arcade.Group;
  private helper?: Phaser.Physics.Arcade.Sprite;
  private helperVisual?: Trusty;
  private fakeOverlay?: Phaser.GameObjects.Container;
  private flipped = false;
  private floorTimerSet = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly level: LevelConfig,
    private readonly player: Player,
    private readonly onDeath: (message?: string) => void
  ) {
    this.dynamicPlatforms = this.scene.physics.add.group({ allowGravity: false, immovable: true });
    this.killers = this.scene.physics.add.group({ allowGravity: false, immovable: true });
    this.createDynamicTraps();
  }

  wire(platforms: Phaser.Physics.Arcade.StaticGroup, hazards: Phaser.Physics.Arcade.StaticGroup): void {
    this.scene.physics.add.collider(this.player, this.dynamicPlatforms, (_, platform) => {
      const trap = (platform as Phaser.GameObjects.GameObject).getData('trap') as TrapConfig | undefined;
      if (trap?.startsOnLanding) (platform as Phaser.Physics.Arcade.Sprite).setData('active', true);
      this.player.squash();
    });
    this.scene.physics.add.overlap(this.player, hazards, () => this.onDeath());
    this.scene.physics.add.overlap(this.player, this.killers, () => this.onDeath());
    this.scene.physics.add.collider(this.dynamicPlatforms, platforms);
    if (this.helper) {
      this.scene.physics.add.overlap(this.helper, this.killers, () => this.triggerHelperTrap());
    }
  }

  update(time: number): void {
    this.updateControls(time);
    this.updateMovingPlatforms();
    this.updateDoor();
    this.updateGravity();
    this.updateFakeVictory();
    this.updateFloorCollapse();
    this.updateFollower();
  }

  getDynamicPlatforms(): Phaser.Physics.Arcade.Group {
    return this.dynamicPlatforms;
  }

  getKillers(): Phaser.Physics.Arcade.Group {
    return this.killers;
  }

  private createDynamicTraps(): void {
    this.level.traps.forEach((trap) => {
      if (trap.type === 'movingPlatform') {
        const platform = this.scene.physics.add.sprite(trap.x, trap.y, this.rectTexture('moving-platform', trap.width, trap.height, COLORS.platform));
        platform.setImmovable(true).setData('trap', trap).setData('startX', trap.x).setData('startY', trap.y).setData('active', !trap.startsOnLanding);
        (platform.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        const mascot = new Trusty(this.scene, trap.x, trap.y - trap.height / 2 - 30, 0.38);
        platform.setData('mascot', mascot);
        this.dynamicPlatforms.add(platform);
      }
      if (trap.type === 'fallingCeiling') {
        const block = this.scene.physics.add.sprite(trap.x, trap.y, this.rectTexture(`fall-${trap.x}-${trap.y}`, trap.width, trap.height, COLORS.danger));
        block.setImmovable(true).setData('trap', trap).setData('armed', false);
        (block.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        this.killers.add(block);
      }
      if (trap.type === 'trustyFollower' || this.level.mechanics?.trustyHelper || this.level.mechanics?.trustyShadow) {
        if (!this.helper) this.createHelper(trap.x, trap.y);
      }
    });
  }

  private updateMovingPlatforms(): void {
    this.dynamicPlatforms.children.each((child) => {
      const platform = child as Phaser.Physics.Arcade.Sprite;
      const trap = platform.getData('trap') as TrapConfig;
      if (!platform.getData('active')) return true;
      if (this.level.mechanics?.movingOnFace) {
        const facing = !this.player.flipX && platform.x > this.player.x;
        if (!facing) {
          platform.setVelocity(0, 0);
          return true;
        }
      }
      const startX = platform.getData('startX') as number;
      const startY = platform.getData('startY') as number;
      const distance = trap.distance ?? 100;
      const speed = trap.speed ?? 80;
      const offset = trap.axis === 'y' ? platform.y - startY : platform.x - startX;
      const direction = platform.getData('direction') ?? 1;
      if (Math.abs(offset) >= distance) platform.setData('direction', -direction);
      const finalDirection = platform.getData('direction') ?? 1;
      platform.setVelocity(trap.axis === 'y' ? 0 : finalDirection * speed, trap.axis === 'y' ? finalDirection * speed : 0);
      const mascot = platform.getData('mascot') as Trusty | undefined;
      mascot?.setPosition(platform.x, platform.y - platform.height / 2 - 30);
      return true;
    });
  }

  private updateDoor(): void {
    const movingDoor = this.level.traps.find((trap) => trap.type === 'movingDoor');
    if (!movingDoor) return;
    const door = this.scene.children.getByName('door') as Phaser.Physics.Arcade.Sprite | undefined;
    if (!door) return;
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, door.x, door.y);
    if (distance < 160 && door.x < movingDoor.x + (movingDoor.distance ?? 100)) door.x += 2.1;
    if (door.x > 900) door.x = 900;
    (door.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
  }

  private updateControls(time: number): void {
    let reversed = Boolean(this.level.mechanics?.controlsReversed);
    if (this.level.mechanics?.timedReverse) reversed = Math.floor(time / 5000) % 2 === 1;
    this.player.reversed = reversed;
  }

  private updateGravity(): void {
    if (this.flipped || !this.level.mechanics?.gravityFlipX || this.player.x < this.level.mechanics.gravityFlipX) return;
    this.flipped = true;
    this.player.gravityFlipped = true;
    this.player.setGravityY(-2400);
    this.player.setFlipY(true);
  }

  private updateFakeVictory(): void {
    const x = this.level.mechanics?.fakeVictoryX;
    if (!x || this.fakeOverlay || this.player.x < x) return;
    const bg = this.scene.add.rectangle(480, 270, 460, 180, 0xffffff, 0.96).setStrokeStyle(5, COLORS.success);
    const text = this.scene.add.text(480, 260, 'YOU WIN', { fontFamily: FONT, fontSize: '48px', color: '#10131A', fontStyle: '700' }).setOrigin(0.5);
    const small = this.scene.add.text(480, 316, 'Please remain still.', { fontFamily: FONT, fontSize: '22px', color: '#10131A' }).setOrigin(0.5);
    this.fakeOverlay = this.scene.add.container(0, 0, [bg, text, small]).setDepth(70);
    this.scene.time.delayedCall(1500, () => this.fakeOverlay?.destroy());
  }

  private updateFloorCollapse(): void {
    const delay = this.level.mechanics?.floorCollapseAfter;
    if (!delay || this.floorTimerSet) return;
    this.floorTimerSet = true;
    this.scene.time.delayedCall(delay, () => {
      this.scene.children.list
        .filter((child) => child instanceof Phaser.GameObjects.Rectangle && child.y > 480)
        .forEach((child) => {
          this.scene.tweens.add({ targets: child, y: 620, alpha: 0, duration: 450 });
          const body = (child as Phaser.GameObjects.Rectangle).body as Phaser.Physics.Arcade.StaticBody | undefined;
          body?.destroy();
        });
    });
  }

  private updateFollower(): void {
    if (!this.helper) return;
    const offset = this.level.mechanics?.trustyShadow ? -75 : 72;
    const target = this.player.x + offset;
    this.helper.setVelocityX(Phaser.Math.Clamp((target - this.helper.x) * 3, -180, 180));
    this.helperVisual?.setPosition(this.helper.x, this.helper.y - 30);
  }

  private triggerHelperTrap(): void {
    this.killers.children.each((child) => {
      const block = child as Phaser.Physics.Arcade.Sprite;
      const trap = block.getData('trap') as TrapConfig | undefined;
      if (trap?.type === 'fallingCeiling' && Math.abs(block.x - this.helper!.x) < 120) {
        (block.body as Phaser.Physics.Arcade.Body | null)?.setAllowGravity(true);
        block.setImmovable(false).setVelocityY(260);
      }
      return true;
    });
  }

  armCoinTrap(trap: TrapConfig): void {
    if (trap.type === 'fallingCeiling') {
      const block = this.scene.physics.add.sprite(trap.x, trap.y, this.rectTexture(`coin-fall-${trap.x}`, trap.width, trap.height, COLORS.danger));
      (block.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
      block.setVelocityX(-140).setVelocityY(200);
      this.killers.add(block);
    }
  }

  private createHelper(x: number, y: number): void {
    this.helperVisual = new Trusty(this.scene, x, y - 30, 0.45);
    const key = this.rectTexture('trusty-hitbox', 40, 46, COLORS.trusty);
    this.helper = this.scene.physics.add.sprite(x, y, key).setAlpha(0.05);
    (this.helper.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
  }

  private rectTexture(key: string, width: number, height: number, color: number): string {
    if (!this.scene.textures.exists(key)) {
      const graphics = this.scene.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(color).fillRoundedRect(0, 0, Math.max(4, width), Math.max(4, height), 6);
      graphics.generateTexture(key, Math.max(4, width), Math.max(4, height));
      graphics.destroy();
    }
    return key;
  }
}
