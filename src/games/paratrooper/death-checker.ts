import * as ECSA from '../../../libs/pixi-component';
import { Messages } from './constants';
import { DeathAnimation } from './death-animation';

// special component that will wait for a death of a unit, executes a DeathAnimation
// and removes it from the scene
export const deathChecker = new ECSA.GenericComponent('DeathChecker') // anonymous generic component
  .doOnMessage(Messages.UNIT_KILLED, (cmp, msg) => {    // wait for message MSG_UNIT_KILLED
    let contextObj = msg.data as ECSA.GameObject; // take the killed object from message payload
    contextObj.addComponent(new ECSA.ChainComponent() // add chaining component that will execute two closures
      .addComponentAndWait(new DeathAnimation()) // firstly, add directly DeathAnimation to the object and wait until it finishes
      .execute((cmp) => contextObj.remove())); // secondly, remove the object from the scene
  });