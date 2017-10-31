#pragma once


#include <unordered_map>
#include <unordered_set>
#include <array>
#include "Vec2i.h"


/**
* Grid-based map for searching algorithms
*/
class GridMap {
	// grid size
	int width, height;
	// places that couldn't be crossed
	unordered_set<Vec2i> obstructions;
	// optimal cost of positions 
	unordered_map<Vec2i, int> costs;

public:

	GridMap() : width(0), height(0) {

	}

	GridMap(int width, int height)
		: width(width), height(height) {
	}


	int GetWidth() const {
		return width;
	}

	int GetHeight() const {
		return height;
	}

	/**
	 * Sets cost at given position
	 */
	void SetCost(Vec2i pos, int cost);

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
	* Gets cost of the position; returns 1, if no cost was specified
	*/
	int GetCost(Vec2i pos) const {
		return (costs.find(pos) != costs.end()) ? costs.find(pos)->second : 1;
	}

private:
	/** Returns true, if the position is inside the grid */
	inline bool IsInside(Vec2i id) const {
		return 0 <= id.x && id.x < width && 0 <= id.y && id.y < height;
	}
};
