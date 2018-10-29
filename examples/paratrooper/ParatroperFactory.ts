import { ParatrooperModel } from './ParatrooperModel';
import { PIXICmp } from '../../ts/engine/PIXIObject';

export default class ParatrooperFactory {
    resetGamePending = false;

    loadGameModel(): ParatrooperModel {
        return null;
    }

    initializeGame(rootObject: PIXICmp.ComponentObject, model: ParatrooperModel) {

    }

    createProjectile(canon: PIXICmp.ComponentObject, model: ParatrooperModel) {

    }

    createParatrooper(owner: PIXICmp.ComponentObject, model: ParatrooperModel) {

    }

    createCopter(owner: PIXICmp.ComponentObject, model: ParatrooperModel) {

    }

    resetGame() {
        this.resetGamePending = true;
    }
}