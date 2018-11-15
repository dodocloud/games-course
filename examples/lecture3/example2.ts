import { TAG_ROCKET, TEXTURE_ROCKET, MSG_RESTART_ANIMATION } from './constants';
import Scene from '../../ts/engine/Scene';
import Component from '../../ts/engine/Component';
import Msg from '../../ts/engine/Msg';
import { PIXICmp } from '../../ts/engine/PIXIObject';
import PIXIObjectBuilder from '../../ts/engine/PIXIObjectBuilder';


class TranslateComponent extends Component {
    
    onInit() {
        // TODO implement
    }

    onMessage(msg: Msg) {
        // TODO implement
    }

    onUpdate(delta: number, absolute: number) {
        // TODO implement
    }
}

class MessageTest extends Component {
    
    period = 0;
    lastTick = 0;

    onUpdate(delta: number, absolute: number) {
        if(absolute - this.lastTick > this.period){
            this.lastTick = absolute;
            console.log(absolute);
            this.period = Math.random()*2500 + 500;
            this.sendMessage(MSG_RESTART_ANIMATION);
        }
    }
}


export class Example2 {
    init(scene: Scene) {
        scene.clearScene();
        let rocket = new PIXICmp.Sprite(TAG_ROCKET, PIXI.Texture.fromImage(TEXTURE_ROCKET));
        scene.stage.getPixiObj().addChild(rocket);
        rocket.addComponent(new TranslateComponent());
        rocket.addComponent(new MessageTest());
        new PIXIObjectBuilder(scene).relativePos(0.5, 0.5).anchor(0.5, 0.5).build(rocket);
       
    }
}