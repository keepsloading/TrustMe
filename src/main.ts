import Phaser from 'phaser';
import './styles/theme.css';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { WorldSelectScene } from './scenes/WorldSelectScene';
import { GameScene } from './scenes/GameScene';
import { CreditsScene } from './scenes/CreditsScene';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 960,
  height: 540,
  resolution: Math.min(window.devicePixelRatio || 1, 2),
  backgroundColor: '#10131A',
  pixelArt: false,
  render: {
    antialias: true,
    roundPixels: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1200 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, MenuScene, WorldSelectScene, GameScene, CreditsScene]
} as Phaser.Types.Core.GameConfig;

new Phaser.Game(config);
