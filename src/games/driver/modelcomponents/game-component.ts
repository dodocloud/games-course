import * as ECSA from '../../../../libs/pixi-component';
import BaseComponent from '../base-component';
import { Messages, MAXIMUM_FREQUENCY, Attributes, MAXIMUM_SPEED } from '../constants';
import { DriverModel } from '../driver-model';

// component that orchestrates global game events
export default class GameComponent extends BaseComponent {

  protected car: ECSA.GameObject;

  onInit() {
    super.onInit();
    // display animation at the start
    this.factory.displayText(this.scene, 'Get ready', 5000);
    this.car = this.scene.findObjectByName('car');

    this.subscribe(Messages.CAR_COLLIDED); // subscribe for messages
  }

  onMessage(msg: ECSA.Message) {
    if (msg.action === Messages.CAR_COLLIDED) {
      // a collision occurred -> decrement number of lives and handle game over if there are no lives left

      this.gameModel.lives--;
      if (this.gameModel.lives === 0) {
        this.factory.displayText(this.scene, 'Game Over', 5000);

        // change sprite
        let destroyedCar = this.spriteMgr.getCarDestroyed();
        (this.car.pixiObj as PIXI.Sprite).texture.frame = new PIXI.Rectangle(destroyedCar.x, destroyedCar.y, destroyedCar.w, destroyedCar.h);

        // wait 4 seconds and refresh the scene
        this.scene.invokeWithDelay(4000, () => {
          this.factory.initializeLevel(this.scene, new DriverModel());
        });
      } else if(!this.gameModel.immuneMode) {
        // switch to immune mode, wait 4 seconds and disable it
        this.gameModel.immuneMode = true;
        this.sendMessage(Messages.IMMUNE_MODE_STARTED);

        this.scene.invokeWithDelay(4000, () => {
          this.gameModel.immuneMode = false;
          this.sendMessage(Messages.IMMUNE_MODE_ENDED);
        });
      }
    }
  }

  onUpdate(delta: number, absolute: number) {
    // increase the traffic slowly
    this.gameModel.trafficFrequency = Math.min(MAXIMUM_FREQUENCY, this.gameModel.trafficFrequency + delta * 0.0001);
    // increase the score
    this.gameModel.score += this.car.getAttribute<number>(Attributes.SPEED) * delta * 0.001;
    // increase maximum speed (it has impact on both player's car and obstacles)
    this.gameModel.currentMaxSpeed = Math.min(MAXIMUM_SPEED, this.gameModel.currentMaxSpeed + delta * 0.0001);
    // by default, speed of the camera will have the same value as the speed of the car
    // however, we can animate the camera independently. That's why there are two attributes
    this.gameModel.cameraSpeed = this.car.getAttribute<number>(Attributes.SPEED);
    this.gameModel.cameraPosition += (this.gameModel.cameraSpeed * delta * 0.01);
  }
}