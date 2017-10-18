#pragma once

// units direction
enum class Direction {
	UP, DOWN, LEFT, RIGHT
};

// special function for map blocks
#define FUNCTION_NONE 0
#define FUNCTION_TUNNEL 1
#define FUNCTION_GATE 2
#define FUNCTION_SPAWNER 3
#define FUNCTION_SPAWNER_SOURCE 6
#define FUNCTION_BONUS 4
#define FUNCTION_PACMAN_SPAWN 5

// states for spawner and the yellow gate
#define STATE_NONE 0
#define STATE_GATE_CLOSED 1
#define STATE_GATE_OPENING 2
#define STATE_GATE_OPENED 3
#define STATE_GATE_CLOSING 4

// game states
#define STATE_RUSH_MODE 5 // rush mode => spiders are black and pacman can kill them
#define STATE_DEAD 6
#define STATE_VICTORY 7
