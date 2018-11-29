import { MAP_TYPE_OCTILE } from './../../ts/utils/GridMap';
import { PixiRunner } from '../../ts/PixiRunner'
import { PIXICmp } from '../../ts/engine/PIXIObject';
import { GridMap, MAP_TYPE_TILE } from '../../ts/utils/GridMap';
import Vec2 from '../../ts/utils/Vec2';
import { PathFinderContext, AStarSearch, Dijkstra, BreadthFirstSearch } from '../../ts/utils/Pathfinding';


// static map
// 0 = passable
// 1 = obstruction
// 2 = passable but higher cost (mud, forest, sand, whatever...)
let map = [
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 2, 2, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 2, 2, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
    [0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 2, 2, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0, 2, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 1, 0, 1, 0, 2, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 2, 2, 2, 0, 1, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 1, 1, 1, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 1, 0, 0, 0, 0, 0, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
    [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 2, 2, 2, 1, 0, 0, 1, 0, 0]
];


const DIRECTION_EAST = 1;
const DIRECTION_SOUTH_EAST = 2;
const DIRECTION_SOUTH = 3;
const DIRECTION_SOUTH_WEST = 4;
const DIRECTION_WEST = 5;
const DIRECTION_NORTH_WEST = 6;
const DIRECTION_NORTH = 7;
const DIRECTION_NORTH_EAST = 8;

class Pathfinding {
    engine: PixiRunner;

    mapWidth: number;
    mapHeight: number;
    slowPathCost = 10;
    grid: GridMap;
    indexMapper: (vec: Vec2) => number;
    mapCellSize = 32; // 32px
    // sprites of arrows
    arrows = new Set<PIXICmp.Sprite>();
    // sprites of visited blocks
    visitedBlocks = new Set<PIXICmp.Sprite>();
    // pathfinding algorithm
    pathFinder = new AStarSearch();

    // frames for sprite atlas
    pathRect = new PIXI.Rectangle(0, 0, 32, 32);
    obstructionRect = new PIXI.Rectangle(32 * 1, 0, 32, 32);
    slowPathRect = new PIXI.Rectangle(32, 32, 32, 32);

    visitedRect = new PIXI.Rectangle(0, 32, 32, 32);
    path5 = new PIXI.Rectangle(32, 32, 32, 32);
    arrowRect = new PIXI.Rectangle(32 * 2, 0, 32, 32);

    constructor() {
        this.engine = new PixiRunner();
        this.engine.init(document.getElementById("gameCanvas") as HTMLCanvasElement, 1);


        this.mapWidth = map[0].length;
        this.mapHeight = map.length;

        // map Vec2 to indices because of hashing
        this.indexMapper = (vec: Vec2) => {
            return vec.y * this.mapWidth + vec.x;
        }


        PIXI.loader
            .reset()    // necessary for hot reload
            .add("pathfinding", "static/examples/pathfinding.png")
            .load(() => this.onAssetsLoaded());
    }

    onAssetsLoaded() {
        // initialize grid from the static array
        this.grid = new GridMap(MAP_TYPE_TILE, 10, this.mapWidth, this.mapHeight);

        for (let i = 0; i < this.mapHeight; i++) {
            for (let j = 0; j < this.mapWidth; j++) {
                let mapCell = map[i][j];
                if (mapCell == 1) {
                    // add obstacles
                    this.grid.addObstruction(new Vec2(j, i));
                }
                else if (mapCell == 2) {
                    // add block with higher cost to cross
                    this.grid.setElevation(new Vec2(j, i), this.slowPathCost);
                }
                else {
                    // 0 -> nothing to do
                }
            }
        }

        // recreate view model
        this.recreateMap();

        // upon click, try to find a path to that particular block
        let canvas = document.getElementById("gameCanvas");
        canvas.addEventListener("mousedown", (evt) => {
            let bbox = canvas.getBoundingClientRect();
            let posX = evt.clientX - bbox.left;
            let posY = evt.clientY - bbox.top;

            let mapBox = this.worldToMap(posX, posY);
            if (mapBox.x != this.lastCalcX || mapBox.y != this.lastCalcY) {
                this.recalc(mapBox.x, mapBox.y);
            }
        });
    }


    /**
     * Recreates view-model
     */
    recreateMap() {

        let texture = PIXI.Texture.fromImage("pathfinding");
        this.engine.scene.clearScene();

        // create sprites
        for (let i = 0; i < this.mapWidth; i++) {
            for (let j = 0; j < this.mapHeight; j++) {
                let textureCl = texture.clone();
                let sprite = new PIXICmp.Sprite("", textureCl);
                let pos = this.mapToWorld(i, j);
                sprite.position.set(pos.x, pos.y);
                textureCl.frame = this.getSpriteFrame(new Vec2(i, j));
                this.engine.scene.stage.getPixiObj().addChild(sprite);
            }
        }
    }


    lastCalcX = 0;
    lastCalcY = 0;

    recalc(x: number, y: number) {
        this.lastCalcX = x;
        this.lastCalcY = y;

        let texture = PIXI.Texture.fromImage("pathfinding");

        // remove all sprites
        for (let arrow of this.arrows) {
            arrow.remove();
        }
        this.arrows.clear();

        for (let block of this.visitedBlocks) {
            block.remove();
        }
        this.visitedBlocks.clear();

        // recalculatePath
        let context = new PathFinderContext();
        let found = this.pathFinder.search(this.grid, new Vec2(0, 15), new Vec2(x, y), context, this.indexMapper);

        // create sprites for visited blocks (red square)
        for (let visited of context.visited) {
            let textureCl = texture.clone();
            let sprite = new PIXICmp.Sprite("", textureCl);
            let mapCoord = this.mapCoordByIndex(visited);
            let pos = this.mapToWorld(mapCoord.x, mapCoord.y);
            sprite.position.set(pos.x, pos.y);
            textureCl.frame = this.visitedRect;
            this.engine.scene.stage.getPixiObj().addChild(sprite);
            this.visitedBlocks.add(sprite);
        }

        if (found) {
            // create arrows for the path
            for (let i = 0; i < context.pathFound.length - 1; i++) {
                let from = context.pathFound[i];
                let to = context.pathFound[i + 1];

                let textureCl = texture.clone();
                let sprite = new PIXICmp.Sprite("", textureCl);
                let pos = this.mapToWorld(from.x, from.y);
                sprite.position.set(pos.x + 16, pos.y + 16);
                sprite.anchor.set(0.5);
                textureCl.frame = this.arrowRect;
                this.engine.scene.stage.getPixiObj().addChild(sprite);
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


	/**
	* Sets sprite index according to the type of the block of the map
	*/
    getSpriteFrame(mapPos: Vec2): PIXI.Rectangle {
        let elevation = this.grid.getElevation(mapPos);
        let hasObstr = this.grid.hasObstruction(mapPos);

        if (hasObstr) return this.obstructionRect;
        if (elevation == 1) return this.pathRect;
        return this.slowPathRect;
    }

	/**
	* Transforms map coordinates into world coordinates
	*/
    mapToWorld(x: number, y: number) {
        return new Vec2(x * this.mapCellSize, y * this.mapCellSize);
    }

	/**
	* Transforms world coordinates into map coordinates
	*/
    worldToMap(x: number, y: number) {
        return new Vec2(Math.floor(x / this.mapCellSize), Math.floor(y / this.mapCellSize));
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
        return new Vec2(index % this.mapWidth, Math.floor(index / this.mapWidth));
    }

    getDirection(start: Vec2, end: Vec2): number {
        if (start.x + 1 == end.x && start.y == end.y) return DIRECTION_EAST;
        if (start.x + 1 == end.x && start.y + 1 == end.y) return DIRECTION_SOUTH_EAST;
        if (start.x == end.x && start.y + 1 == end.y) return DIRECTION_SOUTH;
        if (start.x - 1 == end.x && start.y + 1 == end.y) return DIRECTION_SOUTH_WEST;
        if (start.x - 1 == end.x && start.y == end.y) return DIRECTION_WEST;
        if (start.x - 1 == end.x && start.y - 1 == end.y) return DIRECTION_NORTH_WEST;
        if (start.x == end.x && start.y - 1 == end.y) return DIRECTION_NORTH;
        if (start.x + 1 == end.x && start.y - 1 == end.y) return DIRECTION_NORTH_EAST;

    }
}

new Pathfinding();

