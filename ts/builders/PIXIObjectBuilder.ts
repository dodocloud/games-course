import { ComponentObject } from '../engine/PIXIObject';
import Scene from '../engine/Scene';

/**
 * Builder for PIXI objects from given attributes
 */
export default class PIXIObjectBuilder {

    private scene: Scene;
    private locPosX?: number;
    private locPosY?: number;
    private anchorX?: number;
    private anchorY?: number;
    private relPosX?: number;
    private relPosY?: number;
    private absPosX?: number;
    private absPosY?: number;
    private scaleX?: number;
    private scaleY?: number;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    /**
     * Sets an anchor
     */
    anchor(x: number, y: number): PIXIObjectBuilder {
        this.anchorX = x;
        this.anchorY = y;
        return this;
    }

    /**
     * Sets position relative to the screen ([0,0] for topleft corner, [1,1] for bottomright corner)
     */
    relativePos(x: number, y: number): PIXIObjectBuilder {
        this.relPosX = x;
        this.relPosY = y;
        return this;
    }

    /**
     * Sets local position
     */
    localPos(x: number, y: number): PIXIObjectBuilder {
        this.locPosX = x;
        this.locPosY = y;
        return this;
    }

    /**
     * Sets global position
     */
    globalPos(x: number, y: number): PIXIObjectBuilder {
        this.absPosX = x;
        this.absPosY = y;
        return this;
    }

    scale(x: number, y: number): PIXIObjectBuilder {
        this.scaleX = x;
        this.scaleY = y;
        return this;
    }

    build(object: PIXICmp.ComponentObject): PIXICmp.ComponentObject {
        let pixiObj = object.getPixiObj();

        if (this.scaleX != null) {
            pixiObj.scale.x = this.scaleX;
        }

        if (this.scaleY != null) {
            pixiObj.scale.y = this.scaleY;
        }

        if (this.locPosX != null) {
            pixiObj.position.x = this.locPosX;
        }

        if (this.locPosY != null) {
            pixiObj.position.y = this.locPosY;
        }

        if (this.relPosX != null) {
            let point = new PIXI.Point();
            point.x = this.relPosX * this.scene.app.screen.width;
            pixiObj.position.x = pixiObj.toLocal(point, this.scene.stage.getPixiObj()).x;
            if(this.scaleX != null) pixiObj.position.x *= this.scaleX;
        }

        if (this.relPosY != null) {
            let point = new PIXI.Point();
            point.y = this.relPosY * this.scene.app.screen.height;
            pixiObj.position.y = pixiObj.toLocal(point, this.scene.stage.getPixiObj()).y;
            if(this.scaleY != null) pixiObj.position.y *= this.scaleY;
        }

        if (this.absPosX != null) {
            let point = new PIXI.Point();
            point.x = this.absPosX;
            pixiObj.position.x = pixiObj.toLocal(point, this.scene.stage.getPixiObj()).x;
        }

        if (this.absPosY != null) {
            let point = new PIXI.Point();
            point.y = this.absPosY;
            pixiObj.position.y = pixiObj.toLocal(point, this.scene.stage.getPixiObj()).y;
        }

        if (this.anchorX != null) {
            // sprites and texts have anchors
            if (pixiObj instanceof PIXICmp.Sprite || pixiObj instanceof PIXICmp.Text) {
                pixiObj.anchor.x = this.anchorX;
            } else {
                pixiObj.pivot.x = this.anchorX * pixiObj.width;
            }
        }

        if (this.anchorY != null) {
            // sprites and texts have anchors
            if (pixiObj instanceof PIXICmp.Sprite || pixiObj instanceof PIXICmp.Text) {
                pixiObj.anchor.y = this.anchorY;
            } else {
                pixiObj.pivot.y = this.anchorY * pixiObj.height;
            }
        }


        this.locPosX = null;
        this.locPosY = null;
        this.anchorX = null;
        this.anchorY = null;
        this.relPosX = null;
        this.relPosY = null;
        this.absPosX = null;
        this.absPosY = null;

        return object;
    }
}