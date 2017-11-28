#pragma once
#include "StrId.h"

/**
 * Directions
 */
enum class Dir {
	UP, DOWN, LEFT, RIGHT
};


// events
extern StrId COPTER_CREATED;
extern StrId UNIT_LANDED;
extern StrId PROJECTILE_SHOT;
extern StrId UNIT_KILLED;
extern StrId ANIMATION_ENDED;
extern StrId GAME_OVER;
extern StrId PARATROOPER_CREATED;

// attributes
extern StrId MODEL;
extern StrId COLLISION;
extern StrId PARA_STATE;

// actions used for keyboard mapping
extern StrId ACTION_LEFT;
extern StrId ACTION_RIGHT;
extern StrId ACTION_FIRE;

// flags
#define FLAG_PROJECTILE 1
#define FLAG_COLLIDABLE 2
#define FLAG_DEAD 3

// object names
#define OBJECT_ROOT "root"
#define OBJECT_COPTER "copter"
#define OBJECT_PARATROOPER "paratrooper"
#define OBJECT_PROJECTILE "projectile"
#define OBJECT_TOWER "tower"
#define OBJECT_CANNON "cannon"
#define OBJECT_GAMEOVER "gameover"
#define OBJECT_GROUND "ground"
#define OBJECT_TURRET "turret"

// path to files
#define FILE_CANNON "Paratrooper/cannon.png"
#define FILE_FONT "Paratrooper/comfont.TTF"
#define FILE_CONFIG "Paratrooper/config.json"
#define FILE_COPTER_LEFT "Paratrooper/copter_left.png"
#define FILE_COPTER_RIGHT "Paratrooper/copter_right.png"
#define FILE_SOUND_FIRE "Paratrooper/fire.wav"
#define FILE_SOUND_GAMEOVER "Paratrooper/gameover.wav"
#define FILE_SOUND_KILL "Paratrooper/kill.wav"
#define FILE_PARATROOPER "Paratrooper/paratrooper.png"
#define FILE_PARATROOPER_PARACHUTE "Paratrooper/paratrooper_parachute.png"
#define FILE_PROJECTILE "Paratrooper/projectile.png"
#define FILE_TOWER "Paratrooper/tower.png"
#define FILE_TURRET "Paratrooper/turret.png"

