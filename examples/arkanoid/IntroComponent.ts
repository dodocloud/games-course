import { ATTR_MODEL, MSG_GAME_STARTED, ATTR_FACTORY } from './Constants';
import { Factory } from './Factory';
import Component from '../../ts/engine/Component';
import { Model } from './Model';

/**
 * Component that display an intro scene and jumps to the first level
 */
export class IntroComponent extends Component {
    private model: Model;
    private factory: Factory;

    onInit() {
        this.model = this.scene.getGlobalAttribute(ATTR_MODEL);
        this.sendMessage(MSG_GAME_STARTED);
        this.factory = this.scene.getGlobalAttribute(ATTR_FACTORY);

        this.scene.invokeWithDelay(5000, () => {
            this.model.currentLevel = 1; // set the first level and reset the game
            this.factory.resetGame(this.scene, this.model);
        });
    }
}