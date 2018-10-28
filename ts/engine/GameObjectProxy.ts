import Component from './Component';
import Scene from './Scene'
import Msg from './Msg';
import { PIXICmp } from './PIXIObject';

import {
	MSG_OBJECT_ADDED, MSG_OBJECT_REMOVED, MSG_ANY,
} from './Constants';


/**
 * Game entity that aggregates generic attributes and components
 */
export default class GameObjectProxy {
	private static idCounter = 0;

	// auto-incremented identifier
	id = 0;
	// string tag
	tag: string = null;
	// game object this proxy is attached to
	gameObject: PIXI.Container = null;
	// set of all components, mapped by their id
	components = new Map<number, Component>();
	scene: Scene = null;
	// generic attributse
	attributes: Map<string, any> = new Map<string, any>();


	constructor(tag: string, gameObject: PIXICmp.ComponentObject) {
		this.id = GameObjectProxy.idCounter++;
		this.tag = tag;
		this.gameObject = <PIXI.Container><any>gameObject;
	}

	/**
	 * Adds a new component
	 */
	addComponent(component: Component) {
		component.owner = <PIXICmp.ComponentObject><any>this.gameObject;
		component.scene = this.scene;
		this.components.set(component.id, component);
		component.onInit();
		// there is no need to inform the scene. The scene keeps only
		// collections of components that have subscribed for a message
	}

	/**
	 * Removes an existing component
	 */
	removeComponent(component: Component) {
		component.onRemove();
		this.components.delete(component.id);
		this.scene._removeComponentSubscribing(component);
	}

	/**
	 * Removes a component by class if it exists
	 * Returns true if the component has been removed
	 */
	removeComponentByClass(name: string): boolean {
		for (let [key, cmp] of this.components) {
			// can be optimized by adding a new map
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
			if (cmp.constructor.name == name) return cmp;
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
	getAttribute(key: string): any {
		return this.attributes.get(key);
	}

	/**
	 * Removes an existing attribute
	 */
	removeAttribute(key: string): boolean {
		return this.attributes.delete(key);
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

	update(delta, absolute) {
		// update all components
		for (let [key, cmp] of this.components) {
			cmp.onUpdate(delta, absolute);
		}

		// update all children
		for (let child of this.gameObject.children) {
			let cmpChild = <PIXICmp.ComponentObject><any>child;
			cmpChild.proxy.update(delta, absolute);
		}
	}
}