import { MSG_GAME_STARTED, MSG_ROUND_STARTED, MSG_OBJECT_HIT, MSG_GAME_OVER, 
    MSG_LEVEL_COMPLETED, MSG_LEVEL_STARTED, MSG_GAME_COMPLETED, SOUND_ROUND, 
    SOUND_HIT, SOUND_GAMEOVER, SOUND_INTRO } from './Constants';
import Component from '../../ts/engine/Component';
import Msg from '../../ts/engine/Msg';
import { GenericComponent } from '../../ts/components/GenericComponent';

/**
 * Component that plays all sounds based on emitted events
 */
export class SoundComponent extends GenericComponent {

    constructor(){
        super(SoundComponent.name);

        // using generic component is much simpler
        this.doOnMessage(MSG_ROUND_STARTED, (cmp, msg) => (<any>PIXI.loader.resources[SOUND_ROUND]).sound.play());
        this.doOnMessage(MSG_OBJECT_HIT, (cmp, msg) => (<any>PIXI.loader.resources[SOUND_HIT]).sound.play());
        this.doOnMessage(MSG_GAME_OVER, (cmp, msg) => (<any>PIXI.loader.resources[SOUND_GAMEOVER]).sound.play());
        this.doOnMessage(MSG_LEVEL_COMPLETED, (cmp, msg) => (<any>PIXI.loader.resources[SOUND_GAMEOVER]).sound.play());
        this.doOnMessage(MSG_LEVEL_STARTED, (cmp, msg) => (<any>PIXI.loader.resources[SOUND_ROUND]).sound.play());
        this.doOnMessage(MSG_GAME_STARTED, (cmp, msg) => (<any>PIXI.loader.resources[SOUND_INTRO]).sound.play());
        this.doOnMessage(MSG_GAME_COMPLETED, (cmp, msg) => (<any>PIXI.loader.resources[SOUND_GAMEOVER]).sound.play());
    }
}