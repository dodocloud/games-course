// message keys
export const MSG_GAME_STARTED = 'GAME_STARTED';
export const MSG_ROUND_STARTED = 'ROUND_STARTED';
export const MSG_OBJECT_HIT = 'OBJECT_HIT';
export const MSG_GAME_OVER = 'GAME_OVER';
export const MSG_LEVEL_COMPLETED = 'LEVEL_COMPLETED';
export const MSG_LEVEL_STARTED = 'LEVEL_STARTED';
export const MSG_GAME_COMPLETED = 'GAME_COMPLETED';
export const MSG_BALL_OUTSIDE_AREA = 'BALL_OUTSIDE_AREA';
export const MSG_LIFE_LOST = 'LIFE_LOST';

export enum Messages {
  GAME_STARTED = 'game_started',
  ROUND_STARTED = 'round_started',
  OBJECT_HIT = 'object_hit',
  GAME_OVER = 'game_over',
  LEVEL_COMPLETED = 'level_completed',
  LEVEL_STARTED = 'level_started',
  GAME_COMPLETED = 'game_completed',
  BALL_OUTSIDE_AREA = 'ball_outside_area',
  LIFE_LOST = 'life_lost',
  CMD_FINISH_LEVEL = 'cmd_finish_level',
  CMD_GAME_OVER = 'cmd_game_over',
  CMD_GOTO_NEXT_ROUND = 'cmd_goto_next_round'
}

export enum Assets {
  SND_HIT = 'snd_hit',
  SND_GAMEOVER = 'snd_gameover',
  SND_INTRO = 'snd_intro',
  SND_ROUND = 'snd_round',
  DATA = 'data_json',
  TXT_ARKANOID = 'arkanoid',
  FONT = 'Retrofont'
}

export enum Attributes {
  DYNAMICS = 'dynamics',
  MODEL = 'model',
  FACTORY = 'factory'
}

export enum Names {
  LEFT_PANEL = 'left_panel',
  RIGHT_PANEL = 'right_panel',
  TOP_PANEL = 'top_panel',
  PADDLE = 'paddle',
  BRICKS = 'bricks',
  BALL = 'ball',
  SHIP = 'ship',
  STARS = 'stars',
  TITLE = 'title',
  LIFE = 'life',
  STATUS = 'status'
}

export enum HitTypes {
  BORDER_LEFT = 1,
  BORDER_RIGHT = 2,
  BORDER_TOP = 3,
  PADDLE = 4,
  BRICK = 5
}

export enum BrickTypes {
  DEFAULT = 0,
  INDESTRUCTIBLE = 1
}

// height of the scene will be set to 25 units for the purpose of better calculations
export const SCENE_HEIGHT = 25;

// native height of the game canvas. If bigger, it will be resized accordingly
export const SPRITES_RESOLUTION_HEIGHT = 400;

// native speed of the game
export const GAME_SPEED = 1;