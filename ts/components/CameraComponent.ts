import Component from '../engine/Component';
import { PIXICmp } from '../engine/PIXIObject';

export class CameraComponent extends Component {

    lookAtObj: PIXICmp.ComponentObject;
    offsetX : number = 0;
    offsetY : number = 0;
    width?: number = null;
    height?: number = null;

    lookAt(object: PIXICmp.ComponentObject) {
        this.lookAtObj = object;
    }

    offset(x: number, y: number) {
        this.offsetX = x;
        this.offsetY = y;
    }

    size(width: number, height? :number){
        this.width = width;
        this.height = height;
    }

    onUpdate(delta: number, absolute: number){
        let scaleX = this.width == null ? 1 : this.scene.app.screen.width / this.width;
        let scaleY = this.height == null ? scaleX : this.scene.app.screen.height / this.height;
        

        let posX = this.offsetX * scaleX;
        let posY = this.offsetY * scaleY;

        if(this.lookAtObj != null){
            // shift scene so that the object will be in the center
            posX += this.scene.app.screen.width/2 - this.lookAtObj.getPixiObj().position.x*scaleX;
            posY += this.scene.app.screen.height/2 - this.lookAtObj.getPixiObj().position.y*scaleY;
        }

        this.scene.stage.getPixiObj().scale.set(scaleX, scaleY);
        this.scene.stage.getPixiObj().position.set(posX, posY);
    }
}