import { KEY_UP, KEY_RIGHT } from './../../ts/components/KeyInputComponent';
import { TAG_ROCKET, TEXTURE_ROCKET, MSG_RESTART_ANIMATION } from './constants';
import Scene from '../../ts/engine/Scene';
import Component from '../../ts/engine/Component';
import Msg from '../../ts/engine/Msg';
import { PIXICmp } from '../../ts/engine/PIXIObject';
import PIXIObjectBuilder from '../../ts/engine/PIXIObjectBuilder';
import { KeyInputComponent, KEY_DOWN, KEY_LEFT } from '../../ts/components/KeyInputComponent';


class RocketController extends Component {

    onUpdate(delta: number, absolute: number) {

    }

    protected turnLeft() {
        // TODO implement
    }

    protected turnRight() {
        // TODO implement
    }

    protected acelerate() {
        // TODO implement
    }

    protected deccelerate() {
        // TODO implement
    }
}

class RocketKeyboardController extends RocketController {

    onUpdate(delta: number, absolute: number) {
        let keyComponent = <KeyInputComponent>this.scene.findGlobalComponentByClass(KeyInputComponent.name);
        if (keyComponent.isKeyPressed(KEY_UP)) {
            this.acelerate();
        }
        if (keyComponent.isKeyPressed(KEY_DOWN)) {
            this.deccelerate();
        }
        if (keyComponent.isKeyPressed(KEY_LEFT)) {
            this.turnLeft();
        }
        if (keyComponent.isKeyPressed(KEY_RIGHT)) {
            this.turnRight();
        }
    }
}


export class Example4 {
    init(scene: Scene) {
        scene.clearScene();
        let rocket = new PIXICmp.Sprite(TAG_ROCKET, PIXI.Texture.fromImage(TEXTURE_ROCKET));
        rocket.addComponent(new RocketKeyboardController());
        new PIXIObjectBuilder(scene).relativePos(0.5, 0.5).anchor(0.5, 0.5).build(rocket);
        scene.stage.getPixiObj().addChild(rocket);

        // global component for keyboard input
        scene.addGlobalComponent(new KeyInputComponent());
    }
}