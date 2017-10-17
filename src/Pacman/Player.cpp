#include "AphMain.h"
#include "Player.h"


void Player::Update(set<int>& pressedKeys, MovementInfo& info) {

	// handle inputs
	if (pressedKeys.find(OF_KEY_LEFT) != pressedKeys.end() && (abs(info.fractPartY - 0.5f) < DIRECTION_CHANGE_TOLERANCE) && info.canGoLeft) {
		ChangeDirection(info, Direction::LEFT);
	}

	if (pressedKeys.find(OF_KEY_RIGHT) != pressedKeys.end() && (abs(info.fractPartY - 0.5f) < DIRECTION_CHANGE_TOLERANCE) && info.canGoRight) {
		ChangeDirection(info, Direction::RIGHT);
	}

	if (pressedKeys.find(OF_KEY_UP) != pressedKeys.end() && (abs(info.fractPartX - 0.5f) < DIRECTION_CHANGE_TOLERANCE) && info.canGoUp) {
		ChangeDirection(info, Direction::UP);
	}

	if (pressedKeys.find(OF_KEY_DOWN) != pressedKeys.end() && (abs(info.fractPartX - 0.5f) < DIRECTION_CHANGE_TOLERANCE) && info.canGoDown) {
		ChangeDirection(info, Direction::DOWN);
	}

	// update sprite animation
	UpdateAnimation(info);
}


void Player::ChangeDirection(MovementInfo& info, Direction dir) {
	if (this->dir != dir) {
		// direction changed -> restart eating animation
		eatingAnimRunning = false;
	}

	this->dir = dir;

	if (dir == Direction::LEFT || dir == Direction::RIGHT) {
		posY = ((int)info.intPartY) + 0.5f; // align with y-axis
	}
	else {
		posX = ((int)info.intPartX) + 0.5f; // align with x-axis
	}
}

void Player::UpdateAnimation(MovementInfo& info) {

	if (state == STATE_DEAD) {
		// DEAD animation -> frames 48-62
		sprite->SetFrame(min(max(sprite->GetFrame() + 1, 48), 62));
	}
	else if (state == STATE_VICTORY) {
		// WIN animation -> frames 32-46
		sprite->SetFrame(min(max(sprite->GetFrame() + 1, 32), 46));
	}
	else {
		if (dir == Direction::LEFT) {
			// left animation -> frames 8-15
			UpdateWalkingAnim(8, info.fractPartX - 0.5f);
		}
		else if (dir == Direction::RIGHT) {
			// right animation -> frames 0-7
			UpdateWalkingAnim(0, info.fractPartX - 0.5f);
		}
		else if (dir == Direction::UP) {
			// up animation -> frames 24-31
			UpdateWalkingAnim(24, info.fractPartY - 0.5f);
		}
		else if (dir == Direction::DOWN) {
			// down animation -> frames 16-23
			UpdateWalkingAnim(16, info.fractPartY - 0.5f);
		}
	}
}

void Player::UpdateWalkingAnim(int bFrame, float distFromCenter) {

	// little hack: set the eating frame according to how far we are from the center of the grid 
	// since each pat-dot is located in the center [0.5, 0.5]
	if (eatingAnimRunning) {
		int frameIndex = (distFromCenter > 0) ? (distFromCenter * 3) : (7 + distFromCenter * 3);
		sprite->SetFrame(bFrame + frameIndex);
	}
	else {
		sprite->SetFrame(bFrame);
	}
}
