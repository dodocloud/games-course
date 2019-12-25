import BaseComponent from '../base-component';
import { Messages } from '../constants';

// simple collision checker that only notifies other objects that the player's car
// is in collision with some other object
export default class CarCollisionChecker extends BaseComponent {
  onUpdate(delta: number, absolute: number) {
    if (!this.gameModel.immuneMode) {
      // check for collisions
      let collided = this.obstacleMap.findCollidedObstacle(this.owner);
      if (collided != null) {
        // just send the message
        this.sendMessage(Messages.CAR_COLLIDED);
      }
    }
  }
}