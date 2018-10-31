import Component from "../../ts/engine/Component";
import { MSG_PROJECTILE_SHOT, MSG_GAME_OVER, MSG_UNIT_KILLED, SOUND_FIRE, SOUND_GAMEOVER, SOUND_KILL } from './constants';
import Msg from '../../ts/engine/Msg';


export class SoundComponent extends Component {
    onInit() {
        this.subscribe(MSG_PROJECTILE_SHOT);
        this.subscribe(MSG_GAME_OVER);
        this.subscribe(MSG_UNIT_KILLED);
    }

    onMessage(msg: Msg) {
        if (msg.action == MSG_PROJECTILE_SHOT) {
            let sound = <any>PIXI.loader.resources[SOUND_FIRE];
            sound.sound.play();
        }

        if (msg.action == MSG_GAME_OVER) {
            let sound = <any>PIXI.loader.resources[SOUND_GAMEOVER];
            sound.sound.play();
        }

        if (msg.action == MSG_UNIT_KILLED) {
            let sound = <any>PIXI.loader.resources[SOUND_KILL];
            sound.sound.play();
        }
    }
}