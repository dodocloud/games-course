import { TAG_ROCKET, TEXTURE_ROCKET, MSG_RESTART_ANIMATION, TAG_SQUARE } from './constants';
import Scene from '../../ts/engine/Scene';
import Component from '../../ts/engine/Component';
import Msg from '../../ts/engine/Msg';
import { PIXICmp } from '../../ts/engine/PIXIObject';
import PIXIObjectBuilder from '../../ts/engine/PIXIObjectBuilder';
import { KeyInputComponent } from '../../ts/components/KeyInputComponent';


class RotationAnimation extends Component {

    onInit() {
        // TODO implement
    }

    onMessage(msg: Msg) {
        // TODO implement
    }

    onUpdate(delta: number, absolute: number) {
        this.owner.getPixiObj().rotation += 0.001 * delta;
    }
}


export class Example3 {
    init(scene: Scene) {
        scene.clearScene();
        let square = new PIXICmp.Graphics(TAG_SQUARE);
        square.beginFill(0xFF0000);
        square.drawRect(0, 0, 100, 100);
        square.endFill();

        let square2 = new PIXICmp.Graphics(TAG_SQUARE);
        square2.beginFill(0x00FF00);
        square2.drawRect(0, 0, 100, 100);
        square2.endFill();

        
        let builder = new PIXIObjectBuilder(scene);
        builder.relativePos(0.25, 0.5).anchor(0.5, 0.5).build(square);
        builder.relativePos(0.75, 0.5).anchor(0.5, 0.5).build(square2);

        square.addComponent(new RotationAnimation());
        square2.addComponent(new RotationAnimation());

        scene.stage.getPixiObj().addChild(square);
        scene.stage.getPixiObj().addChild(square2);
    }
}