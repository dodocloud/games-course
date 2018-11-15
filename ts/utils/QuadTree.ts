const INDEX_TOP_RIGHT = 0;
const INDEX_TOP_LEFT = 1;
const INDEX_BOTTOM_LEFT = 2;
const INDEX_BOTTOM_RIGHT = 3;

/**
 * A node inside a quad tree
 */
export class QuadTreeItem {
    x: number; // position
    y: number;
    width: number;
    height: number;
    vx: number; // velocity X
    vy: number; // velocity Y
}


/**
 * QuadTree implementation
 */
export class QuadTree {
    bounds: PIXI.Rectangle;
    maxObjects: number;
    maxLevels: number;
    level: number;

    // children
    topRight: QuadTree = null;
    topLeft: QuadTree = null;
    bottomLeft: QuadTree = null;
    bottomRight: QuadTree = null;

    objects = new Array<QuadTreeItem>();

    constructor(bounds: PIXI.Rectangle, maxObjects = 1, maxLevels = 3, level = 0) {
        this.bounds = bounds;
        this.maxObjects = maxObjects;
        this.maxLevels = maxLevels;
        this.level = level;
    }

    insert(item: QuadTreeItem) {
        let index: number;

        // if we have subnodes
        if (this.topRight != null) {
            index = this.getIndex(item);
            if (index != -1) {
                switch (index) {
                    case INDEX_TOP_RIGHT: this.topRight.insert(item);
                        break;
                    case INDEX_TOP_LEFT: this.topLeft.insert(item);
                        break;
                    case INDEX_BOTTOM_LEFT: this.bottomLeft.insert(item);
                        break;
                    case INDEX_BOTTOM_RIGHT: this.bottomRight.insert(item);
                        break;
                }
                return;
            }
        }

        // no subnodes
        this.objects.push(item);

        if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
            // split if we don't have subnodes anymore
            if (this.topRight == null) {
                this.split();
            }

            // add all objects to corresponding nodes
            let i = 0;
            while (i < this.objects.length) {
                let obj = this.objects[i];
                this.objects.splice(i, 1);
                index = this.getIndex(obj);

                if (index != -1) {
                    switch (index) {
                        case INDEX_TOP_RIGHT: this.topRight.insert(obj);
                            break;
                        case INDEX_TOP_LEFT: this.topLeft.insert(obj);
                            break;
                        case INDEX_BOTTOM_LEFT: this.bottomLeft.insert(obj);
                            break;
                        case INDEX_BOTTOM_RIGHT: this.bottomRight.insert(obj);
                            break;
                    }
                }
                else {
                    i++;
                }
            }
        }
    }

    clear() {
        this.objects = new Array<QuadTreeItem>();
        if (this.topRight != null) {
            this.topLeft.clear();
            this.topRight.clear();
            this.bottomLeft.clear();
            this.bottomRight.clear();
        }

        this.topLeft = this.topRight = this.bottomLeft = this.bottomRight = null;
    }

    private split() {
        let nextLevel = this.level + 1;
        let subWidth = Math.round(this.bounds.width / 2);
        let subHeight = Math.round(this.bounds.height / 2);
        let x = Math.round(this.bounds.x);
        let y = Math.round(this.bounds.y);

        let topRightBounds = new PIXI.Rectangle(x + subWidth, y, subWidth, subHeight);
        let topLeftBounds = new PIXI.Rectangle(x, y, subWidth, subHeight);
        let bottomLeftBounds = new PIXI.Rectangle(x, y + subHeight, subWidth, subHeight);
        let bottomRightBounds = new PIXI.Rectangle(x + subWidth, y + subHeight, subWidth, subHeight);

        this.topRight = new QuadTree(topRightBounds, this.maxObjects, this.maxLevels, nextLevel);
        this.topLeft = new QuadTree(topLeftBounds, this.maxObjects, this.maxLevels, nextLevel);
        this.bottomLeft = new QuadTree(bottomLeftBounds, this.maxObjects, this.maxLevels, nextLevel);
        this.bottomRight = new QuadTree(bottomRightBounds, this.maxObjects, this.maxLevels, nextLevel);
    }

    private getIndex(item: QuadTreeItem): number {
        let index = -1;
        let verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
        let horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);
        let topQuadrant = item.y < horizontalMidpoint && (item.y + item.height) < horizontalMidpoint;
        let bottomQuadrant = item.y > horizontalMidpoint;

        // find appropriate index according to the midpoints
        if (item.x < verticalMidpoint && item.x + item.width < verticalMidpoint) {
            if (topQuadrant) {
                index = INDEX_TOP_LEFT;
            } else if (bottomQuadrant) {
                index = INDEX_BOTTOM_LEFT;
            }
        } else if (item.x > verticalMidpoint) {
            if (topQuadrant) {
                index = INDEX_TOP_RIGHT;
            } else if (bottomQuadrant) {
                index = INDEX_BOTTOM_RIGHT;
            }
        }

        return index;
    }
}