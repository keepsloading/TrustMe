export type TrapType =
  | 'spike'
  | 'fakeFloor'
  | 'collapsingFloor'
  | 'hiddenSpike'
  | 'movingPlatform'
  | 'movingDoor'
  | 'reversedControlsZone'
  | 'timedReverseControls'
  | 'gravityFlip'
  | 'fakeVictory'
  | 'fakeCheckpoint'
  | 'deadlyFloor'
  | 'safeSpike'
  | 'trustyFollower'
  | 'fakeWall'
  | 'fallingCeiling';

export interface RectConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface TrapConfig extends RectConfig {
  type: TrapType;
  triggerX?: number;
  delay?: number;
  axis?: 'x' | 'y';
  distance?: number;
  speed?: number;
  startsOnLanding?: boolean;
  text?: string;
}

export interface SignConfig {
  x: number;
  y: number;
  text: string;
}

export interface CoinConfig {
  x: number;
  y: number;
  trap?: TrapConfig;
}

export interface LevelConfig {
  id: number;
  world: number;
  title: string;
  trustyLine: string;
  spawn: { x: number; y: number };
  door: { x: number; y: number };
  platforms: RectConfig[];
  hazards: TrapConfig[];
  traps: TrapConfig[];
  signs: SignConfig[];
  coins?: CoinConfig[];
  mechanics?: {
    controlsReversed?: boolean;
    timedReverse?: boolean;
    oppositeDay?: boolean;
    doorMoves?: boolean;
    gravityFlipX?: number;
    fakeVictoryX?: number;
    trustyHelper?: boolean;
    trustyShadow?: boolean;
    hiddenLeftRoute?: boolean;
    floorCollapseAfter?: number;
    movingOnFace?: boolean;
    creditsTrap?: boolean;
  };
}

const floor = (segments: RectConfig[] = []): RectConfig[] => [
  { x: 120, y: 500, width: 240, height: 28 },
  { x: 430, y: 500, width: 280, height: 28 },
  { x: 780, y: 500, width: 220, height: 28 },
  ...segments
];

const spike = (x: number, y = 474, width = 34): TrapConfig => ({ type: 'spike', x, y, width, height: 26 });
const hiddenSpike = (x: number, y = 474, width = 44): TrapConfig => ({ type: 'hiddenSpike', x, y, width, height: 26 });
const fakeFloor = (x: number, y = 500, width = 90): TrapConfig => ({ type: 'fakeFloor', x, y, width, height: 28 });
const collapsing = (x: number, y = 500, width = 100, triggerX = x - 40): TrapConfig => ({
  type: 'collapsingFloor',
  x,
  y,
  width,
  height: 28,
  triggerX
});

