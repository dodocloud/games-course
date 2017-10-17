#include "AphMain.h"
#include "Map.h"


MapTile& Map::GetTileByFunction(int specialFunction) {
	for (auto& til : blocks) {
		if (til.second.specialFunction == specialFunction) {
			return til.second;
		}
	}
	throw std::invalid_argument("Tile not found");
}


bool Map::CanGoAlongDirection(Direction dir, int x, int y) {
	switch (dir) {
	case Direction::LEFT: return CanGoLeft(x, y);
	case Direction::RIGHT: return CanGoRight(x, y);
	case Direction::UP: return CanGoUp(x, y);
	case Direction::DOWN: return CanGoDown(x, y);
	}
}


Direction Map::GetOppositeDirection(Direction dir, int x, int y) {
	switch (dir) {
	case Direction::LEFT: return CanGoRight(x, y) ? Direction::RIGHT : dir;
	case Direction::RIGHT: return CanGoLeft(x, y) ? Direction::LEFT : dir;
	case Direction::UP:return CanGoDown(x, y) ? Direction::DOWN : dir;
	case Direction::DOWN: return CanGoUp(x, y) ? Direction::UP : dir;
	}
}

bool Map::CanGoLeft(int x, int y) {
	auto& currentTile = GetTile(x, y);
	return currentTile.CanGoLeft();
}

bool Map::CanGoRight(int x, int y) {
	auto& currentTile = GetTile(x, y);
	return currentTile.CanGoRight();
}

bool Map::CanGoUp(int x, int y) {
	auto& currentTile = GetTile(x, y);
	auto& upTile = GetTile(x, y - 1);

	// hardcoded conditions -> we assume that the gate isn't accessible neither from left nor right and the spawner (spider gate) isn't accessible from top
	return currentTile.CanGoUp() &&
		upTile.specialFunction != FUNCTION_SPAWNER && (upTile.specialFunction != FUNCTION_GATE || upTile.state == STATE_GATE_OPENED); // hardcoded conditions
}

bool Map::CanGoDown(int x, int y) {
	auto& currentTile = GetTile(x, y);
	auto& downTile = GetTile(x, y + 1);

	// hardcoded conditions -> we assume that the gate isn't accessible neither from left nor right
	return currentTile.CanGoDown()
		&& (downTile.specialFunction != FUNCTION_GATE || downTile.state == STATE_GATE_OPENED);
}
