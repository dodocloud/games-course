import {
    MSG_PROJECTILE_SHOT, MSG_UNIT_KILLED, MSG_UNIT_LANDED, STATE_DEAD, MSG_COLLISION, TAG_COPTER, TAG_PARATROOPER, STATE_FALLING,
    STATE_FALLING_WITHOUT_PARACHUTE, TAG_GAMEOVER, STATE_ON_GROUND, STATE_CAPTURING, MSG_GAME_OVER
} from './constants';
import Msg from '../../ts/engine/Msg';
import { CollisionInfo } from './CollisionManager';
import { ParatrooperBaseCmp } from "./ParatrooperBaseCmp";

/**
 * Manager that orchestrates the game in general
 */
export class GameManager extends ParatrooperBaseCmp {

    onInit() {
        super.onInit();
        this.subscribe(MSG_UNIT_LANDED);
    }

    onMessage(msg: Msg) {
        if (this.model.isGameOver) {
            return;
        }

        if (msg.action == MSG_PROJECTILE_SHOT) {
            // decrease score with each shot
            this.model.score = Math.max(0, this.model.score - this.model.shootPenalty);
        } else if (msg.action == MSG_UNIT_LANDED) {
            // check number of landed units
            this.model.landedUnits++;
            if (this.model.landedUnits >= this.model.maxLandedUnits) {
                // GAME MOVER
                this.gameOver();
            }
        }
    }

    protected gameOver() {
        // display title
        let gameOverObj = this.scene.findFirstObjectByTag(TAG_GAMEOVER);
        gameOverObj.getPixiObj().visible = true;
        this.model.isGameOver = true;

        // find all paratroopers and set their state to CAPTURING. This will execute
        // the capturing animation
        let paratroopers = this.scene.findAllObjectsByTag(TAG_PARATROOPER);

        for (let para of paratroopers) {
            if (para.getState() == STATE_ON_GROUND) {
                para.setState(STATE_CAPTURING);
            }
        }

        // notify everyone interested
        this.sendMessage(MSG_GAME_OVER);
        // wait 5 seconds and reset the game
        this.scene.invokeWithDelay(5000, () => {
            this.factory.resetGame(this.scene);
        });
    }
}