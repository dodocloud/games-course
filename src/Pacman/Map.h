#pragma once

#include "States.h"

extern float ofRandom(float x, float y);

/**
 * Tile of a map
 */
class MapTile {
public:
	int x; // left offset
	int y; // top offset
	int code; // code for walking possibilities
	int specialFunction; // special function (see States.h)
	int state = 0; // custom state, used by the game

	bool CanGoLeft() {
		return (code & 0b0010) == 0b0010;
	}

	bool CanGoRight() {
		return (code & 0b0001) == 0b0001;
	}

	bool CanGoUp() {
		return (code & 0b1000) == 0b1000;
	}

	bool CanGoDown() {
		return (code & 0b0100) == 0b0100;
	}

	bool IsBlocked() {
		return code == 0b0000;
	}

	bool IsFree() {
		return !IsBlocked() && (specialFunction == FUNCTION_NONE || specialFunction == FUNCTION_BONUS);
	}
};

/**
 * Map with blocks
 */
class Map {
public:
	map<int, MapTile> blocks;
	int gridWidth;
	int gridHeight;

	/**
	 * Gets tile by its special function (e.g. tunnel, gate, spawner)
	 */
	MapTile& GetTileByFunction(int specialFunction);

	/**
	 * Gets tile by position
	 * If there is no such a position, it returns an empty object
	 */
	MapTile& GetTile(int x, int y) {
		return blocks[y*gridWidth + x];
	}

	/**
	 * Returns true, if the unit can go from given location to another one according to its direction
	 */
	bool CanGoAlongDirection(Direction dir, int x, int y);

	/**
	 * Returns opposite direction if it is accessible
	 */
	Direction GetOppositeDirection(Direction dir, int x, int y);

	bool CanGoLeft(int x, int y);
	bool CanGoRight(int x, int y);
	bool CanGoUp(int x, int y);
	bool CanGoDown(int x, int y);
};
