import { Vector } from '../../../libs/pixi-component';

export enum Messages {
  PACDOT_EATEN = 'pacdot_eaten',
  BONUS_TAKEN = 'bonus_taken',
  VICTORY = 'victory',
  PACMAN_SPIDER_COLLISION = 'pacman_spider_collision',
  DEFEAT = 'defeat',
  PACMAN_KILLED = 'pacman_killed',
  SPIDER_KILLED = 'spider_killed',
  PACMAN_REVIVED = 'pacman_revived'
}

export enum Attributes {
  FACTORY = 'attr_factory',
  MODEL = 'attr_model',
  GAME_UNIT = 'attr_game_unit',
  SPRITE_DATA = 'sprite_data',
  SPRITESHEET_DATA = 'spritesheet_data'
}

export enum Assets {
  SPRITES = 'file_sprites',
  MAP = 'file_map',
  SPRITESHEET = 'file_spritesheet',
  BACKGROUND = 'file_background',
  SND_DEATH = 'snd_death',
  SND_PACDOT = 'snd_pacdot',
  SND_PELLET = 'snd_pellet',
  SND_RUSHKILL = 'snd_rushkill'
}

// map size in number of cells
export const GRID_WIDTH = 19;
export const GRID_HEIGHT = 11;

// origin of the grid on the screen
export const GRID_OFFSET_X = 17;
export const GRID_OFFSET_Y = 20;

// size of one map cell
export const BLOCK_WIDTH = 32;
export const BLOCK_HEIGHT = 24;

// positioning of static objects
export const defaultPositions = {
  river: new Vector(0, 90),
  fountain: new Vector(272, 180),
  gate: new Vector(350, 60),
  spiderSpawner: new Vector(304, 134)
};

export enum Names {
  LAYER_BGR = 'layer_background',
  LAYER_ITEMS = 'layer_items',
  LAYER_CREATURES = 'layer_creatures',
  BACKGROUND = 'background',
  RIVER = 'river',
  FOUNTAIN = 'fountain',
  PACMAN = 'pacman',
  SPIDER = 'spider',
  GATE = 'gate',
  SPIDER_GATE = 'spider_gate'
}


// special functions for map blocks
export enum SpecFunctions {
  NONE = 0,
  TUNNEL = 1,
  GATE = 2,
  SPIDER_GATE = 3,
  PELLET = 4,
  PACMAN_SPAWNER = 5,
  SPIDER_SPAWNER = 6,
  PACDOT = 7
}

export const STATE_DEFAULT = 0;

export enum GateState {
  CLOSED = 0,
  OPENING = 1,
  OPEN = 2,
  CLOSING = 3
}

export enum UnitState {
  STANDING = 0,
  WALKING = 1,
  DEAD = 2
}

export enum GameState {
  DEFAULT = 0,
  RUSH_MODE = 1,
  GAME_OVER = 2,
}
