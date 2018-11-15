import { ATTR_MODEL, ATTR_FACTORY } from './Constants';
import { ParatrooperModel } from './ParatrooperModel';
import Component from '../../ts/engine/Component';
import ParatrooperFactory from './ParatroperFactory';

/**
 * Base component for all paratrooper components, keeps references
 * to model and factory
 */
export class ParatrooperBaseCmp extends Component {
    model: ParatrooperModel;
    factory: ParatrooperFactory;

    onInit() {
        this.model = this.scene.getGlobalAttribute<ParatrooperModel>(ATTR_MODEL);
        this.factory = this.scene.getGlobalAttribute<ParatrooperFactory>(ATTR_FACTORY);
    }
}