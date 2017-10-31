#include "GridMap.h"


void GridMap::SetCost(Vec2i pos, int cost) {
	costs[pos] = cost;
}


void GridMap::AddObstruction(int x, int y) {
	if (obstructions.find(Vec2i(x, y)) == obstructions.end()) {
		obstructions.insert(Vec2i(x, y));
	}
}

void GridMap::RemoveObstruction(int x, int y) {
	if (obstructions.find(Vec2i(x, y)) != obstructions.end()) {
		obstructions.erase(Vec2i(x, y));
	}
}

void GridMap::AddObstructions(int x1, int y1, int x2, int y2) {

	if (x1 > x2 || y1 > y2) throw std::invalid_argument("Rectangle block must be defined from topleft corner!");

	for (int x = x1; x <= x2; x++) {
		for (int y = y1; y <= y2; y++) {
			obstructions.insert(Vec2i{ x, y });
		}
	}
}

bool GridMap::HasObstruction(int x, int y) {
	return find(obstructions.begin(), obstructions.end(), Vec2i(x, y)) != obstructions.end();
}

void GridMap::GetNeighbors(Vec2i pos, vector<Vec2i>& output) const {

	Vec2i nextLeft = Vec2i(pos.x - 1, pos.y);
	Vec2i nextRight = Vec2i(pos.x + 1, pos.y);
	Vec2i nextUp = Vec2i(pos.x, pos.y - 1);
	Vec2i nextDown = Vec2i(pos.x, pos.y + 1);

	if (IsInside(nextLeft) && !obstructions.count(nextLeft)) output.push_back(nextLeft);
	if (IsInside(nextDown) && !obstructions.count(nextDown)) output.push_back(nextDown);
	if (IsInside(nextRight) && !obstructions.count(nextRight)) output.push_back(nextRight);
	if (IsInside(nextUp) && !obstructions.count(nextUp)) output.push_back(nextUp);
}
