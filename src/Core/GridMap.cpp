#include "GridMap.h"


void GridMap::SetElevation(Vec2i pos, int cost) {
	elevations[pos] = cost;
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

	if (mapType == MapType::TILE) {
		Vec2i n1 = Vec2i(pos.x - 1, pos.y);
		Vec2i n2 = Vec2i(pos.x + 1, pos.y);
		Vec2i n3 = Vec2i(pos.x, pos.y - 1);
		Vec2i n4 = Vec2i(pos.x, pos.y + 1);
		if (IsInside(n1) && !obstructions.count(n1)) output.push_back(n1);
		if (IsInside(n2) && !obstructions.count(n2)) output.push_back(n2);
		if (IsInside(n3) && !obstructions.count(n3)) output.push_back(n3);
		if (IsInside(n4) && !obstructions.count(n4)) output.push_back(n4);
	}
	else if (mapType == MapType::OCTILE) {
		Vec2i west = Vec2i(pos.x - 1, pos.y);		
		Vec2i east = Vec2i(pos.x + 1, pos.y);			
		Vec2i north = Vec2i(pos.x, pos.y - 1);		
		Vec2i south = Vec2i(pos.x, pos.y + 1);		
		Vec2i northWest = Vec2i(pos.x - 1, pos.y - 1);		
		Vec2i southEast = Vec2i(pos.x + 1, pos.y + 1);		
		Vec2i northEast = Vec2i(pos.x + 1, pos.y - 1);		
		Vec2i southWest = Vec2i(pos.x - 1, pos.y + 1);	

		if (IsInside(west) && !obstructions.count(west)) output.push_back(west);
		if (IsInside(east) && !obstructions.count(east)) output.push_back(east);
		if (IsInside(north) && !obstructions.count(north)) output.push_back(north);
		if (IsInside(south) && !obstructions.count(south)) output.push_back(south);
		if (IsInside(northWest) && !obstructions.count(northWest) && !obstructions.count(north) && !obstructions.count(west)) output.push_back(northWest);
		if (IsInside(southEast) && !obstructions.count(southEast) && !obstructions.count(south) && !obstructions.count(east)) output.push_back(southEast);
		if (IsInside(northEast) && !obstructions.count(northEast) && !obstructions.count(north) && !obstructions.count(east)) output.push_back(northEast);
		if (IsInside(southWest) && !obstructions.count(southWest) && !obstructions.count(south) && !obstructions.count(west)) output.push_back(southWest);
	}
}