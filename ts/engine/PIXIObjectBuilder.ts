import Scene from './Scene';
import { PIXICmp } from '../../ts/engine/PIXIObject';

export default class PIXIObjectBuilder {

    scene: Scene;
    locPosX?: number;
    locPosY?: number;
    anchorX?: number;
    anchorY?: number;
    relPosX?: number;
    relPosY?: number;
    absPosX?: number;
    absPosY?: number;

    zIndexVal?: number;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    anchor(x: number, y: number): PIXIObjectBuilder {
        this.anchorX = x;
        this.anchorY = y;
        return this;
    }

    relativePos(x: number, y: number): PIXIObjectBuilder {
        this.relPosX = x;
        this.relPosY = y;
        return this;
    }

    localPos(x: number, y: number): PIXIObjectBuilder {
        this.locPosX = x;
        this.locPosY = y;
        return this;
    }

    absPos(x: number, y: number) : PIXIObjectBuilder {
        this.absPosX = x;
        this.absPosY = y;
        return this;
    }

    zIndex(index: number): PIXIObjectBuilder {
        this.zIndexVal = index;
        return this;
    }

    build(object: PIXICmp.ComponentObject): PIXICmp.ComponentObject {
        let pixiObj = object.getPixiObj();

        if (this.anchorX != null && pixiObj instanceof PIXICmp.Sprite) {
            pixiObj.anchor.x = this.anchorX;
        }

        if (this.anchorY != null && pixiObj instanceof PIXICmp.Sprite) {
            pixiObj.anchor.y = this.anchorY;
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
            pixiObj.position.x = pixiObj.toLocal(point, this.scene.root.getPixiObj()).x;
        }

        if (this.relPosY != null) {
            let point = new PIXI.Point();
            point.y = this.relPosY * this.scene.app.screen.height;
            pixiObj.position.y = pixiObj.toLocal(point, this.scene.root.getPixiObj()).y;
        }

        if (this.absPosX != null) {
            let point = new PIXI.Point();
            point.x = this.absPosX;
            pixiObj.position.x = pixiObj.toLocal(point, this.scene.root.getPixiObj()).x;
        }

        if (this.absPosY != null) {
            let point = new PIXI.Point();
            point.y = this.absPosY;
            pixiObj.position.y = pixiObj.toLocal(point, this.scene.root.getPixiObj()).y;
        }

        return object;
    }
}