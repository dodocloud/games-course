#pragma once

#include "GameUnit.h"

/**
 * Spider entity
 */
class Spider : public GameUnit {
public:
	
	/**
	* Moves game unit according to very simple decision algorithm
	*/
	void Update(Map& tileMap, MovementInfo& info);

private:

	// position upon which the last decision was made
	int lastDecisionX = 0;
	int lastDecisionY = 0;

	/**
	* Decides what to do next
	*/
	void DecideNextMovement(Map& tileMap, MovementInfo& info);

	/**
	* Randomly searches for a new direction
	*/
	Direction SearchNewDirection(Map& tileMap, Direction dir, int x, int y);

	/**
	* Animates game unit according to its current state
	*/
	void UpdateAnimation();

};
