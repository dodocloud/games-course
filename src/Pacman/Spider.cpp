#include "AphMain.h"
#include "Spider.h"

void Spider::Update(Map& tileMap, MovementInfo& info) {

	// make a decision only if the spider isn't inside a tunnel (because we don't want it to turn around)
	if (info.isInCenter && tileMap.GetTile(info.intPartX, info.intPartY).specialFunction != FUNCTION_TUNNEL) {
		DecideNextMovement(tileMap, info);
	}

	// follow the current direction and update animation
	FollowPath(info);
	UpdateAnimation();
}


void Spider::DecideNextMovement(Map& tileMap, MovementInfo& info) {

	// search for new possible direction
	Direction newDirection = SearchNewDirection(tileMap, dir, info.intPartX, info.intPartY);

	if (newDirection != dir && (lastDecisionX != info.intPartX || lastDecisionY != info.intPartY)) {
		// we can change direction

		lastDecisionX = info.intPartX;
		lastDecisionY = info.intPartY;

		// 50% probability that we change the direction
		if (ofRandom(0, 1) > 0.5f) {
			dir = newDirection;
		}
	}
	else if (!tileMap.CanGoAlongDirection(dir, info.intPartX, info.intPartY)) {
		// we cannot go further nor change direction -> go back

		Direction opposite = tileMap.GetOppositeDirection(dir, info.intPartX, info.intPartY);

		if (opposite != dir) {
			dir = opposite;
		}
		else {
			// this happens when we actually can change the direction but we didn't decide to do so 
			// (there is a 50% probability to change a direction)
			dir = newDirection;
		}
	}
}


Direction Spider::SearchNewDirection(Map& tileMap, Direction dir, int x, int y) {
	
	bool canGoUp = tileMap.CanGoUp(x, y);
	bool canGoDown = tileMap.CanGoDown(x, y);
	bool canGoLeft = tileMap.CanGoLeft(x, y);
	bool canGoRight = tileMap.CanGoRight(x, y);

	// 50% for both directions (spider never turns around unless there is no other way)
	bool rnd = ofRandom(0, 1) > 0.5f;

	switch (dir) {
	case Direction::LEFT:
		if (canGoUp && canGoDown) {
			if (rnd) return Direction::UP;
			else return Direction::DOWN;
		}
		return canGoUp ? Direction::UP : (canGoDown ? Direction::DOWN : dir);
	case Direction::RIGHT:
		if (canGoUp && canGoDown) {
			if (rnd) return Direction::UP;
			else return Direction::DOWN;
		}
		return canGoUp ? Direction::UP : (canGoDown ? Direction::DOWN : dir);
	case Direction::UP:
		if (canGoLeft && canGoRight) {
			if (rnd) return Direction::LEFT;
			else return Direction::RIGHT;
		}
		return canGoLeft ? Direction::LEFT : (canGoRight ? Direction::RIGHT : dir);
	case Direction::DOWN:
		if (canGoLeft && canGoRight) {
			if (rnd) return Direction::LEFT;
			else return Direction::RIGHT;
		}
		return canGoLeft ? Direction::LEFT : (canGoRight ? Direction::RIGHT : dir);
	}
}

void Spider::UpdateAnimation() {

	// set base frame according to the current state (green vs black spider)
	int base = state == STATE_RUSH_MODE ? 32 : 0;

	// use modulo for circular animation
	if (dir == Direction::LEFT) {
		sprite->SetFrame((sprite->GetFrame() + 1) % 8 + 16 + base);
	}
	else if (dir == Direction::RIGHT) {
		sprite->SetFrame((sprite->GetFrame() + 1) % 8 + 24 + base);
	}
	else if (dir == Direction::UP) {
		sprite->SetFrame((sprite->GetFrame() + 1) % 8 + 8 + base);
	}
	else if (dir == Direction::DOWN) {
		sprite->SetFrame((sprite->GetFrame() + 1) % 8 + 0 + base);
	}
}