#pragma once

#include "GameUnit.h"

#define DIRECTION_CHANGE_TOLERANCE 0.1f

/**
 * Player entity
 */
class Player : public GameUnit {
public:
	// indicator whether the eating animation is running
	bool eatingAnimRunning = false;

	/**
	 * Updates state of this entity
	 */
	void Update(set<int>& pressedKeys, MovementInfo& info);

private:

	/**
	* Sets a new direction
	*/
	void ChangeDirection(MovementInfo& info, Direction dir);

	/**
	* Updates pacman's animation
	*/
	void UpdateAnimation(MovementInfo& info);


	/**
	 * Updates walking animation
	 * @param bFrame offset of frame of the current direction (e.g. 0-7 for the left direction)
	 */
	void UpdateWalkingAnim(int bFrame, float distFromCenter);
};
