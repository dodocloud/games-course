#pragma once

#include <utility>
#include <queue>
#include <algorithm>
#include "Vec2i.h"

#include "GridMap.h"
#include <set>
using namespace std;


/**
* Context object for pathfinding algorithm
* Contains collection of output entities
*/
struct PathFinderContext {
	// map with steps from start to goal
	unordered_map<Vec2i, Vec2i> cameFrom;
	// set of all visited nodes
	set<Vec2i> visited;
	// output entity
	vector<Vec2i> pathFound;
};


template<typename T, typename priority_t>
struct PriorityQueue {
	typedef pair<priority_t, T> PQElement;
	priority_queue<PQElement, vector<PQElement>,
		std::greater<PQElement>> elements;

	inline bool empty() const { return elements.empty(); }

	inline void put(T item, priority_t priority) {
		elements.emplace(priority, item);
	}

	inline T get() {
		T best_item = elements.top().second;
		elements.pop();
		return best_item;
	}
};



class PathFinder {
	/**
	* Executes Searching algorithm and finds a path from start to goal
	* @param grid grid, above which will be conducted searching
	* @param start start position
	* @param goal target position
	* @param outputCtx output context
	* @return true, if the path was found
	*/
	virtual bool Search(const GridMap& grid, Vec2i start, Vec2i goal, PathFinderContext& outputCtx) const = 0;

protected:
	/**
	* Calculates collection of steps from start to goal, using the map of steps from the output of the search algorithm
	*/
	void CalcPathFromSteps(Vec2i start, Vec2i goal, unordered_map<Vec2i, Vec2i>& steps, vector<Vec2i>& output) const;
};

class BreadthFirstSearch : public PathFinder {
public:
	bool Search(const GridMap& grid, Vec2i start, Vec2i goal, PathFinderContext& outputCtx) const;
};

class Dijkstra : public PathFinder {
public:
	bool Search(const GridMap& grid, Vec2i start, Vec2i goal, PathFinderContext& outputCtx) const;
};

class AStarSearch : public PathFinder {
public:
	bool Search(const GridMap& grid, Vec2i start, Vec2i goal, PathFinderContext& outputCtx) const;


};
