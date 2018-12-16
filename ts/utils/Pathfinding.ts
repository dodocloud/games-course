import Vec2 from './Vec2';
import Queue from './datastruct/Queue';
import PriorityQueue from './datastruct/PriorityQueue';
import { GridMap } from './GridMap';

/**
 * Context object for pathfinding algorithm
 */
export class PathFinderContext {
    // map with steps from start to goal
    cameFrom = new Map<number, Vec2>();
    // set of all visited nodes 
    visited = new Set<number>();
    // output entity
    pathFound = new Array<Vec2>();
}

class Pair<A, B>{
    first: A;
    second: B;
    constructor(first: A, second: B) {
        this.first = first;
        this.second = second;
    }
}

export abstract class PathFinder {

    abstract search(grid: GridMap, start: Vec2, goal: Vec2, outputCtx: PathFinderContext, indexMapper: (Vec2) => number): boolean;

    protected calcPathFromSteps(start: Vec2, goal: Vec2, steps: Map<number, Vec2>, indexMapper: (Vec2) => number): Array<Vec2> {
        let current = goal;
        let output = new Array<Vec2>();
        output.push(current);
        while (!current.equals(start)) {
            current = steps.get(indexMapper(current));
            output.push(current);
        }
        // reverse path so the starting position will be at the first place
        output = output.reverse();
        return output;
    }
}

export class BreadthFirstSearch extends PathFinder {
    search(grid: GridMap, start: Vec2, goal: Vec2, outputCtx: PathFinderContext, indexMapper: (Vec2) => number): boolean {
        let frontier = new Queue<Vec2>();
        frontier.add(start);

        outputCtx.cameFrom.set(indexMapper(start), start);

        while (!frontier.isEmpty()) {
            let current = frontier.peek();
            outputCtx.visited.add(indexMapper(current));

            frontier.dequeue();

            if (current.equals(goal)) {
                // the goal was achieved
                outputCtx.pathFound = this.calcPathFromSteps(start, goal, outputCtx.cameFrom, indexMapper);
                return true;
            }

            // get neighbors of the current grid block 
            let neighbors = grid.getNeighbors(current);

            for (let next of neighbors) {
                if (!outputCtx.cameFrom.has(indexMapper(next))) {
                    frontier.enqueue(next);
                    outputCtx.cameFrom.set(indexMapper(next), current);
                }
            }
        }
        return false;
    }
}


export class Dijkstra extends PathFinder {
    search(grid: GridMap, start: Vec2, goal: Vec2, outputCtx: PathFinderContext, indexMapper: (Vec2) => number): boolean {
        // initialize priority queue, using GREATER comparator
        let frontier = new PriorityQueue<Pair<Vec2, number>>((itemA, itemB) => {
            if(itemA.second == itemB.second) return 0;
            return itemA.second < itemB.second ? 1 : -1;
        });

        let costSoFar = new Map<number, number>();
        
        // start with the first position
        frontier.enqueue(new Pair<Vec2, number>(start, 0));
        outputCtx.cameFrom.set(indexMapper(start), start);
        costSoFar.set(indexMapper(start), 0);

        while(!frontier.isEmpty()){
            let current = frontier.dequeue();
            outputCtx.visited.add(indexMapper(current.first));
            if(current.first.equals(goal)){
                // the goal was achieved
                outputCtx.pathFound = this.calcPathFromSteps(start, goal, outputCtx.cameFrom, indexMapper);
                return true;
            }

            // get neighbors of the current grid block 
            let neighbors = grid.getNeighbors(current.first);

            for(let next of neighbors){
                let newCost = costSoFar.get(indexMapper(current.first)) + grid.getCost(current.first, next);
                if(!costSoFar.has(indexMapper(next)) || newCost < costSoFar.get(indexMapper(next))){
                    costSoFar.set(indexMapper(next), newCost);
                    outputCtx.cameFrom.set(indexMapper(next), current.first);
                    frontier.add(new Pair<Vec2, number>(next, newCost));
                }
            }
        }

        return false;
    }
}

export class AStarSearch extends PathFinder {

    search(grid: GridMap, start: Vec2, goal: Vec2, outputCtx: PathFinderContext, indexMapper: (Vec2) => number): boolean {
        // initialize priority queue, using GREATER comparator
        let frontier = new PriorityQueue<Pair<Vec2, number>>((itemA, itemB) => {
            if(itemA.second == itemB.second) return 0;
            return itemA.second < itemB.second ? 1 : -1;
        });

        let costSoFar = new Map<number, number>();
        
        // start with the first position
        frontier.enqueue(new Pair<Vec2, number>(start, 0));
        outputCtx.cameFrom.set(indexMapper(start), start);
        costSoFar.set(indexMapper(start), 0);

        while(!frontier.isEmpty()){
            let current = frontier.dequeue();
            outputCtx.visited.add(indexMapper(current.first));
            if(current.first.equals(goal)){
                // the goal was achieved
                outputCtx.pathFound = this.calcPathFromSteps(start, goal, outputCtx.cameFrom, indexMapper);
                return true;
            }

            // get neighbors of the current grid block 
            let neighbors = grid.getNeighbors(current.first);

            // explore neighbors
            for(let next of neighbors){
                // calculate the increment of the cost on the current path
                let newCost = costSoFar.get(indexMapper(current.first)) + grid.getCost(current.first, next);
                // verify if there was a better way
                if(!costSoFar.has(indexMapper(next)) || newCost < costSoFar.get(indexMapper(next))){
                    costSoFar.set(indexMapper(next), newCost);
                    
                    // priority is price + distance between next position and the target
                    let heuristics = next.manhattanDistance(goal);
                    let priority = newCost + heuristics*1.1;

                    outputCtx.cameFrom.set(indexMapper(next), current.first);
                    frontier.add(new Pair<Vec2, number>(next, priority));
                }
            }
        }

        return false;
    }
}