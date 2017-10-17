#include "AphMain.h"
#include "GameUnit.h"

int GameUnit::idCounter = 0;

void GameUnit::GetMovementInfo(bool canMove, Map& tileMap, MovementInfo& output) const {

	float intPartX = 0;
	float intPartY = 0;

	output.fractPartX = modf(posX, &intPartX);
	output.fractPartY = modf(posY, &intPartY);
	output.intPartX = (int)intPartX;
	output.intPartY = (int)intPartY;

	output.canGoDown = canMove && tileMap.CanGoDown(intPartX, intPartY);
	output.canGoLeft = canMove && tileMap.CanGoLeft(intPartX, intPartY);
	output.canGoRight = canMove && tileMap.CanGoRight(intPartX, intPartY);
	output.canGoUp = canMove && tileMap.CanGoUp(intPartX, intPartY);
	output.isInCenter = abs(output.fractPartY - 0.5f) < 0.1f && abs(output.fractPartX - 0.5f) < 0.1f;
	output.isAroundCenter = abs(output.fractPartY - 0.5f) < 0.5f && abs(output.fractPartX - 0.5f) < 0.5f;
}

void GameUnit::FollowPath(MovementInfo& info) {

	if (dir == Direction::LEFT) {
		if (info.fractPartX > 0.5f || info.canGoLeft) {
			posX -= 0.1f;
		}
		else {
			posX = (info.intPartX) + 0.5f; // align with X axis
		}
	}
	else if (dir == Direction::RIGHT) {
		if (info.fractPartX < 0.5f || info.canGoRight) {
			posX += 0.1f;
		}
		else {
			posX = (info.intPartX) + 0.5f; // align with X axis
		}
	}
	else if (dir == Direction::UP) {
		if (info.fractPartY > 0.5f || info.canGoUp) {
			posY -= 0.1f;
		}
		else {
			posY = (info.intPartY) + 0.5f; // align with Y axis
		}
	}
	else if (dir == Direction::DOWN) {
		if (info.fractPartY < 0.5f || info.canGoDown) {
			posY += 0.1f;
		}
		else {
			posY = (info.intPartY) + 0.5f; // align with Y axis
		}
	}

}

