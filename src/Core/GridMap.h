#pragma once


#include <unordered_map>
#include <unordered_set>
#include <array>
#include "Vec2i.h"


enum class MapType {
	TILE, OCTILE
};

/**
* Grid-based map for searching algorithms
*/
class GridMap {
	// grid size
	int width, height;
	// places that can't be crossed
	unordered_set<Vec2i> obstructions;
	// elevations of map blocks
	unordered_map<Vec2i, int> elevations;
	MapType mapType = MapType::TILE;
	int maxElevation;
public:

	GridMap() {
		
	}

	GridMap(MapType mapType, int maxElevation) : mapType(mapType), maxElevation(maxElevation), width(0), height(0) {

	}

	GridMap(MapType mapType, int maxElevation, int width, int height)
		: mapType(mapType), maxElevation(maxElevation), width(width), height(height) {
	}


	int GetWidth() const {
		return width;
	}

	int GetHeight() const {
		return height;
	}

	void SetWidth(int width) {
		this->width = width;
	}

	void SetHeight(int height) {
		this->height = height;
	}

	int GetElevation() const {
		return maxElevation;
	}

	MapType GetMapType() const {
		return mapType;
	}

	void SetMapType(MapType mapType) {
		this->mapType = mapType;
	}

	/**
	* Sets elevation at given position
	*/
	void SetElevation(Vec2i pos, int cost);

	/**
	* Adds a new obstruction at selected position that can't be crossed
	*/
	void AddObstruction(int x, int y);

	/**
	* Removes obstruction at selected position
	*/
	void RemoveObstruction(int x, int y);

	/**
	* Inserts a rectangle area into grid that couldn't be crossed
	*/
	void AddObstructions(int x1, int y1, int x2, int y2);

	/**
	* Returns true, if the grid has an obstruction at selected position
	*/
	bool HasObstruction(int x, int y);

	bool HasObstruction(Vec2i pos) {
		return this->HasObstruction(pos.x, pos.y);
	}

	/**
	* Gets all neighbors of selected position
	* @param pos position of reference cell
	* @param output output collection
	*/
	void GetNeighbors(Vec2i pos, vector<Vec2i>& output) const;

	/**
	 * Gets elevation of the map block
	 */
	int GetElevation(Vec2i position) const {
		return (elevations.find(position) != elevations.end()) 
		? elevations.find(position)->second : 1; // return 1 by default
	}

	/**
	* Gets cost to pass between two blocks
	*/
	int GetCost(Vec2i from, Vec2i to) const {
		// TODO place your yode here
		return GetElevation(from);
	}

private:
	/** Returns true, if the position is inside the grid */
	inline bool IsInside(Vec2i id) const {
		return 0 <= id.x && id.x < width && 0 <= id.y && id.y < height;
	}

	inline bool IsInside(int x, int y) const {
		return 0 <= x && x < width && 0 <= y && y < height;
	}
};