export const WORLDS = ['Trust', 'Doubt', 'Paranoia', 'Gaslighting', 'Betrayal', 'Trust No One'];

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    world: 1,
    title: 'Welcome Friend',
    trustyLine: 'Welcome! Just walk to the door.',
    spawn: { x: 86, y: 450 },
    door: { x: 870, y: 444 },
    platforms: [{ x: 480, y: 500, width: 860, height: 28 }],
    hazards: [],
    traps: [],
    signs: []
  },
  {
    id: 2,
    world: 1,
    title: 'Small Jump',
    trustyLine: 'Jump over the red thing. It is bad.',
    spawn: { x: 86, y: 450 },
    door: { x: 870, y: 444 },
    platforms: floor(),
    hazards: [spike(520)],
    traps: [],
    signs: [{ x: 512, y: 424, text: 'BAD' }]
  },
  {
    id: 3,
    world: 1,
    title: 'Shortcut',
    trustyLine: 'Shortcut seems faster.',
    spawn: { x: 86, y: 450 },
    door: { x: 870, y: 444 },
    platforms: floor([{ x: 510, y: 380, width: 180, height: 24 }]),
    hazards: [hiddenSpike(505, 354, 100)],
    traps: [],
    signs: [{ x: 510, y: 328, text: 'SHORTCUT' }]
  },
  {
    id: 4,
    world: 1,
    title: 'Safe Floor',
    trustyLine: 'All floors have been tested.',
    spawn: { x: 86, y: 450 },
    door: { x: 870, y: 444 },
    platforms: floor(),
    hazards: [],
    traps: [fakeFloor(536)],
    signs: []
  },
  {
    id: 5,
    world: 1,
    title: 'Trust Fall',
    trustyLine: 'Keep walking. You are doing great.',
    spawn: { x: 86, y: 450 },
    door: { x: 870, y: 444 },
    platforms: [{ x: 260, y: 500, width: 360, height: 28 }, { x: 642, y: 500, width: 64, height: 28 }, { x: 820, y: 500, width: 160, height: 28 }],
    hazards: [],
    traps: [collapsing(390, 500, 220, 430), collapsing(535, 500, 120, 430)],
    signs: []
  },
  {
    id: 6,
    world: 2,
    title: "Don't Jump",
    trustyLine: "Definitely don't jump.",
    spawn: { x: 86, y: 450 },
    door: { x: 870, y: 444 },
    platforms: floor(),
    hazards: [spike(460, 474, 90)],
    traps: [],
    signs: [{ x: 452, y: 420, text: "DON'T JUMP" }]
  },
  {
    id: 7,
    world: 2,
    title: 'Jump Now',
    trustyLine: 'Big jump. Huge.',
    spawn: { x: 86, y: 450 },
    door: { x: 870, y: 444 },
    platforms: [{ x: 170, y: 500, width: 260, height: 28 }, { x: 790, y: 500, width: 220, height: 28 }],
    hazards: [spike(430, 300, 150)],
    traps: [{ type: 'movingPlatform', x: 430, y: 500, width: 130, height: 24, axis: 'x', distance: 260, speed: 70 }],
    signs: [{ x: 420, y: 425, text: 'JUMP NOW' }]
  },
  {
    id: 8,
    world: 2,
    title: 'Safe Coin',
    trustyLine: 'Free coin! No consequences.',
    spawn: { x: 86, y: 450 },
    door: { x: 870, y: 444 },
    platforms: [{ x: 480, y: 500, width: 860, height: 28 }],
    hazards: [],
    traps: [],
    coins: [{ x: 445, y: 420, trap: { type: 'fallingCeiling', x: 620, y: 110, width: 44, height: 340 } }],
    signs: []
  },
  {
    id: 9,
    world: 2,
    title: 'Left Door',
    trustyLine: 'Left door. I feel good about it.',
    spawn: { x: 86, y: 450 },
    door: { x: 840, y: 444 },
    platforms: [{ x: 480, y: 500, width: 860, height: 28 }],
    hazards: [{ type: 'hiddenSpike', x: 600, y: 420, width: 80, height: 80 }],
    traps: [],
    signs: [{ x: 610, y: 444, text: 'LEFT' }, { x: 842, y: 444, text: 'RIGHT' }]
  },
  {
    id: 10,
    world: 2,
    title: 'The Test',
    trustyLine: 'Final test of trust.',
    spawn: { x: 86, y: 450 },
    door: { x: 875, y: 444 },
    platforms: floor([{ x: 370, y: 395, width: 120, height: 24 }, { x: 650, y: 395, width: 120, height: 24 }]),
    hazards: [spike(300, 474, 70), spike(650, 369, 80)],
    traps: [fakeFloor(520, 500, 100)],
    signs: [{ x: 300, y: 420, text: 'SAFE' }, { x: 520, y: 445, text: 'STAND HERE' }, { x: 650, y: 330, text: 'JUMP' }]
  },
  {
    id: 11,
    world: 3,
    title: "Don't Look",
    trustyLine: 'They are shy.',
    spawn: { x: 86, y: 450 },
    door: { x: 875, y: 444 },
    platforms: [{ x: 160, y: 500, width: 230, height: 28 }, { x: 820, y: 500, width: 220, height: 28 }],
    hazards: [],
    traps: [
      { type: 'movingPlatform', x: 390, y: 470, width: 110, height: 24, axis: 'x', distance: 280, speed: 80 }
    ],
    signs: [],
    mechanics: { movingOnFace: true }
  },
  {
    id: 12,
    world: 3,
    title: 'Three Seconds',
    trustyLine: 'Take your time.',
    spawn: { x: 86, y: 450 },
    door: { x: 875, y: 444 },
    platforms: [{ x: 480, y: 500, width: 860, height: 28 }],
    hazards: [],
    traps: [],
    signs: [],
    mechanics: { floorCollapseAfter: 3000 }
  },
  {
    id: 13,
    world: 3,
    title: 'Door Run',
    trustyLine: 'The door is excited to see you.',
    spawn: { x: 86, y: 450 },
    door: { x: 790, y: 444 },
    platforms: [{ x: 480, y: 500, width: 860, height: 28 }],
    hazards: [],
    traps: [{ type: 'movingDoor', x: 790, y: 444, width: 48, height: 72, axis: 'x', distance: 110, speed: 110 }],
    signs: []
  },
  {
    id: 14,
    world: 3,
    title: 'Checkpoint',
    trustyLine: 'Touch the checkpoint. Obviously.',
    spawn: { x: 86, y: 450 },
    door: { x: 875, y: 444 },
    platforms: floor([{ x: 535, y: 405, width: 110, height: 24 }]),
    hazards: [],
    traps: [{ type: 'fakeCheckpoint', x: 475, y: 452, width: 42, height: 48 }],
    signs: [{ x: 475, y: 410, text: 'CHECKPOINT' }]
  },
  {
    id: 15,
    world: 3,
    title: 'Upside Down',
    trustyLine: 'Everything is normal.',
    spawn: { x: 86, y: 450 },
    door: { x: 875, y: 76 },
    platforms: [{ x: 300, y: 500, width: 420, height: 28 }, { x: 690, y: 98, width: 370, height: 28 }],
    hazards: [spike(550, 474, 70)],
    traps: [{ type: 'gravityFlip', x: 455, y: 420, width: 60, height: 90 }],
    signs: [],
    mechanics: { gravityFlipX: 455 }
  },
  {
    id: 16,
    world: 4,
    title: 'You Win',
    trustyLine: 'Congrats! Probably.',
    spawn: { x: 86, y: 450 },
    door: { x: 875, y: 444 },
    platforms: [{ x: 480, y: 500, width: 860, height: 28 }],
    hazards: [],
    traps: [{ type: 'fakeVictory', x: 420, y: 360, width: 70, height: 140 }, { type: 'fallingCeiling', x: 530, y: 70, width: 260, height: 38, delay: 1200 }],
    signs: [],
    mechanics: { fakeVictoryX: 420 }
  },
  {
    id: 17,
    world: 4,
    title: 'Reversed',
    trustyLine: 'This is more intuitive.',
    spawn: { x: 86, y: 450 },
    door: { x: 875, y: 444 },
    platforms: floor([{ x: 535, y: 420, width: 130, height: 24 }]),
    hazards: [spike(390)],
    traps: [],
    signs: [{ x: 450, y: 380, text: 'Controls updated for comfort.' }],
    mechanics: { controlsReversed: true }
  },
  {
    id: 18,
    world: 4,
    title: 'Flicker',
    trustyLine: 'Consistency is important.',
    spawn: { x: 86, y: 450 },
    door: { x: 875, y: 444 },
    platforms: floor([{ x: 510, y: 410, width: 130, height: 24 }]),
    hazards: [spike(540), spike(705)],
    traps: [{ type: 'timedReverseControls', x: 0, y: 0, width: 0, height: 0 }],
    signs: [],
    mechanics: { timedReverse: true }
  },
  {
    id: 19,
    world: 4,
    title: 'Opposite Day',
    trustyLine: 'Avoid the spikes, as usual.',
    spawn: { x: 86, y: 450 },
    door: { x: 875, y: 444 },
    platforms: [{ x: 170, y: 500, width: 220, height: 28 }, { x: 790, y: 500, width: 210, height: 28 }],
    hazards: [{ type: 'deadlyFloor', x: 440, y: 500, width: 180, height: 28 }],
    traps: [{ type: 'safeSpike', x: 420, y: 474, width: 300, height: 26 }],
    signs: [],
    mechanics: { oppositeDay: true }
  },
  {
    id: 20,
    world: 4,
    title: 'Wrong Way',
    trustyLine: 'Ignore suspicious signage.',
    spawn: { x: 86, y: 450 },
    door: { x: 165, y: 300 },
    platforms: [{ x: 480, y: 500, width: 860, height: 28 }, { x: 175, y: 356, width: 170, height: 24 }, { x: 670, y: 390, width: 230, height: 24 }],
    hazards: [spike(700, 364, 120)],
    traps: [],
    signs: [{ x: 175, y: 312, text: 'WRONG WAY' }, { x: 670, y: 344, text: 'SAFE ROUTE' }]
  },
  {
    id: 21,
    world: 5,
    title: 'Real Fake Floor',
    trustyLine: 'You know how this works now.',
    spawn: { x: 86, y: 450 },
    door: { x: 875, y: 444 },
    platforms: [{ x: 165, y: 500, width: 230, height: 28 }, { x: 590, y: 500, width: 420, height: 28 }, { x: 840, y: 500, width: 150, height: 28 }],
    hazards: [],
    traps: [collapsing(455, 500, 160, 420), { type: 'safeSpike', x: 610, y: 474, width: 70, height: 26 }],
    signs: []
  },
  {
    id: 22,
    world: 5,
    title: 'Harmless Trap',
    trustyLine: 'The big scary thing is scary.',
    spawn: { x: 86, y: 450 },
    door: { x: 875, y: 444 },
    platforms: [{ x: 480, y: 500, width: 860, height: 28 }],
    hazards: [{ type: 'hiddenSpike', x: 650, y: 480, width: 34, height: 20 }],
    traps: [{ type: 'safeSpike', x: 390, y: 430, width: 170, height: 70 }],
    signs: []
  },
  {
    id: 23,
    world: 5,
    title: 'Combo Meal',
    trustyLine: 'Just remember everything I taught you.',
    spawn: { x: 86, y: 450 },
    door: { x: 780, y: 444 },
    platforms: floor([{ x: 535, y: 405, width: 120, height: 24 }]),
    hazards: [hiddenSpike(330), spike(535, 379, 80)],
    traps: [fakeFloor(610, 500, 100), { type: 'movingDoor', x: 780, y: 444, width: 48, height: 72, axis: 'x', distance: 90, speed: 100 }],
    signs: [{ x: 332, y: 424, text: 'SAFE' }, { x: 610, y: 444, text: 'REAL' }]
  },
  {
    id: 24,
    world: 5,
    title: 'Helper',
    trustyLine: 'I will help personally.',
    spawn: { x: 86, y: 450 },
    door: { x: 875, y: 444 },
    platforms: [{ x: 480, y: 500, width: 860, height: 28 }],
    hazards: [spike(540, 474, 80)],
    traps: [{ type: 'trustyFollower', x: 150, y: 448, width: 52, height: 52 }, { type: 'fallingCeiling', x: 705, y: 85, width: 55, height: 340 }],
    signs: [],
    mechanics: { trustyHelper: true }
  },
  {
    id: 25,
    world: 5,
    title: 'Impossible',
    trustyLine: 'Only forward.',
    spawn: { x: 155, y: 450 },
    door: { x: 35, y: 444 },
    platforms: [{ x: 480, y: 500, width: 860, height: 28 }, { x: 42, y: 500, width: 120, height: 28 }],
    hazards: [spike(390, 474, 360)],
    traps: [{ type: 'fakeWall', x: 90, y: 405, width: 26, height: 95 }],
    signs: [{ x: 270, y: 420, text: 'ONLY FORWARD' }],
    mechanics: { hiddenLeftRoute: true }
  },
  {
    id: 26,
    world: 6,
    title: 'Everything Moves',
    trustyLine: 'Stable foundation.',
    spawn: { x: 86, y: 450 },
    door: { x: 875, y: 444 },
    platforms: [{ x: 150, y: 500, width: 180, height: 28 }, { x: 830, y: 500, width: 190, height: 28 }],
    hazards: [],
    traps: [
      { type: 'movingPlatform', x: 360, y: 470, width: 120, height: 24, axis: 'y', distance: 80, speed: 45 },
      { type: 'movingPlatform', x: 560, y: 420, width: 120, height: 24, axis: 'x', distance: 120, speed: 70, startsOnLanding: true },
      { type: 'movingPlatform', x: 710, y: 470, width: 100, height: 24, axis: 'y', distance: 70, speed: 55 }
    ],
    signs: []
  },
  {
    id: 27,
    world: 6,
    title: 'Argument',
    trustyLine: 'They are being dramatic.',
    spawn: { x: 86, y: 450 },
    door: { x: 875, y: 444 },
    platforms: floor([{ x: 510, y: 385, width: 115, height: 24 }, { x: 690, y: 440, width: 125, height: 24 }]),
    hazards: [spike(365), spike(510, 359, 80)],
    traps: [fakeFloor(690, 440, 95)],
    signs: [{ x: 332, y: 425, text: 'Trust me.' }, { x: 510, y: 326, text: 'Do not trust him.' }, { x: 690, y: 386, text: 'Neither.' }]
  },
  {
    id: 28,
    world: 6,
    title: 'Credits',
    trustyLine: 'You finished! Stop touching buttons.',
    spawn: { x: 86, y: 450 },
    door: { x: 875, y: 444 },
    platforms: [{ x: 480, y: 500, width: 860, height: 28 }],
    hazards: [spike(520, 474, 70), spike(700, 474, 70)],
    traps: [{ type: 'fakeVictory', x: 360, y: 340, width: 70, height: 160 }],
    signs: [],
    mechanics: { creditsTrap: true }
  },
  {
    id: 29,
    world: 6,
    title: 'Shadow Friend',
    trustyLine: 'We make a great team.',
    spawn: { x: 86, y: 450 },
    door: { x: 875, y: 444 },
    platforms: floor([{ x: 565, y: 410, width: 110, height: 24 }]),
    hazards: [spike(465), spike(705)],
    traps: [{ type: 'trustyFollower', x: 140, y: 448, width: 52, height: 52 }, { type: 'fallingCeiling', x: 570, y: 65, width: 60, height: 340 }],
    signs: [],
    mechanics: { trustyShadow: true }
  },
  {
    id: 30,
    world: 6,
    title: 'The Last Promise',
    trustyLine: "This time I'm telling the truth.",
    spawn: { x: 86, y: 450 },
    door: { x: 875, y: 444 },
    platforms: [{ x: 480, y: 500, width: 860, height: 28 }],
    hazards: [],
    traps: [],
    signs: [{ x: 500, y: 430, text: 'It is safe.' }]
  }
];

export const getLevel = (id: number): LevelConfig => LEVELS[Math.max(0, Math.min(LEVELS.length - 1, id - 1))];
