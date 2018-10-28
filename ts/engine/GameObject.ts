import Component from './Component';
import Scene from './Scene'
import Msg from './Msg';
import GameObject from './GameObject';
import {PIXICmp} from './PIXIObject';

import {
	MSG_OBJECT_ADDED, MSG_OBJECT_REMOVED, MSG_ALL,
	STATE_DRAWABLE, STATE_INACTIVE, STATE_LISTENING, STATE_UPDATABLE
} from './Constants';


/**
 * Game object entity that aggregates generic attributes and components
 * Overall behavior of the game entity is defined by its components
 */
export default class GameObjectProxy {
	static idCounter = 0;
	id = 0;
	tag: string = null;
	pixiObject: PIXI.Container = null;
	components: Array<Component> = new Array();
	scene: Scene = null;
	attributes: Map<string, any> = new Map<string, any>();


	constructor(tag: string, pixiObject: PIXI.Container) {
		this.id = GameObjectProxy.idCounter++;
		this.tag = tag;
		this.scene = null;
		this.pixiObject = pixiObject;
	}

	addComponent(component: Component) {
		component.owner = this;
		component.scene = this.scene;
		this.components.push(component);
		component.oninit();
	}

	removeComponent(component: Component) {
		component.finalize();

		for (var i = 0; i < this.components.length; i++) {
			if (this.components[i] == component) {
				// TODO needs optimizing!!!
				this.components.splice(i, 1);
				this.scene.removeComponent(component);
				break;
			}
		}
	}

	removeComponentByName(name: string) {
		for (let cmp of this.components) {
			if (cmp.constructor.name == name) {
				this.removeComponent(cmp);
				return true;
			}
		}
		return false;
	}

	removeAllComponents() {
		for (let cmp of this.components) {
			this.removeComponent(cmp);
		}
	}

	findComponent(name: string) {
		for (let cmp of this.components) {
			if (cmp.constructor.name == name) return cmp;
		}
		return null;
	}

	// adds a new attribute
	addAttribute(key: string, val: any) {
		this.attributes.set(key, val);
	}

	// gets attribute by key
	getAttribute(key: string): any {
		return this.attributes.get(key);
	}

	// removes an existing attribute
	removeAttribute(key: string) {
		this.attributes.delete(key);
	}

	// adds pending objects
	processNewObject(object: GameObject) {
		this.scene.addGameObject(object);
	}

	// removes pending objects;
	processRemovedObject(object: GameObject) {
		object.removeAllComponents();
		this.scene.removeGameObject(object);
	}

	update(delta, absolute){
		for(let cmp of this.components){
			cmp.update(delta, absolute);
		}

		for(let child of this.pixiObject.children){
			let cmpChild = <PIXICmp.ComponentObject><any>child;
			cmpChild.proxy.update(delta, absolute);
		}
	}
}