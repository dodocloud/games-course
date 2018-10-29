/**
 * @file Constants that are used across the game
 * @author Adam Vesecky <vesecky.adam@gmail.com>
 */

// steering states
export const STEERING_NONE = 0;
export const STEERING_LEFT = 1;
export const STEERING_RIGHT = 2;

// keys of game attributes
export const ATTR_GAME_MODEL = "GAME_MODEL";	// game model
export const ATTR_SPRITE_MGR = "SPRITE_MGR";	// sprite manager
export const ATTR_LANE = "LANE";			// lane index
export const ATTR_SPEED = "SPEED";			// current speed
export const ATTR_OBSTACLE_MAP = "OBST_MAP";	// ObstacleMap structure

// keys of message actions
export const MSG_ANIM_ENDED = "ANIM_ENDED";	// an animation has ended
export const MSG_CAR_COLLIDED = "CAR_COLLIED";	// a collision with player's car occurred
export const MSG_IMMUNE_MODE_STARTED = "IM_STARTED";	// immune mode has just started
export const MSG_IMMUNE_MODE_ENDED = "IM_ENDED";	// immune mode has just ended
export const MSG_COLLISION = "COLLISION"; // collision occurred  

export const LANES_NUM = 3; // default number of lanes

export const FLAG_PROJECTILE = 1;
export const FLAG_COLLIDABLE = 2;

export const STATE_DEAD = 10;