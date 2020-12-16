import * as ECS from '../../../libs/pixi-ecs';
import { AStarSearch, GridMap, MAP_TYPE_TILE, PathFinderContext } from '../../../libs/aph-math';
import { MapBlocks, MAP_BLOCK_SIZE } from './constants';

/**
 * Block of a map
 */
export class MapBlock {
	x = 0; // left offset
	y = 0; // top offset
	type = 0; // map type
	state = 0;
}

const DIRECTION_EAST = 1;
const DIRECTION_WEST = 2;
const DIRECTION_NORTH = 3;
const DIRECTION_SOUTH = 4;

/**
 * Model for the map
 */
export class GameMap {
	// all map blocks, mapped by their indices
	blocks = new Map<number, MapBlock>();
	// structure for pathfinding
	gridMap: GridMap;
	astar = new AStarSearch();
	// size of the map
	width = 0;
	height = 0;

	getBlock(x: number, y: number): MapBlock {
		return this.blocks.get(y * this.width + x);
	}

	setBlock(x: number, y: number, block: MapBlock) {
		this.blocks.set(y * this.width + x, block);
	}

	/**
		* Initializes grid map for pathfinding
		*/
	initGridMap() {
		this.gridMap = new GridMap(MAP_TYPE_TILE, 10, this.width, this.height);
		for (let [, block] of this.blocks) {
			if (block.type === MapBlocks.WALL) {
				this.gridMap.addObstruction(new ECS.Vector(block.x, block.y));
			}
		}
	}

	/*
		* Finds nearest map block by type
		*/
	findNearestMapBlock(currentPos: ECS.Vector, type: number): MapBlock {
		let allBlocks = this.findAllMapBlocks(type);

		let nearest: MapBlock;
		let nearestDist = 1000000;

		for (let block of allBlocks) {
			let dist = currentPos.manhattanDistance(new ECS.Vector(block.x, block.y));
			if (dist < nearestDist) {
				nearest = block;
				nearestDist = dist;
			}
		}

		return nearest;
	}

	/**
		* Finds all map blocks by given type
		*/
	findAllMapBlocks(type: number): Array<MapBlock> {
		let output = new Array<MapBlock>();
		for (let [, bl] of this.blocks) {
			if (bl.type === type) {
				output.push(bl);
			}
		}
		return output;
	}

	/**
		* Transforms map-location into world-location
		*/
	mapBlockToLocation(x: number, y: number): ECS.Vector {
		return new ECS.Vector((x * MAP_BLOCK_SIZE), (y * MAP_BLOCK_SIZE));
	}

	/**
		* Transforms list of map-locations into list of world-locations
		*/
	mapBlockToLocations(input: Array<ECS.Vector>): Array<ECS.Vector> {
		let output = new Array<ECS.Vector>();
		for (let vec of input) {
			output.push(this.mapBlockToLocation(vec.x, vec.y));
		}
		return output;
	}

	/**
		* Transforms world-location into map-location
		*/
	locationToMapBlock(loc: ECS.Vector): ECS.Vector {
		let x = Math.floor(loc.x);
		let y = Math.floor(loc.y);

		return new ECS.Vector(Math.floor(x / MAP_BLOCK_SIZE), Math.floor(y / MAP_BLOCK_SIZE));
	}

	getDirection(start: ECS.Vector, end: ECS.Vector): number {
		if (start.x + 1 === end.x && start.y === end.y) { return DIRECTION_EAST; }
		if (start.x === end.x && start.y + 1 === end.y) { return DIRECTION_SOUTH; }
		if (start.x - 1 === end.x && start.y === end.y) { return DIRECTION_WEST; }
		if (start.x === end.x && start.y - 1 === end.y) { return DIRECTION_NORTH; }
	}

	/**
		* Finds a path between two points
		* @param start start point
		* @param goal target point
		* @param outputPath output entity that will contain found path
		* @param directionPath output entity that will contain changes in direction
		*/
	findPath(start: ECS.Vector, goal: ECS.Vector, outputPath: Array<ECS.Vector>, directionPath: Array<ECS.Vector>) {
		let ctx = new PathFinderContext();
		this.astar.search(this.gridMap, start, goal, ctx);
		let found = ctx.pathFound;

		let previous = new ECS.Vector(-1);
		let current = new ECS.Vector(-1);
		let index = 0;

		// use only direction changes
		for (let path of found) {

			outputPath.push(path);
			index++;

			// add the last one
			if (index === found.length) {
				if (!directionPath[directionPath.length - 1].equals(current)) {
					directionPath.push(current); // add the last one
				}

				directionPath.push(path);
				continue;
			}

			if (previous.x === -1) {
				previous = path;
				directionPath.push(path);
				continue;
			} else if (current.x === -1) {
				current = path;
				directionPath.push(path);
				continue;
			} else if (this.getDirection(previous, current) !== this.getDirection(current, path)) {
				if (!directionPath[directionPath.length - 1].equals(current)) {
					directionPath.push(current); // add the last one
				}
			}

			previous = current;
			current = path;
		}
	}
}