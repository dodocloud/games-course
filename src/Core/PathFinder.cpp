#include "PathFinder.h"
#include "ofAppBaseWindow.h"


void PathFinder::CalcPathFromSteps(Vec2i start, Vec2i goal, unordered_map<Vec2i, Vec2i>& steps, vector<Vec2i>& output) const {
	Vec2i current = goal;
	output.push_back(current);
	while (current != start) {
		current = steps[current];
		output.push_back(current);
	}
	// reverse path so the starting position will be on the first place
	std::reverse(output.begin(), output.end());
}


bool BreadthFirstSearch::Search(const GridMap& grid, Vec2i start, Vec2i goal, PathFinderContext& outputCtx) const {
	queue<Vec2i> frontier;
	frontier.push(start);

	outputCtx.cameFrom[start] = start;

	while (!frontier.empty()) {
		auto current = frontier.front();
		outputCtx.visited.insert(current);

		frontier.pop();

		if (current == goal) {
			// the goal was achieved
			CalcPathFromSteps(start, goal, outputCtx.cameFrom, outputCtx.pathFound);
			return true;
		}

		// get neighbors of the current grid block
		vector<Vec2i> neighbors;
		grid.GetNeighbors(current, neighbors);

		for (auto& next : neighbors) {
			if (!outputCtx.cameFrom.count(next)) {
				frontier.push(next);
				outputCtx.cameFrom[next] = current;
			}
		}
	}

	return false;
}


bool Dijkstra::Search(const GridMap& grid, Vec2i start, Vec2i goal, PathFinderContext& outputCtx) const {
	// initialize priority queue, using GREATER functional template that provides descending order of priorities
	// prioritized by heuristic function
	PriorityQueue<Vec2i, int> frontier;
	unordered_map<Vec2i, int> costSoFar;

	// start with the first position
	frontier.put(start, 0);
	outputCtx.cameFrom[start] = start;
	costSoFar[start] = 0;

	while (!frontier.empty()) {
		auto current = frontier.get();
		outputCtx.visited.insert(current);

		if (current == goal) {
			// the goal was achieved
			CalcPathFromSteps(start, goal, outputCtx.cameFrom, outputCtx.pathFound);
			return true;
		}

		// get neighbors of the current grid block
		vector<Vec2i> neighbors;
		grid.GetNeighbors(current, neighbors);

		for (auto& next : neighbors) {
			double new_cost = costSoFar[current] + grid.GetCost(current, next);
			if (!costSoFar.count(next) || new_cost < costSoFar[next]) {
				costSoFar[next] = new_cost;
				outputCtx.cameFrom[next] = current;
				frontier.put(next, new_cost);
			}
		}
	}

	return false;
}



bool AStarSearch::Search(const GridMap& grid, Vec2i start, Vec2i goal, PathFinderContext& outputCtx) const {
	// initialize priority queue, using GREATER functional template that provides descending order of priorities
	// prioritized by heuristic function
	PriorityQueue<Vec2i, float> frontier;
	unordered_map<Vec2i, int> costSoFar;

	// start with the first position

	frontier.put(start, 0);
	outputCtx.cameFrom[start] = start;
	costSoFar[start] = 0;

	while (!frontier.empty()) {
		// get current position that should be explored
		auto current = frontier.get();

		outputCtx.visited.insert(current);

		if (current == goal) {
			// the goal was achieved
			CalcPathFromSteps(start, goal, outputCtx.cameFrom, outputCtx.pathFound);
			return true;
		}

		// get neighbors of the current grid block
		vector<Vec2i> neighbors;
		grid.GetNeighbors(current, neighbors);

		// explore neighbors
		for (auto& next : neighbors) {
			// calculate the increment of the cost on the current path
			int newCost = costSoFar[current] + grid.GetCost(current, next);

			// verify if a better way was found
			if (!costSoFar.count(next) || newCost < costSoFar[next]) {
				costSoFar[next] = newCost;
				// priority is price + manhattan distance between next position and the target
				float heuristics = Vec2i::ManhattanDist(next, goal);
				float priority = newCost + heuristics;

				// explore next block
				frontier.put(next, priority);
				outputCtx.cameFrom[next] = current;
			}
		}

	}

	return false;
}
