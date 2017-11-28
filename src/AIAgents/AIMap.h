#pragma once

#include <map>
#include "GridMap.h"
#include "PathFinder.h"
#include "List.h"

using namespace std;


/**
 * Block of a map
 */
class MapBlock {
public:
	int x; // left offset
	int y; // top offset
	int type; // map type
};

/**
 * Model for map
 */
class AIMap {
public:
	// all map blocks, mapped by their indices
	map<int, MapBlock> blocks;
	// structure for pathfinding
	GridMap gridMap;
	AStarSearch astar;
	// size of the map
	int width;
	int height;

	MapBlock& GetBlock(int x, int y) {
		return blocks[y*width + x];
	}

	void SetBlock(int x, int y, const MapBlock& block) {
		blocks[y*width + x] = block;
	}

	/**
	 * Initializes gripd map for pathfinding
	 */
	void InitGridMap() {
		gridMap.SetWidth(width);
		gridMap.SetHeight(height);
		for (auto block : blocks) {
			if (block.second.type == MAP_BLOCK_WALL) {
				gridMap.AddObstruction(block.second.x, block.second.y);
			}
		}
	}


	/*
	 * Finds nearest map block by type
	 */
	Vec2i FindNearestMapBlock(Vec2i currentPos, int type) const {
		vector<MapBlock> allBlocks;
		FindAllMapBlocks(type, allBlocks);

		MapBlock nearest;
		int nearestDist = 1000000;

		for (auto block : allBlocks) {
			auto dist = currentPos.ManhattanDist(Vec2i(block.x, block.y));
			if (dist < nearestDist) {
				nearest = block;
				nearestDist = dist;
			}
		}

		return Vec2i(nearest.x, nearest.y);
	}

	/**
	 * Finds all map blocks by given type
	 */
	void FindAllMapBlocks(int type, vector<MapBlock>& output) const {
		for (auto bl : blocks) {
			if (bl.second.type == type) {
				output.push_back(bl.second);
			}
		}
	}

	void FindAllMapBlocks(int type, List<MapBlock>* output) const {
		for (auto bl : blocks) {
			if (bl.second.type == type) {
				output->Push(bl.second);
			}
		}
	}

	/**
	 * Transforms map-location into world-location
	 */
	ofVec2f MapBlockToLocation(int x, int y) const {
		return ofVec2f((x * 10), (y * 10));
	}

	/**
	 * Transforms list of map-locations into list of world-locations
	 */
	void MapBlockToLocations(vector<Vec2i>& input, vector<ofVec2f>& output) const {
		for(auto vec : input) {
			output.push_back(MapBlockToLocation(vec.x, vec.y));
		}
	}

	/**
	 * Transforms world-location into map-location
	 */
	Vec2i LocationToMapBlock(ofVec2f loc) const {
		int x = (int)(loc.x + 0.5f);
		int y = (int)(loc.y + 0.5f);

		return Vec2i(x / 10, y / 10);
	}


	/**
	 * Finds a path between two points
	 * @param start start point
	 * @param goal target point
	 * @param outputPath output entity that will contain found path
	 * @param directionPath output entity that will contain changes in direction
	 */
	void FindPath(Vec2i start, Vec2i goal, vector<Vec2i>& outputPath, vector<Vec2i>& directionPath) {
		PathFinderContext ctx;
		astar.Search(gridMap, start, goal, ctx);
		auto& found = ctx.pathFound;

		Vec2i previous = Vec2i(-1);
		Vec2i current = Vec2i(-1);
		int index = 0;
		
		// use only direction changes
		for (auto path : found) {
		
			outputPath.push_back(path);

			index++;

			// add the last one
			if (index == found.size()) {
				if (directionPath[directionPath.size() - 1] != current) {
					directionPath.push_back(current); // add the last one
				}

				directionPath.push_back(path);
				continue;
			}

			if (previous == -1) {
				previous = path;
				directionPath.push_back(path);
				continue;
			}
			else if (current == -1) {
				current = path;
				directionPath.push_back(path);
				continue;
			} else if (Vec2i::GetDirection(previous, current) != Vec2i::GetDirection(current, path)) {
				if (directionPath[directionPath.size() - 1] != current) {
					directionPath.push_back(current); // add the last one
				}
			}

			previous = current;
			current = path;
		}
	}
};
