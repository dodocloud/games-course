import Component from "../../ts/engine/Component";
import { ParatrooperModel } from './ParatrooperModel';
import ParatrooperFactory from './ParatroperFactory';
import { MSG_PROJECTILE_SHOT, MSG_UNIT_KILLED, MSG_UNIT_LANDED, ATTR_MODEL, ATTR_FACTORY, STATE_DEAD, MSG_COLLISION, TAG_COPTER, TAG_PARATROOPER, STATE_FALLING, STATE_FALLING_WITHOUT_PARACHUTE, TAG_GAMEOVER, STATE_ON_GROUND, STATE_CAPTURING, MSG_GAME_OVER } from './constants';
import Msg from '../../ts/engine/Msg';
import { CollisionTrigger } from './CollisionManager';

export class GameManager extends Component {
    model: ParatrooperModel;
    factory: ParatrooperFactory;

    onInit() {
        this.subscribe(MSG_COLLISION);
        this.subscribe(MSG_PROJECTILE_SHOT);
        this.subscribe(MSG_UNIT_KILLED);
        this.subscribe(MSG_UNIT_LANDED);

        this.model = this.scene.stage.getAttribute<ParatrooperModel>(ATTR_MODEL);
        this.factory = this.scene.stage.getAttribute<ParatrooperFactory>(ATTR_FACTORY);
    }

    onMessage(msg: Msg) {
        if (this.model.isGameOver) {
            return;
        }

        if (msg.action == MSG_COLLISION) {
            this.handleCollision(msg);
        } else if (msg.action == MSG_PROJECTILE_SHOT) {
            // decrease score with each shot
            this.model.score = Math.max(0, this.model.score - this.model.shootPenalty);
        } else if (msg.action == MSG_UNIT_LANDED) {
            this.model.landedUnits++;

            if (this.model.landedUnits >= this.model.maxLandedUnits) {
                // GAME MOVER
                this.gameOver();
            }
        }
    }

    handleCollision(msg: Msg) {
        let trigger = <CollisionTrigger>msg.data;

        if (trigger.unit.getTag() == TAG_COPTER) {
            // copter hit
            this.model.score += this.model.copterReward;
            trigger.unit.setState(STATE_DEAD);
            this.sendMessage(MSG_UNIT_KILLED, trigger.unit);
        } else if (trigger.unit.getTag() == TAG_PARATROOPER) {
            // we can either kill the paratrooper or blow up his paracuhte
            if (trigger.unit.getState() == STATE_FALLING) {
                // paratrooper hit while falling
                this.model.score += this.model.paratrooperShotReward;
                trigger.unit.setState(STATE_DEAD);
                this.sendMessage(MSG_UNIT_KILLED, trigger.unit);
            } else {
                // paratrooper hit while landing
                let unitBB = trigger.unit.getPixiObj().getBounds();
                let projectileBB = trigger.projectile.getPixiObj().getBounds();
                let state = trigger.unit.getState();

                if (state == STATE_FALLING && projectileBB.top <= (unitBB.bottom - unitBB.height / 2)) {
                    // remove parachute -> paratrooper is gonna be killed by gravity
                    trigger.unit.setState(STATE_FALLING_WITHOUT_PARACHUTE);
                } else {
                    // we hit the paratrooper's body
                    trigger.unit.setState(STATE_DEAD);
                    this.sendMessage(MSG_UNIT_KILLED, trigger.unit);
                }

                // reward is different -> we hit the paratrooper too late
                this.model.score += this.model.paratrooperFallingReward;
            }
        }

        trigger.projectile.remove();
    }

    gameOver() {
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
        this.scene.invokeWithDelay(5000, () => {
            this.factory.resetGame(this.scene);
        });
    }
}