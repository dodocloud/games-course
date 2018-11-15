// message keys
export const MSG_GAME_STARTED = "GAME_STARTED";
export const MSG_ROUND_STARTED = "ROUND_STARTED";
export const MSG_OBJECT_HIT = "OBJECT_HIT";
export const MSG_GAME_OVER = "GAME_OVER";
export const MSG_LEVEL_COMPLETED = "LEVEL_COMPLETED";
export const MSG_LEVEL_STARTED = "LEVEL_STARTED";
export const MSG_GAME_COMPLETED = "GAME_COMPLETED";
export const MSG_BALL_OUTSIDE_AREA = "BALL_OUTSIDE_AREA";
export const MSG_LIFE_LOST = "LIFE_LOST";

export const MSG_COMMAND_FINISH_LEVEL = "CMD_FINISH_LEVEL";
export const MSG_COMMAND_GAME_OVER = "CMD_GAME_OVER";
export const MSG_COMMAND_GOTO_NEXT_ROUND = "CMD_GOTO_NEXT_ROUND";

// sound aliases
export const SOUND_HIT = "HIT";
export const SOUND_GAMEOVER = "GAMEOVER";
export const SOUND_INTRO = "INTRO";
export const SOUND_ROUND = "ROUND";

// alias for config file
export const DATA_JSON = "DATA_JSON";

// alias for texture
export const TEXTURE_ARKANOID = "arkanoid";

// attribute keys
export const ATTR_MODEL = "MODEL";
export const ATTR_FACTORY = "FACTORY";

// tags for game objects
export const TAG_LEFT_PANEL = "left_panel";
export const TAG_RIGHT_PANEL = "right_panel";
export const TAG_TOP_PANEL = "top_panel";
export const TAG_PADDLE = "paddle";
export const TAG_BRICKS = "bricks";
export const TAG_BALL = "ball";
export const TAG_SHIP = "ship";
export const TAG_STARS = "stars";
export const TAG_TITLE = "title";
export const TAG_LIFE = "life";
export const TAG_STATUS = "status";

// aliases for hit types
export const HIT_TYPE_BORDER_LEFT = 1;
export const HIT_TYPE_BORDER_RIGHT = 2;
export const HIT_TYPE_BORDER_TOP = 3;
export const HIT_TYPE_PADDLE = 4;
export const HIT_TYPE_BRICK = 5;

// aliases for bricks
export const BRICK_TYPE_NONE = 0;
export const BRICK_TYPE_INDSTRUCTIBLE = 1;

// height of the scene will be set to 25 units for the purpose of better calculations
export const SCENE_HEIGHT = 25;

// native height of the game canvas. If bigger, it will be resized accordingly
export const SPRITES_RESOLUTION_HEIGHT = 400;

// native speed of the game
export const GAME_SPEED = 1;