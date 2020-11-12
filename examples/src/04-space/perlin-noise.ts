import * as ECS from '../../libs/pixi-ecs';
import { ECSExample, getBaseUrl } from '../utils/APHExample';
import { PerlinNoise, PathFinderContext, AStarSearch, GridMap, MAP_TYPE_OCTILE }  from './../../libs/aph-math';

export class PerlinNoiseView extends ECSExample {
	perlin: PerlinNoise;
	mapWidth: number;
	mapHeight: number;
	slowPathCost = 10;
	grid: GridMap;

	mapCellSize = 16; // px
	// sprites of arrows
	arrows = new Set<ECS.Sprite>();
	// pathfinding algorithm
	pathFinder = new AStarSearch();
	visitedRect = new PIXI.Rectangle(0, 32, 32, 32);

	lastCalcX = 0;
	lastCalcY = 0;
	maxElevation = 0;

	load() {
		this.mapWidth = Math.floor(this.engine.app.view.clientWidth / this.mapCellSize);
		this.mapHeight = Math.floor(this.engine.app.view.clientHeight / this.mapCellSize);
		this.perlin = new PerlinNoise(Math.random() * 50);
		this.engine.app.loader
			.reset()    // necessary for hot reload
			.add('pathfinding', `${getBaseUrl()}/assets/04-space/pathfinding.png`)
			.load(() => this.onAssetsLoaded());
	}

	// map Vec2 to indices because of hashing
	indexMapper = (vec: ECS.Vector) => {
		return vec.y * this.mapWidth + vec.x;
	}

	onAssetsLoaded() {
		// initialize grid from the static array
		this.grid = new GridMap(MAP_TYPE_OCTILE, 10, this.mapWidth, this.mapHeight);

		for (let i = 0; i < this.mapHeight; i++) {
			for (let j = 0; j < this.mapWidth; j++) {
				let perlinValue = this.perlin.interpolatedNoise(j, i, 1, 3, 20);
				let elevation = Math.floor((2 - (perlinValue + 1)) / 2 * 255); // inverted value
				this.grid.setElevation(new ECS.Vector(j, i), elevation); // max elevation is 255
				this.maxElevation = Math.max(this.maxElevation, elevation);
			}
		}

		// recreate view model
		this.recreateMap();

		// upon click, try to find a path to that particular block
		this.engine.app.view.addEventListener('mousedown', this.onMouseClick);
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
		this.engine.scene.clearScene();
		// create sprites
		for (let i = 0; i < this.mapWidth; i++) {
			for (let j = 0; j < this.mapHeight; j++) {
				let sprite = new ECS.Graphics('');
				let pos = this.mapToWorld(i, j);
				sprite.position.set(pos.x, pos.y);
				let elevation = this.grid.getElevation(new ECS.Vector(i, j));
				elevation = elevation / this.maxElevation * 255;
				sprite.beginFill((elevation << 16) + (elevation << 8) + elevation);
				sprite.drawRect(0, 0, this.mapCellSize, this.mapCellSize);
				sprite.endFill();
				this.engine.scene.stage.addChild(sprite);
			}
		}
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


		// recalculatePath
		let context = new PathFinderContext();
		let found = this.pathFinder.search(this.grid, new ECS.Vector(0, 15), new ECS.Vector(x, y), context);


		if (found) {
			// create arrows for the path
			for (let i = 0; i < context.pathFound.length - 1; i++) {
				let from = context.pathFound[i];

				let textureCl = texture.clone();
				let sprite = new ECS.Sprite('', textureCl);
				sprite.scale.set(this.mapCellSize / 32 * 2);
				let pos = this.mapToWorld(from.x, from.y);
				sprite.position.set(pos.x + 16, pos.y + 16);
				sprite.anchor.set(0.5);
				textureCl.frame = this.visitedRect;
				this.engine.scene.stage.addChild(sprite);
				this.arrows.add(sprite);
			}
		}
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

	destroy() {
		this.engine.app.view.removeEventListener('mousedown', this.onMouseClick);
	}
}