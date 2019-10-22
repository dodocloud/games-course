import { Vector, GameObject } from '../../../libs/pixi-component';
import { Assets, Messages, Names, Attributes, States } from './constants';
import { ParatrooperModel } from './paratrooper-model';
import DynamicsComponent from '../../utils/dynamics-component';

/**
 * Component for behaviors of detached paratrooper
 */
export class ParatrooperComponent extends DynamicsComponent {
  ground: GameObject;
  lastState: number;
  model: ParatrooperModel;

  constructor() {
    super(Attributes.DYNAMICS);
  }

  onInit() {
    super.onInit();
    this.ground = this.scene.findObjectByName(Names.GROUND);
    this.model = this.scene.stage.getAttribute<ParatrooperModel>(Attributes.MODEL);
  }

  onUpdate(delta: number, absolute: number) {
    super.onUpdate(delta, absolute);

    let state = this.owner.stateId;

    if (this.lastState !== state && state === States.FALLING_WITHOUT_PARACHUTE) {
      // parachute has been hit -> change acceleration back to gravity
      this.dynamics.aceleration = new Vector(0, this.model.gravity);
    }

    state = this.checkStateChangeBehavior(state, delta);
    this.checkStateChangeTexture(state);
    this.owner.stateId = state;
    this.lastState = state;
  }

  protected doCaptureAnimation(delta: number) {
    // very simple animation - go to the tower, then up and finally to the center
    let tower = this.scene.findObjectByName(Names.TOWER);
    let towerBB = tower.pixiObj.getBounds();
    let thisBB = this.owner.pixiObj.getBounds();
    let pixi = this.owner.pixiObj;

    if (thisBB.right < towerBB.left) {
      pixi.position.x += delta * 0.01;
    } else if (thisBB.left > towerBB.right) {
      pixi.position.x -= delta * 0.01;
    } else if (thisBB.bottom > towerBB.top) {
      pixi.position.y -= delta * 0.01;
    } else if (thisBB.right < (towerBB.left + towerBB.width / 2)) {
      pixi.position.x += delta * 0.01;
    } else if (thisBB.left > (towerBB.left + towerBB.width / 2)) {
      pixi.position.x -= delta * 0.01;
    }
  }

  protected checkStateChangeBehavior(state: number, delta: number): number {
    let groundBB = this.ground.pixiObj.getBounds();
    let paraBB = this.owner.pixiObj.getBounds();
    let position = this.owner.pixiObj.position;

    switch (state) {
      case States.FALLING:
        if (position.y > this.model.parachuteOpenAltitude) {
          state = States.FALLING_PARACHUTE;
          // parachute open -> deccelerate
          this.dynamics.aceleration = new Vector(0, -this.model.parachuteDecceleration);
        }
        break;
      case States.FALLING_PARACHUTE:
        if (this.dynamics.velocity.y < this.model.parachuteOpenVelocityThreshold) {
          // decellerated enough -> reset acceleration and fall with a constant velocity
          this.dynamics.aceleration = new Vector(0, 0);
          this.dynamics.velocity = new Vector(0, this.model.parachuteOpenVelocityThreshold);
        }
        if (paraBB.bottom >= groundBB.top) {
          // already on the ground -> reset both velocity and acceleration
          state = States.ON_THE_GROUND;
          this.dynamics.velocity = new Vector(0, 0);
          this.dynamics.aceleration = new Vector(0, 0);
          this.sendMessage(Messages.UNIT_LANDED, this.owner);
        }
        break;
      case States.FALLING_WITHOUT_PARACHUTE:
        if (paraBB.bottom >= groundBB.top) {
          // hit the ground -> kill the paratrooper
          this.owner.stateId = States.DEAD;
          this.dynamics.velocity = new Vector(0, 0);
          this.dynamics.aceleration = new Vector(0, 0);
          this.sendMessage(Messages.UNIT_KILLED, this.owner);
          state = States.DEAD;
        }
        break;
      case States.ON_THE_GROUND:
        // nothing to do
        break;
      case States.CAPTURING_BASE:
        this.doCaptureAnimation(delta);
        break;
    }

    return state;
  }

  protected checkStateChangeTexture(state: number) {
    if (this.lastState !== state) {
      // state changed -> decide what to do next
      let sprite = this.owner.asSprite();

      // change mesh according to the current state
      if (this.lastState === States.FALLING && state === States.FALLING_PARACHUTE) {
        sprite.texture = PIXI.Texture.from(Assets.TEX_PARATROOPER_PARACHUTE);
      } else if (this.lastState === States.FALLING_PARACHUTE && state === States.FALLING_WITHOUT_PARACHUTE) {
        sprite.texture = PIXI.Texture.from(Assets.TEX_PARATROOPER);
      } else if (this.lastState === States.FALLING_PARACHUTE && state === States.ON_THE_GROUND) {
        sprite.texture = PIXI.Texture.from(Assets.TEX_PARATROOPER);
      }
    }
  }
}