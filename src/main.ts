import Phaser from 'phaser';
import './styles/theme.css';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { WorldSelectScene } from './scenes/WorldSelectScene';
import { GameScene } from './scenes/GameScene';
import { CreditsScene } from './scenes/CreditsScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 960,
  height: 540,
  backgroundColor: '#10131A',
  pixelArt: false,
  roundPixels: true,
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
};

new Phaser.Game(config);
