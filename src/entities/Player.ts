import Phaser from 'phaser';
import { COLORS } from '../data/theme';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private keys: Record<string, Phaser.Input.Keyboard.Key>;
  private readonly speed = 235;
  private readonly jumpSpeed = 520;
  private running = false;
  reversed = false;
  gravityFlipped = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const texture = 'player-square';
    if (!scene.textures.exists(texture)) {
      const graphics = scene.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(COLORS.player).fillRoundedRect(0, 0, 32, 32, 7);
      graphics.generateTexture(texture, 32, 32);
      graphics.destroy();
    }
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setSize(30, 30).setCollideWorldBounds(false);
    this.keys = scene.input.keyboard!.addKeys('W,A,S,D,UP,LEFT,RIGHT,SPACE,R,ESC') as Record<string, Phaser.Input.Keyboard.Key>;
    scene.input.on('pointerdown', () => this.handleAction());
  }

  update(active = true): void {
    if (!active) {
      this.setVelocityX(0);
      return;
    }
    const action = Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.keys.UP) || Phaser.Input.Keyboard.JustDown(this.keys.RIGHT) || Phaser.Input.Keyboard.JustDown(this.keys.D);
    if (action) this.handleAction();
    const direction = this.running ? 1 : 0;
    const finalDirection = this.reversed ? -direction : direction;
    this.setVelocityX(finalDirection * this.speed);
    if (direction !== 0) this.setFlipX(finalDirection < 0);
  }

  private handleAction(): void {
    if (!this.running) {
      this.running = true;
      return;
    }
    const touching = this.gravityFlipped ? this.body!.blocked.up || this.body!.touching.up : this.body!.blocked.down || this.body!.touching.down;
    if (touching) {
      this.setVelocityY(this.gravityFlipped ? this.jumpSpeed : -this.jumpSpeed);
      this.scene.tweens.add({ targets: this, scaleX: 0.84, scaleY: 1.18, duration: 80, yoyo: true });
    }
  }

  get restartPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.R);
  }

  get pausePressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.ESC);
  }

  squash(): void {
    this.scene.tweens.add({ targets: this, scaleX: 1.18, scaleY: 0.82, duration: 90, yoyo: true });
  }
}
