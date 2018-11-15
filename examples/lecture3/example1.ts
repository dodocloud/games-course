import { TAG_ROCKET, TEXTURE_ROCKET } from './constants';
import Scene from '../../ts/engine/Scene';
import Component from '../../ts/engine/Component';
import Msg from '../../ts/engine/Msg';
import { PIXICmp } from '../../ts/engine/PIXIObject';
import PIXIObjectBuilder from '../../ts/engine/PIXIObjectBuilder';


class RotationComponent extends Component {

    onInit() {

    }

    onMessage(msg: Msg) {

    }

    onUpdate(delta: number, absolute: number) {
        // TODO implement
    }
}


export class Example1 {
    init(scene: Scene) {
        scene.clearScene();

        let rocket = new PIXICmp.Sprite(TAG_ROCKET, PIXI.Texture.fromImage(TEXTURE_ROCKET));
        new PIXIObjectBuilder(scene).relativePos(0.5, 0.5).anchor(0.5, 0.5).build(rocket);
        scene.stage.getPixiObj().addChild(rocket);
        rocket.addComponent(new RotationComponent());
    }
}