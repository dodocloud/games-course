import { MSG_PROJECTILE_SHOT, MSG_GAME_OVER, MSG_UNIT_KILLED, SOUND_FIRE, SOUND_GAMEOVER, SOUND_KILL } from './constants';
import { GenericComponent } from '../../ts/components/GenericComponent';

/**
 * Sound handler
 */
export class SoundComponent extends GenericComponent {

    constructor(){
        super(SoundComponent.name);

        // using generic component is much simpler in this case
        this.doOnMessage(MSG_PROJECTILE_SHOT, (cmp, msg) => (<any>PIXI.loader.resources[SOUND_FIRE]).sound.play());
        this.doOnMessage(MSG_GAME_OVER, (cmp, msg) => (<any>PIXI.loader.resources[SOUND_GAMEOVER]).sound.play());
        this.doOnMessage(MSG_UNIT_KILLED, (cmp, msg) => (<any>PIXI.loader.resources[SOUND_KILL]).sound.play());
    }
}