import { GenericComponent } from './../components/GenericComponent';
import Component from './Component';
import Scene from './Scene'
import Msg from './Msg';
import { PIXICmp } from './PIXIObject';
import Flags from './Flags';
import {
	MSG_OBJECT_ADDED, MSG_OBJECT_REMOVED, MSG_ANY, MSG_STATE_CHANGED,
	MSG_COMPONENT_ADDED, MSG_COMPONENT_REMOVED
} from './Constants';


/**
 * Game entity that aggregates generic attributes and components
 * Is used as a proxy by objects directly inherited from PIXI objects 
 */
export default class GameObjectProxy {
	private static idCounter = 0;

	// auto-incremented identifier
	id = 0;
	// string tag
	tag: string = null;
	// bit-array of flags
	flags = new Flags();
	// state of this object
	state = 0;
	// game object this proxy is attached to
	pixiObj: PIXI.Container = null;
	// set of all components, mapped by their id
	components = new Map<number, Component>();
	// generic attributse
	attributes: Map<string, any> = new Map<string, any>();
	// link to scene
	scene: Scene = null;
	// list of components that will be added at the end of update loop
	componentsToAdd = new Array<Component>();

	constructor(tag: string, pixiObj: PIXICmp.ComponentObject) {
		this.id = GameObjectProxy.idCounter++;
		this.tag = tag;
		this.pixiObj = <PIXI.Container><any>pixiObj;
	}


	/**
	 * Adds a new component
	 */
	addComponent(component: Component) {
		this.componentsToAdd.push(component);
	}

	/**
	 * Removes an existing component
	 */
	removeComponent(component: Component) {
		component.onRemove();
		this.components.delete(component.id);
		this.scene._removeComponentSubscription(component);
		this.scene.sendMessage(new Msg(MSG_COMPONENT_REMOVED, component, <PIXICmp.ComponentObject><any>this.pixiObj));
	}

	/**
	 * Removes a component by class if it exists
	 * Returns true if the component was removed
	 */
	removeComponentByClass(name: string): boolean {
		for (let [key, cmp] of this.components) {
			// can be optimized by adding a new type-cmp map
			if (cmp.constructor.name == name) {
				this.removeComponent(cmp);
				return true;
			}
		}
		return false;
	}

	/**
	 * Removes all components
	 */
	removeAllComponents() {
		for (let [key, cmp] of this.components) {
			this.removeComponent(cmp);
		}
	}

	/**
	 * Tries to find a component by given class name
	 */
	findComponentByClass(name: string) {
		for (let [key, cmp] of this.components) {
			if (cmp.constructor.name == name || (cmp instanceof GenericComponent && cmp.name == name)) return cmp;
		}
		return null;
	}

	/**
	 * Inserts a new attribute to the map
	 */
	addAttribute(key: string, val: any) {
		this.attributes.set(key, val);
	}

	/**
	 * Gets an attribute by its key
	 */
	getAttribute<T>(key: string): T {
		return this.attributes.get(key);
	}

	/**
	 * Removes an existing attribute
	 */
	removeAttribute(key: string): boolean {
		return this.attributes.delete(key);
	}

	/**
	 * Sets flag at given index
	 */
	setFlag(flag: number) {
		this.flags.setFlag(flag);
	}

	/**
	 * Resets flag at given index
	 */
	resetFlag(flag: number) {
		this.flags.resetFlag(flag);
	}

	/**
	 * Returns true, if a flag at given index is set
	 */
	hasFlag(flag: number): boolean {
		return this.flags.hasFlag(flag);
	}

	/**
	 * Inverts a flag at given index
	 */
	invertFlag(flag: number) {
		this.flags.invertFlag(flag);
	}

	/**
	 * Gets state of this object
	 */
	getState(): number {
		return this.state;
	}

	/**
	 * Sets state of this object
	 */
	setState(state: number) {
		let previous = this.state;
		this.state = state;
		this.scene.sendMessage(new Msg(MSG_STATE_CHANGED, null, <PIXICmp.ComponentObject><any>this.pixiObj, [previous, state]));
	}

	/**
	 * Processes a new child
	 */
	onChildAdded(object: GameObjectProxy) {
		this.scene._addGameObject(object);
	}

	/**
	 * Processes a removed child
	 */
	onChildRemoved(object: GameObjectProxy) {
		object.removeAllComponents();
		this.scene._removeGameObject(object);
	}

	update(delta: number, absolute: number) {
		// update all components
		for (let [key, cmp] of this.components) {
			cmp.onUpdate(delta, absolute);
		}

		// update all children
		for (let child of this.pixiObj.children) {
			let cmpChild = <PIXICmp.ComponentObject><any>child;
			cmpChild.proxy.update(delta, absolute);
		}

		if (this.componentsToAdd.length != 0) {
			// add components that are to be updated
			for (let component of this.componentsToAdd) {
				component.owner = <PIXICmp.ComponentObject><any>this.pixiObj;
				component.scene = this.scene;
				this.components.set(component.id, component);
				component.onInit();
				this.scene.sendMessage(new Msg(MSG_COMPONENT_ADDED, component, <PIXICmp.ComponentObject><any>this.pixiObj));
			}

			this.componentsToAdd = new Array<Component>();
		}
	}
}