#pragma once

#include "States.h"
#include "MovementInfo.h"
#include "Map.h"
#include "Sprite.h"

/**
* Container for game objects
*/
struct GameUnit {
	static int idCounter; // incremental id counter

	GameUnit() {
		this->id = idCounter++;
	}

	// identifier
	int id;
	// x-position in the grid [0,0] for the top-left map cell
	float posX = 0;
	// y-position in the grid [0,0] for the top-left map cell
	float posY = 0;
	Direction dir = Direction::LEFT;
	// each game object can have its state
	int state = STATE_NONE;
	// unit sprite
	Sprite* sprite;

	/**
	* Fills entity that keeps movement information
	* @param canMove parameter that overrides movement possibilities
	*/
	void GetMovementInfo(bool canMove, Map& tileMap, MovementInfo& output) const;

	/**
	* Moves the game unit according to its direction
	*/
	void FollowPath(MovementInfo& info);
};
