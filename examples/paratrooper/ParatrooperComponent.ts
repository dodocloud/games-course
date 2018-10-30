import { STATE_DEAD } from './../cardriver/constants';
import { TAG_GROUND, ATTR_MODEL, ATTR_DYNAMICS, STATE_FALLING_WITHOUT_PARACHUTE, TAG_TOWER, STATE_FALLING, STATE_FALLING_PARACHUTE, STATE_ON_GROUND, STATE_CAPTURING, MSG_UNIT_LANDED, MSG_UNIT_KILLED, TEXTURE_PARATROOPER_PARACHUTE, TEXTURE_PARATROOPER } from './constants';
import { ParatrooperModel } from './ParatrooperModel';
import Component from "../../ts/engine/Component";
import { PIXICmp } from "../../ts/engine/PIXIObject";
import Dynamics from './Dynamics';
import Vec2 from './Vec2';

export class ParatrooperComponent extends Component {
    ground: PIXICmp.ComponentObject;
    lastState: number;
    model: ParatrooperModel;

    onInit() {
        this.ground = this.scene.findFirstObjectByTag(TAG_GROUND);
        this.lastState = this.owner.getState();
        this.model = this.scene.root.getAttribute<ParatrooperModel>(ATTR_MODEL);
    }

    update(delta: number, absolute: number) {
        let dynamics = this.owner.getAttribute<Dynamics>(ATTR_DYNAMICS);
        let state = this.owner.getState();

        dynamics.update(delta, 1);
        let deltaMovement = dynamics.calcDelta(delta, 1);

        this.owner.getPixiObj().position.x += deltaMovement.x;
        this.owner.getPixiObj().position.y += deltaMovement.y;

        if (this.lastState != state && state == STATE_FALLING_WITHOUT_PARACHUTE) {
            // change acceleration back to gravity
            dynamics.acceleration = new Vec2(0, this.model.gravity);
        }

        state = this.checkStateChangeBehavior(state, delta);
        this.checkStateChangeTexture(state);
        this.owner.setState(state);
        this.lastState = state;
    }

    doCaptureAnimation(delta: number) {
        // very simple animation - go to the tower, then up and finally to the center
        let tower = this.scene.findFirstObjectByTag(TAG_TOWER);
        let towerBB = tower.getPixiObj().getBounds();
        let thisBB = this.owner.getPixiObj().getBounds();
        let pixi = this.owner.getPixiObj();

        if (thisBB.right < towerBB.left) {
            pixi.position.x += delta * 0.1;
        } else if (thisBB.left > towerBB.right) {
            pixi.position.x -= delta * 0.1;
        } else if (thisBB.bottom > towerBB.top) {
            pixi.position.y -= delta * 0.1;
        } else if (thisBB.right < (towerBB.left + towerBB.width / 2)) {
            pixi.position.x += delta * 0.1;
        } else if (thisBB.left > (towerBB.left + towerBB.width / 2)) {
            pixi.position.x -= delta * 0.1;
        }
    }

    checkStateChangeBehavior(state: number, delta: number): number {
        let groundBB = this.ground.getPixiObj().getBounds();
        let paraBB = this.owner.getPixiObj().getBounds();
        let position = this.owner.getPixiObj().position;
        let dynamics = this.owner.getAttribute<Dynamics>(ATTR_DYNAMICS);

        switch (state) {
            case STATE_FALLING:
                if (position.y > this.model.parachuteOpenAltitude) {
                    state = STATE_FALLING_PARACHUTE;
                    // parachute open -> deccelerate
                    dynamics.acceleration = new Vec2(0, -this.model.parachuteDecceleration);
                }
                break;
            case STATE_FALLING_PARACHUTE:
                if (dynamics.velocity.y < this.model.parachuteOpenVelocityThreshold) {
                    // decellerated enough -> reset acceleration and fall with constant velocity
                    dynamics.acceleration = new Vec2(0, 0);
                    dynamics.velocity = new Vec2(0, this.model.parachuteOpenVelocityThreshold);
                }
                if (paraBB.bottom >= groundBB.top) {
                    // on the ground -> reset both velocity and acceleration
                    state = STATE_ON_GROUND;
                    dynamics.velocity = new Vec2(0, 0);
                    dynamics.acceleration = new Vec2(0, 0);
                    this.sendMessage(MSG_UNIT_LANDED, this.owner);
                }
                break;
            case STATE_FALLING_WITHOUT_PARACHUTE:
                if (paraBB.bottom >= groundBB.top) {
                    // kill the paratrooper
                    this.owner.setState(STATE_DEAD);
                    dynamics.velocity = new Vec2(0, 0);
                    dynamics.acceleration = new Vec2(0, 0);
                    this.sendMessage(MSG_UNIT_KILLED, this.owner);
                    state = STATE_DEAD;
                }
                break;
            case STATE_ON_GROUND:
                // nothing to do 
                break;
            case STATE_CAPTURING:
                this.doCaptureAnimation(delta);
                break;
        }

        return state;
    }

    checkStateChangeTexture(state: number) {
        if (this.lastState != state) {
            // state changed -> decide what to do next
            let paraBB = this.owner.getPixiObj().getBounds();
            let sprite = <PIXICmp.Sprite><any>this.owner.getPixiObj();

            // change mesh according to the current state
            // transformation needs to be recalculated, because the image of paratrooper with opened parachute has different size than the image of a falling paratrooper
            if (this.lastState == STATE_FALLING && state == STATE_FALLING_PARACHUTE) {
                sprite.texture = PIXI.Texture.fromImage(TEXTURE_PARATROOPER_PARACHUTE);
            } else if (this.lastState == STATE_FALLING_PARACHUTE && state == STATE_FALLING_WITHOUT_PARACHUTE) {
                sprite.texture = PIXI.Texture.fromImage(TEXTURE_PARATROOPER);
            } else if (this.lastState == STATE_FALLING_PARACHUTE && state == STATE_ON_GROUND) {
                sprite.texture = PIXI.Texture.fromImage(TEXTURE_PARATROOPER);
            }
        }
    }
}