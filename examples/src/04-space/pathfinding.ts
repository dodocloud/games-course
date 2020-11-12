import * as ECS from '../../libs/pixi-ecs';
import { ECSExample, getBaseUrl } from '../utils/APHExample';
import { PathFinderContext, AStarSearch, Dijkstra, BreadthFirstSearch, 
	GridMap, PathFinder, MAP_TYPE_TILE, MAP_TYPE_OCTILE } from './../../libs/aph-math';


// static map
// 0 = passable
// 1 = obstruction
// 2 = passable but higher cost (mud, forest, sand, whatever...)
let map = [
	[0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
	[0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
	[0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 1, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 2, 2, 1, 0, 0, 0, 0, 0],
];


const DIRECTION_EAST = 1;
const DIRECTION_SOUTH_EAST = 2;
const DIRECTION_SOUTH = 3;
const DIRECTION_SOUTH_WEST = 4;
const DIRECTION_WEST = 5;
const DIRECTION_NORTH_WEST = 6;
const DIRECTION_NORTH = 7;
const DIRECTION_NORTH_EAST = 8;

export enum MapType {
	TILE = 'TILE',
	OCTILE = 'OCTILE'
}

export enum PathAlgorithm {
	BREADTH_FIRST = 'BREADTH_FIRST',
	DIJKSTRA = 'DIJKSTRA',
	ASTAR = 'ASTAR'
}

export enum DistanceMeasurement {
	MANHATTAN = 'MANHATTAN',
	EUCLIDEAN = 'EUCLIDEAN'
}

export enum Heuristics {
	DEFAULT = 'DEFAULT',
	VERY_OPTIMISTIC = 'VERY_OPTIMISTIC',
	OPTIMISTIC = 'OPTIMISTIC',
	PESSIMISTIC = 'PESSIMISTIC',
	VERY_PESSIMISTIC = 'VERY_PESSIMISTIC'
}

export type PathFindingConfig = ECS.EngineConfig & {
	mapType: MapType,
	algorithm: PathAlgorithm,
	distanceMeasurement: DistanceMeasurement,
	heuristics: Heuristics
}

export class Pathfinding extends ECSExample {

	mapWidth: number;
	mapHeight: number;
	slowPathCost = 10;
	grid: GridMap;

	mapCellSize = 32; // 32px
	// sprites of arrows
	arrows = new Set<ECS.Sprite>();
	// sprites of visited blocks
	visitedBlocks = new Set<ECS.Sprite>();
	// pathfinding algorithm
	pathFinder: PathFinder;
	startPosition = new ECS.Vector(1, 8);

	// frames for sprite atlas
	startRect = new PIXI.Rectangle(32 * 3, 0, 32, 32);
	pathRect = new PIXI.Rectangle(0, 0, 32, 32);
	obstructionRect = new PIXI.Rectangle(32 * 1, 0, 32, 32);
	slowPathRect = new PIXI.Rectangle(32, 32, 32, 32);

	visitedRect = new PIXI.Rectangle(0, 32, 32, 32);
	arrowRect = new PIXI.Rectangle(32 * 2, 0, 32, 32);

	lastCalcX = 0;
	lastCalcY = 0;

	mapType: MapType;
	algorithm: PathAlgorithm;
	distanceMeasurement: DistanceMeasurement;
	heuristics: Heuristics;

	constructor(config: PathFindingConfig) {
		super(config);
		this.mapType = (config && config.mapType) || MapType.TILE;
		this.algorithm = (config && config.algorithm) || PathAlgorithm.ASTAR;
		this.distanceMeasurement = (config && config.distanceMeasurement) || DistanceMeasurement.MANHATTAN;
		this.heuristics = (config && config.heuristics) || Heuristics.DEFAULT;

		this.mapWidth = map[0].length;
		this.mapHeight = map.length;
	}

	// map Vec2 to indices because of hashing
	indexMapper = (vec: ECS.Vector) => {
		return vec.y * this.mapWidth + vec.x;
	}

	load() {
		this.engine.app.loader
		.reset()    // necessary for hot reload
		.add('pathfinding', `${getBaseUrl()}/assets/04-space/pathfinding.png`)
		.load(() => this.onAssetsLoaded());
	}

	onAssetsLoaded() {
		// initialize grid from the static array
		this.grid = new GridMap(this.mapType === MapType.TILE ? MAP_TYPE_TILE : MAP_TYPE_OCTILE, 10, this.mapWidth, this.mapHeight);

		switch (this.algorithm) {
			case PathAlgorithm.ASTAR:
				this.pathFinder = new AStarSearch();
				break;
			case PathAlgorithm.BREADTH_FIRST:
				this.pathFinder = new BreadthFirstSearch();
				break;
			case PathAlgorithm.DIJKSTRA:
				this.pathFinder = new Dijkstra();
				break;
		}

		for (let i = 0; i < this.mapHeight; i++) {
			for (let j = 0; j < this.mapWidth; j++) {
				let mapCell = map[i][j];
				if (mapCell === 1) {
					// add obstacles
					this.grid.addObstruction(new ECS.Vector(j, i));
				} else if (mapCell === 2) {
					// add block with higher cost to cross
					this.grid.setElevation(new ECS.Vector(j, i), this.slowPathCost);
				} else {
					// 0 -> nothing to do
				}
			}
		}

		// recreate view model
		this.recreateMap();

		// upon click, try to find a path to that particular block
		let canvas = this.engine.app.view;
		canvas.addEventListener('mousedown', this.onMouseClick);
	}

	onMouseClick = (evt) => {
		let rect = this.engine.app.view.getBoundingClientRect();
		let clientX = evt.clientX;
		let clientY = evt.clientY;
		let res = this.engine.scene.app.renderer.resolution;
		let posX = Math.round((clientX - rect.left) / (rect.right - rect.left) * this.engine.scene.app.view.width / res);
		let posY = Math.round((clientY - rect.top) / (rect.bottom - rect.top) * this.engine.scene.app.view.height / res);
		let mapBox = this.worldToMap(posX, posY);
		if (mapBox.x !== this.lastCalcX || mapBox.y !== this.lastCalcY) {
			this.recalc(mapBox.x, mapBox.y);
		}
	}

	/**
	 * Recreates view-model
	 */
	recreateMap() {
		let texture = new PIXI.Texture(PIXI.BaseTexture.from('pathfinding'));
		this.engine.scene.clearScene();

		// create sprites
		for (let i = 0; i < this.mapWidth; i++) {
			for (let j = 0; j < this.mapHeight; j++) {
				let textureCl = texture.clone();
				let sprite = new ECS.Sprite('', textureCl);
				let pos = this.mapToWorld(i, j);
				sprite.position.set(pos.x, pos.y);
				textureCl.frame = this.getSpriteFrame(new ECS.Vector(i, j));
				this.engine.scene.stage.addChild(sprite);
			}
		}

		// render starting point
		let textureCl = texture.clone();
		let sprite = new ECS.Sprite('', textureCl);
		let pos = this.mapToWorld(this.startPosition.x, this.startPosition.y);
		sprite.position.set(pos.x, pos.y);
		textureCl.frame = this.startRect;
		this.engine.scene.stage.addChild(sprite);
	}

	recalc(x: number, y: number) {
		this.lastCalcX = x;
		this.lastCalcY = y;

		let texture = new PIXI.Texture(PIXI.BaseTexture.from('pathfinding'));

		// remove all sprites
		for (let arrow of this.arrows) {
			arrow.destroy();
		}
		this.arrows.clear();

		for (let block of this.visitedBlocks) {
			block.destroy();
		}
		this.visitedBlocks.clear();

		// recalculatePath
		let context = new PathFinderContext();
		let found = this.searchPath(context, new ECS.Vector(x, y));

		// create sprites for visited blocks (red square)
		for (let visited of context.visited) {
			let textureCl = texture.clone();
			let sprite = new ECS.Sprite('', textureCl);
			let mapCoord = this.mapCoordByIndex(visited);
			let pos = this.mapToWorld(mapCoord.x, mapCoord.y);
			sprite.position.set(pos.x, pos.y);
			textureCl.frame = this.visitedRect;
			this.engine.scene.stage.addChild(sprite);
			this.visitedBlocks.add(sprite);
		}

		if (found) {
			// create arrows for the path
			for (let i = 0; i < context.pathFound.length - 1; i++) {
				let from = context.pathFound[i];
				let to = context.pathFound[i + 1];

				let textureCl = texture.clone();
				let sprite = new ECS.Sprite('', textureCl);
				let pos = this.mapToWorld(from.x, from.y);
				sprite.position.set(pos.x + 16, pos.y + 16);
				sprite.anchor.set(0.5);
				textureCl.frame = this.arrowRect;
				this.engine.scene.stage.addChild(sprite);
				this.arrows.add(sprite);

				let direction = this.getDirection(from, to);

				switch (direction) {
					case DIRECTION_NORTH:
						sprite.rotation = -Math.PI / 2;
						break;
					case DIRECTION_NORTH_EAST:
						sprite.rotation = -Math.PI / 4;
						break;
					case DIRECTION_EAST:
						sprite.rotation = 0;
						break;
					case DIRECTION_SOUTH_EAST:
						sprite.rotation = Math.PI / 4;
						break;
					case DIRECTION_SOUTH:
						sprite.rotation = Math.PI / 2;
						break;
					case DIRECTION_SOUTH_WEST:
						sprite.rotation = 3 * Math.PI / 4;
						break;
					case DIRECTION_WEST:
						sprite.rotation = Math.PI;
						break;
					case DIRECTION_NORTH_WEST:
						sprite.rotation = -3 * Math.PI / 4;
						break;
				}
			}
		}
	}

	searchPath(context: PathFinderContext, target: ECS.Vector): boolean {
		if (this.algorithm === PathAlgorithm.ASTAR) {
			let astar = this.pathFinder as AStarSearch;
			let heurFunc: (cost: number, distance: number) => number;
			switch (this.heuristics) {
				case Heuristics.DEFAULT:
					heurFunc = (cost, distance) => cost + distance;
					break;
				case Heuristics.OPTIMISTIC:
					heurFunc = (cost, distance) => cost + distance * 1.2;
					break;
				case Heuristics.PESSIMISTIC:
					heurFunc = (cost, distance) => cost + distance / 1.2;
					break;
				case Heuristics.VERY_OPTIMISTIC:
					heurFunc = (cost, distance) => cost + distance * 5;
					break;
				case Heuristics.VERY_PESSIMISTIC:
					heurFunc = (cost, distance) => cost + distance / 5;
					break;
			}
			return astar.search(this.grid, this.startPosition, target, context, this.distanceMeasurement === DistanceMeasurement.EUCLIDEAN ? 'euclidean' : 'manhattan', heurFunc);
		} else {
			return this.pathFinder.search(this.grid, this.startPosition, target, context);
		}
	}


	/**
	 * Sets sprite index according to the type of the block of the map
	 */
	getSpriteFrame(mapPos: ECS.Vector): PIXI.Rectangle {
		let elevation = this.grid.getElevation(mapPos);
		let hasObstr = this.grid.hasObstruction(mapPos);

		if (hasObstr) {
			return this.obstructionRect;
		}
		if (elevation === 1) {
			return this.pathRect;
		}

		return this.slowPathRect;
	}

	/**
		* Transforms map coordinates into world coordinates
		*/
	mapToWorld(x: number, y: number) {
		return new ECS.Vector(x * this.mapCellSize, y * this.mapCellSize);
	}

	/**
	 * Transforms world coordinates into map coordinates
	 */
	worldToMap(x: number, y: number) {
		return new ECS.Vector(Math.floor(x / this.mapCellSize), Math.floor(y / this.mapCellSize));
	}

	/**
	 * Gets map index by coordinate
	 */
	mapIndexByCoord(x: number, y: number) {
		return y * this.mapWidth + x;
	}

	/**
	 * Gets map coordinate by index
	 */
	mapCoordByIndex(index: number) {
		return new ECS.Vector(index % this.mapWidth, Math.floor(index / this.mapWidth));
	}

	getDirection(start: ECS.Vector, end: ECS.Vector): number {
		if (start.x + 1 === end.x && start.y === end.y) { return DIRECTION_EAST; }
		if (start.x + 1 === end.x && start.y + 1 === end.y) { return DIRECTION_SOUTH_EAST; }
		if (start.x === end.x && start.y + 1 === end.y) { return DIRECTION_SOUTH; }
		if (start.x - 1 === end.x && start.y + 1 === end.y) { return DIRECTION_SOUTH_WEST; }
		if (start.x - 1 === end.x && start.y === end.y) { return DIRECTION_WEST; }
		if (start.x - 1 === end.x && start.y - 1 === end.y) { return DIRECTION_NORTH_WEST; }
		if (start.x === end.x && start.y - 1 === end.y) { return DIRECTION_NORTH; }
		if (start.x + 1 === end.x && start.y - 1 === end.y) { return DIRECTION_NORTH_EAST; }
	}
}
