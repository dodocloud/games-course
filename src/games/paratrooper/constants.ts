
export enum Messages {
  UNIT_KILLED = 'unit_killed',
  PROJECTILE_FIRED = 'projectile_fired',
  PARATROOPER_CREATED = 'paratrooper_created',
  UNIT_LANDED = 'unit_landed',
  GAME_OVER = 'game_over',
  ANIM_FINISHED = 'anim_finished',
  COPTER_CREATED = 'copter_created',
  COLLISION_TRIGGERED = 'collision_triggered'
}

export enum Attributes {
  DYNAMICS = 'dynamics',
  MODEL = 'model',
  FACTORY = 'factory'
}

export enum BFlags {
  PROJECTILE = 1,
  COLLIDABLE = 2
}

export enum Names {
  COPTER = 'copter',
  TOWER = 'tower',
  TURRET = 'turret',
  CANNON = 'cannon',
  GROUND = 'ground',
  SCORE = 'score',
  GAMEOVER = 'gameover',
  LIVES = 'lives',
  PROJECTILE = 'projectile',
  PARATROOPER = 'paratrooper'
}

export enum States {
  FALLING = 1,
  DEAD = 2,
  FALLING_PARACHUTE = 3,
  FALLING_WITHOUT_PARACHUTE = 4,
  ON_THE_GROUND = 5,
  CAPTURING_BASE = 6
}

export enum Assets {
  DATA = 'data_json',
  TEX_CANNON = 'cannon',
  TEX_COPTER_LEFT = 'copter_left',
  TEX_COPTER_RIGHT = 'copter_right',
  TEX_PARATROOPER_PARACHUTE = 'paratrooper_parachute',
  TEX_PARATROOPER = 'paratrooper',
  TEX_PROJECTILE = 'projectile',
  TEX_TOWER = 'tower',
  TEX_TURRET = 'turret',
  TEX_LOGO = 'logo',
  SND_FIRE = 'fire',
  SND_GAMEOVER = 'gameover',
  SND_KILL = 'kill',
  FONT = 'Retrofont'
}


// height of the scene will be set to 50 units for the purpose of better calculations
export const SCENE_HEIGHT = 50;

// native height of the game canvas. If bigger, it will be resized accordingly
export const SPRITES_RESOLUTION_HEIGHT = 400;

// native speed of the game
export const GAME_SPEED = 1;