import Vec2 from './Vec2';

export const MAP_TYPE_TILE = 1;
export const MAP_TYPE_OCTILE = 2;

/**
 * Grid-based map for searching algorithms
 */
export class GridMap {
    // grid size 
    width = 0;
    height = 0;
    // places that can't be crossed 
    obstructions = new Set<number>();
    // elevations of map blocks 
    elevations = new Map<number, number>();
    mapType = MAP_TYPE_TILE;
    maxElevation = 1;
    defaultElevation = 1;

    /**
     * We can't use Vec2 structure for hashmaps - this mapper only maps Vec2 into indices based on 
     * the size of the map
     */
    indexMapper = (pos: Vec2) => { return pos.y * this.width + pos.x; };

    constructor(mapType: number, maxElevation: number, width: number, height: number) {
        this.mapType = mapType;
        this.maxElevation = maxElevation;
        this.width = width;
        this.height = height;
    }

    /**
     * Returns true, if there is an obstruction in given location
     */
    hasObstruction(pos: Vec2): boolean {
        return this.obstructions.has(this.indexMapper(pos));
    }

    /**
     * Gets elevation by given location
     */
    getElevation(pos: Vec2): number {
        let index = this.indexMapper(pos);
        if (!this.elevations.has(index)) {
            return this.defaultElevation;
        }
        return this.elevations.get(this.indexMapper(pos));
    }

    /**
     * Sets elevation
     * @param pos location of the elevation (target block)
     * @param cost cost of "approaching that block"
     */
    setElevation(pos: Vec2, cost: number) {
        this.elevations.set(this.indexMapper(pos), cost);
    }

    addObstruction(pos: Vec2) {
        this.obstructions.add(this.indexMapper(pos));
    }

    removeObstruction(pos: Vec2) {
        this.obstructions.delete(this.indexMapper(pos));
    }

    getCost(from: Vec2, to: Vec2): number {
        // gets cost from point A to point B
        // let's assume the cost is the same for all blocks that surround given block (described by 'from')
        return this.elevations.has(this.indexMapper(from)) ? this.elevations.get(this.indexMapper(from)) : this.defaultElevation;
    }

    /**
     * Gets all surrounding blocks
     */
    getNeighbors(pos: Vec2): Array<Vec2> {
        let output = new Array<Vec2>();

        if (this.mapType == MAP_TYPE_TILE) {
            let n1 = new Vec2(pos.x - 1, pos.y);
            let n2 = new Vec2(pos.x + 1, pos.y);
            let n3 = new Vec2(pos.x, pos.y - 1);
            let n4 = new Vec2(pos.x, pos.y + 1);

            if (this.isInside(n1) && !this.obstructions.has(this.indexMapper(n1))) output.push(n1);
            if (this.isInside(n2) && !this.obstructions.has(this.indexMapper(n2))) output.push(n2);
            if (this.isInside(n3) && !this.obstructions.has(this.indexMapper(n3))) output.push(n3);
            if (this.isInside(n4) && !this.obstructions.has(this.indexMapper(n4))) output.push(n4);
        } else if (this.mapType == MAP_TYPE_OCTILE) {
            let west = new Vec2(pos.x - 1, pos.y);
            let east = new Vec2(pos.x + 1, pos.y);
            let north = new Vec2(pos.x, pos.y - 1);
            let south = new Vec2(pos.x, pos.y + 1);
            let northWest = new Vec2(pos.x - 1, pos.y - 1);
            let southEast = new Vec2(pos.x + 1, pos.y + 1);
            let northEast = new Vec2(pos.x + 1, pos.y - 1);
            let southWest = new Vec2(pos.x - 1, pos.y + 1);

            if (this.isInside(west) && !this.obstructions.has(this.indexMapper(west))) output.push(west);
            if (this.isInside(east) && !this.obstructions.has(this.indexMapper(east))) output.push(east);
            if (this.isInside(north) && !this.obstructions.has(this.indexMapper(north))) output.push(north);
            if (this.isInside(south) && !this.obstructions.has(this.indexMapper(south))) output.push(south);
            if (this.isInside(northWest) && !this.obstructions.has(this.indexMapper(northWest))) output.push(northWest);
            if (this.isInside(southEast) && !this.obstructions.has(this.indexMapper(southEast))) output.push(southEast);
            if (this.isInside(northEast) && !this.obstructions.has(this.indexMapper(northEast))) output.push(northEast);
            if (this.isInside(southWest) && !this.obstructions.has(this.indexMapper(southWest))) output.push(southWest);
        }

        return output;
    }

    private isInside(pos: Vec2): boolean {
        return 0 <= pos.x && pos.x < this.width && 0 <= pos.y && pos.y < this.height;
    }
}