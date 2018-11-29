import Component from '../engine/Component';
import { PIXICmp } from '../engine/PIXIObject';
import Msg from '../engine/Msg';
import { MSG_COMPONENT_REMOVED } from '../engine/Constants';

/**
 * Component that consists of a list of inner components
 */
export class ComposingComponent extends Component {

    constructor(...components: Component[]) {
        super();
        for (let cmp of components) {
            this.addComponent(cmp);
        }
    }

    // components mapped by their id
    private components = new Map<number, Component>();
    private componentsToAdd = new Array<Component>();

    addComponent(cmp: Component) {
        this.componentsToAdd.push(cmp);
    }

    onInit() {
        this.subscribe(MSG_COMPONENT_REMOVED);
        for (let [key, cmp] of this.components) {
            cmp.onInit();
        }
    }

    onMessage(msg: Msg) {
        // remove component from the collection
        if (msg.action == MSG_COMPONENT_REMOVED) {
            if (this.components.has(msg.component.id)) {
                this.components.delete(msg.component.id);
            }
        }

        // no need to call onMessage upon inner components as they can subscribe directly
    }

    onRemove() {
        for (let [key, cmp] of this.components) {
            cmp.onRemove();
        }
    }

    onUpdate(delta: number, absolute: number) {
        // add new components
        if (this.componentsToAdd.length != 0) {
            for (let cmp of this.componentsToAdd) {
                this.components.set(cmp.id, cmp);
                cmp.owner = this.owner;
                cmp.scene = this.scene;
                cmp.onInit();
            }
            this.componentsToAdd = new Array<Component>();
        }

        // update components
        for (let [key, cmp] of this.components) {
            cmp.onUpdate(delta, absolute);
        }
    }

    onFinish() {
        for (let [key, cmp] of this.components) {
            cmp.finish();
        }
    }
}