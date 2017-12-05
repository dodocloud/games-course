#pragma once

#include "StrId.h"

// brick types
#define ARK_BRICK_NONE 0
#define ARK_BRICK_1 1
#define ARK_BRICK_2 2
#define ARK_BRICK_3 3
#define ARK_BRICK_4 4
#define ARK_BRICK_5 5
#define ARK_BRICK_6 6

// gray brick is indestructible!
#define ARK_BRICK_INDESTRUCTIBLE ARK_BRICK_1

// key actions
extern StrId ARK_ACTION_LEFT;
extern StrId ARK_ACTION_RIGHT;
extern StrId ARK_ACTION_RELEASE;

// game events
extern StrId ARK_EVENT_GAME_STARTED;
extern StrId ARK_EVENT_LEVEL_STARTED;
extern StrId ARK_EVENT_ROUND_STARTED;
extern StrId ARK_EVENT_OBJECT_HIT;
extern StrId ARK_EVENT_BALL_OUTSIDE_AREA;
extern StrId ARK_EVENT_GAME_OVER;
extern StrId ARK_EVENT_LEVEL_COMPLETED;
extern StrId ARK_EVENT_GAME_COMPLETED;
extern StrId ARK_EVENT_LIFE_LOST;

// game commands
extern StrId ARK_COMMAND_FINISH_LEVEL;

// attributes
extern char ARKANOID_MODEL[];

// sounds
#define FILE_SOUND_HIT "Examples/arkanoid/hit.wav"
#define FILE_SOUND_ROUND "Examples/arkanoid/round.mp3"
#define FILE_SOUND_GAME_OVER "Examples/arkanoid/gameover.mp3"
#define FILE_SOUND_GAME_START "Examples/arkanoid/intro.mp3"