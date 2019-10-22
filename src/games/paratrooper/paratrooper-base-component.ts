import * as ECSA from '../../../libs/pixi-component';
import { Attributes, States, Messages } from './constants';
import { ParatrooperModel } from './paratrooper-model';
import ParatrooperFactory from './paratrooper-factory';

/**
 * Base component for all paratrooper components, keeps references
 * to model and factory
 */
export class ParatrooperBaseCmp extends ECSA.Component {
  model: ParatrooperModel;
  factory: ParatrooperFactory;

  onInit() {
    this.model = this.scene.getGlobalAttribute<ParatrooperModel>(Attributes.MODEL);
    this.factory = this.scene.getGlobalAttribute<ParatrooperFactory>(Attributes.FACTORY);
  }

  protected killUnit(unit: ECSA.GameObject) {
    unit.stateId = States.DEAD;
    this.sendMessage(Messages.UNIT_KILLED, unit);
  }
}