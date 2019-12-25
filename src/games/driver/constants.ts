
export enum SteeringState {
  NONE = 0,
  LEFT = 1,
  RIGHT = 2
}

export enum Attributes {
  GAME_MODEL = 'game_model',
  FACTORY = 'factory',
  SPRITE_MGR = 'sprite_mgr',
  LINE = 'line',
  SPEED = 'speed',
  OBSTACLE_MAP = 'obstacle_map',
  SPRITESHEET = 'sprite_sheet',
  ROAD_POS_Y = 'road_pos_y'
}

export enum Messages {
  ANIM_ENDED = 'anim_ended',
  CAR_COLLIDED = 'car_collided',
  IMMUNE_MODE_STARTED = 'immune_mode_started',
  IMMUNE_MODE_ENDED = 'immune_mode_ended'
}

export enum Assets {
  SPRITES = 'sprites',
  SPRITESHEET = 'spritesheet'
}

export const LINES_NUM = 3; // default number of lines
export const MAXIMUM_SPEED = 50;	// maximum speed
export const MAXIMUM_FREQUENCY = 50;	// maximum frequency
export const DEFAULT_LIVES = 3;	// default number of lives
export const DEFAULT_MAX_SPEED = MAXIMUM_SPEED / 6;	// initial maximum speed the player's car can achieve
export const DEFAULT_TRAFFIC_FREQUENCY = 1;	// initial traffic frequency
export const STEERING_DURATION = 400;			// number of ms the steering of player's car should take
