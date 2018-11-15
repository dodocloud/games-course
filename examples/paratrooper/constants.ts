
// message keys
export const MSG_UNIT_KILLED = "unit_killed";
export const MSG_PROJECTILE_SHOT = "projectile_shot";
export const MSG_PARATROOPER_CREATED = "paratrooper_created";
export const MSG_UNIT_LANDED = "unit_landed";
export const MSG_GAME_OVER = "game_over";
export const MSG_ANIM_ENDED = "anim_ended";
export const MSG_COPTER_CREATED = "copter_created";
export const MSG_COLLISION = "collision";

// attribute keys
export const ATTR_MODEL = "model";
export const ATTR_FACTORY = "factory";

// flags
export const FLAG_PROJECTILE = 1;
export const FLAG_COLLIDABLE = 2;

// tags for game objects
export const TAG_COPTER = "copter";
export const TAG_TOWER = "tower";
export const TAG_TURRET = "turret";
export const TAG_CANNON = "cannon";
export const TAG_GROUND = "ground";
export const TAG_SCORE = "score";
export const TAG_GAMEOVER = "gameover";
export const TAG_LIVES = "lives";
export const TAG_PROJECTILE = "projectile";
export const TAG_PARATROOPER = "paratrooper";

// parachute states
export const STATE_FALLING = 1;
export const STATE_DEAD = 2;
export const STATE_FALLING_PARACHUTE = 3;
export const STATE_FALLING_WITHOUT_PARACHUTE = 4;
export const STATE_ON_GROUND = 5;
export const STATE_CAPTURING = 6;

// alias for config file
export const DATA_JSON = "DATA_JSON";

// texture aliases
export const TEXTURE_BOMBER = "bomber";
export const TEXTURE_CANNON = "cannon";
export const TEXTURE_COPTER_LEFT = "copter_left";
export const TEXTURE_COPTER_RIGHT = "copter_right";
export const TEXTURE_PARATROOPER_PARACHUTE = "paratrooper_parachute";
export const TEXTURE_PARATROOPER = "paratrooper";
export const TEXTURE_PROJECTILE = "projectile";
export const TEXTURE_TOWER = "tower";
export const TEXTURE_TURRET = "turret";

// sound aliases
export const SOUND_FIRE = "fire";
export const SOUND_GAMEOVER = "gameover";
export const SOUND_KILL = "kill";

// height of the scene will be set to 50 units for the purpose of better calculations
export const SCENE_HEIGHT = 50;

// native height of the game canvas. If bigger, it will be resized accordingly
export const SPRITES_RESOLUTION_HEIGHT = 400;

// native speed of the game
export const GAME_SPEED = 1;