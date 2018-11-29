import { MAP_TYPE_TILE } from './../../ts/utils/GridMap';
import { GridMap } from '../../ts/utils/GridMap';
import Vec2 from '../../ts/utils/Vec2';
import { AStarSearch, PathFinderContext } from '../../ts/utils/Pathfinding';
import { MAP_BLOCK_WALL, MAP_BLOCK_SIZE } from './Constants';

/**
 * Block of a map
 */
export class MapBlock {
    x = 0; // left offset 
    y = 0; // top offset 
    type = 0; // map type
}


const DIRECTION_EAST = 1;
const DIRECTION_WEST = 2;
const DIRECTION_NORTH = 3;
const DIRECTION_SOUTH = 4;

/**
 * Model for the map
 */
export class AIMap {
    // all map blocks, mapped by their indices
    blocks = new Map<number, MapBlock>();
    // structure for pathfinding
    gridMap : GridMap;
    astar = new AStarSearch();
    // size of the map
    width = 0;
    height = 0;


    getBlock(x: number, y: number): MapBlock {
        return this.blocks.get(y * this.width + x);
    }

    setBlock(x: number, y: number, block: MapBlock) {
        this.blocks.set(y * this.width + x,  block);
    }

	/**
	 * Initializes grid map for pathfinding
	 */
    initGridMap() {
        this.gridMap = new GridMap(MAP_TYPE_TILE, 10, this.width, this.height);
        for (let [key, block] of this.blocks) {
            if (block.type == MAP_BLOCK_WALL) {
                this.gridMap.addObstruction(new Vec2(block.x, block.y));
            }
        }
    }


	/*
	 * Finds nearest map block by type
	 */
    findNearestMapBlock(currentPos: Vec2, type: number): Vec2 {
        let allBlocks = this.findAllMapBlocks(type);

        let nearest: MapBlock;
        let nearestDist = 1000000;

        for (let block of allBlocks) {
            let dist = currentPos.manhattanDistance(new Vec2(block.x, block.y));
            if (dist < nearestDist) {
                nearest = block;
                nearestDist = dist;
            }
        }

        return new Vec2(nearest.x, nearest.y);
    }

	/**
	 * Finds all map blocks by given type
	 */
    findAllMapBlocks(type: number): Array<MapBlock> {
        let output = new Array<MapBlock>();
        for (let [key, bl] of this.blocks) {
            if (bl.type == type) {
                output.push(bl);
            }
        }
        return output;
    }

	/**
	 * Transforms map-location into world-location
	 */
    mapBlockToLocation(x: number, y: number): Vec2 {
        return new Vec2((x * MAP_BLOCK_SIZE), (y * MAP_BLOCK_SIZE));
    }

	/**
	 * Transforms list of map-locations into list of world-locations
	 */
    mapBlockToLocations(input: Array<Vec2>): Array<Vec2> {
        let output = new Array<Vec2>();
        for (let vec of input) {
            output.push(this.mapBlockToLocation(vec.x, vec.y));
        }
        return output;
    }

	/**
	 * Transforms world-location into map-location
	 */
    locationToMapBlock(loc: Vec2): Vec2 {
        let x = Math.floor(loc.x);
        let y = Math.floor(loc.y);

        return new Vec2(Math.floor(x / MAP_BLOCK_SIZE), Math.floor(y / MAP_BLOCK_SIZE));
    }

    getDirection(start: Vec2, end: Vec2): number {
		if (start.x + 1 == end.x && start.y == end.y) return DIRECTION_EAST;
		if (start.x == end.x && start.y + 1 == end.y) return DIRECTION_SOUTH;
		if (start.x - 1 == end.x && start.y == end.y) return DIRECTION_WEST;
		if (start.x == end.x && start.y - 1 == end.y) return DIRECTION_NORTH;
    }

	/**
	 * Finds a path between two points
	 * @param start start point
	 * @param goal target point
	 * @param outputPath output entity that will contain found path
	 * @param directionPath output entity that will contain changes in direction
	 */
    findPath(start: Vec2, goal: Vec2, outputPath: Array<Vec2>, directionPath: Array<Vec2>) {
        let ctx = new PathFinderContext();
        this.astar.search(this.gridMap, start, goal, ctx, this.gridMap.indexMapper);
        let found = ctx.pathFound;

        let previous = new Vec2(-1);
        let current = new Vec2(-1);
        let index = 0;

        // use only direction changes
        for (let path of found) {

            outputPath.push(path);
            index++;

            // add the last one
            if (index == found.length) {
                if (!directionPath[directionPath.length - 1].equals(current)) {
                    directionPath.push(current); // add the last one
                }

                directionPath.push(path);
                continue;
            }

            if (previous.x == -1) {
                previous = path;
                directionPath.push(path);
                continue;
            }
            else if (current.x == -1) {
                current = path;
                directionPath.push(path);
                continue;
            } else if (this.getDirection(previous, current) != this.getDirection(current, path)) {
                if (!directionPath[directionPath.length - 1].equals(current)) {
                    directionPath.push(current); // add the last one
                }
            }

            previous = current;
            current = path;
        }
    }
}