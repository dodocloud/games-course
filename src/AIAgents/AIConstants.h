#pragma once

#include "StrId.h"


// object names
#define OBJECT_AI_ROOT "root"

#define FILE_SPRITES "Examples/aiexample.png"
#define FILE_FONT "Examples/seguisb.ttf"

#define MAP_BLOCK_PATH 0
#define MAP_BLOCK_WALL 1
#define MAP_BLOCK_WAREHOUSE 2
#define MAP_BLOCK_ORE 3
#define MAP_BLOCK_PETROL 4
#define AIMAP_WIDTH 10
#define AIMAP_HEIGHT 10

extern char AI_MODEL[];
extern char ATTR_AGENTMODEL[];

extern StrId NET_MSG_AGENT_UPDATE;
extern StrId NET_MSG_AGENT_CREATED;
extern StrId NET_MSG_AGENTS_SNAPSHOT;