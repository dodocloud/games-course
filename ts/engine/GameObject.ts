import Component from './Component';
import Scene from './Scene'
import Msg from './Msg';
import Flags from './Flags';
import {
	MSG_OBJECT_ADDED, MSG_OBJECT_REMOVED, MSG_ALL,
	STATE_DRAWABLE, STATE_INACTIVE, STATE_LISTENING, STATE_UPDATABLE
} from './Constants';

/**
 * Game object entity that aggregates generic attributes and components
 * Overall behavior of the game entity is defined by its components
 */
export default class GameObject {
	static idCounter = 0;
	id = 0;
	secondaryId = 0;
	tag: string = null;
	parent: GameObject = null;
	components: Array<Component> = new Array();
	mesh: PIXI.Container = null;
	scene: Scene = null;
	state: number = 0;
	flags = new Flags();

	/**
 * List of attributes, mapped by their ids
 * @type {Map<number, Any>}
 */
	attributes: Map<string, any> = new Map<string, any>();

	/**
	 * Collection of children
	 * @type {Map<number, GameObject>}
	 */
	children: Map<number, GameObject> = new Map<number, GameObject>();

	// temporary collection that keeps objects for removal -> objects should be removed
	// at the end of the update cycle since we are sure there aren't any running components
	protected objectsToRemove: Array<GameObject> = new Array();
	protected componentsToRemove: Array<Component> = new Array();
	// temporary collection that keeps objects for adding -> objects should be added
	// at the end of the update cycle since we are sure there aren't any running components
	protected objectsToAdd: Array<GameObject> = new Array();
	protected componentsToAdd: Array<Component> = new Array();

	constructor(tag, secondaryId = -10000, mesh : PIXI.Container = null) {
		/**
         * Primary identifier, set automatically
         * @type {number}
         */
		this.id = GameObject.idCounter++;
		/**
         * Secondary identifier
         * @type {number}
         */
		this.secondaryId = secondaryId;
		/**
         * Name
         * @type {string}
         */
		this.tag = tag;
		/**
         * Game scene
         * @type {Scene}
         */
		this.scene = null;

		this.mesh = mesh;

		if(this.mesh == null){
			// create a default mesh
			this.mesh = new PIXI.Container();
		}

		/**
         * Object states
         * @type {number}
         */
		this.state = STATE_DRAWABLE | STATE_LISTENING | STATE_UPDATABLE;
	}

	submitChanges(recursively = false) {

		// TODO update pixi transform
		this.addPendingGameObjects(!recursively);

		// add game objects first 
		if (recursively) {
			for (let [key, val] of this.children) {
				val.addPendingGameObjects();
			}
		}

		// components should be added after all game objects
		this.addPendingComponents();

		this.removePendingComponents();
		this.removePendingGameObjects(!recursively);

		// update other collections
		if (recursively) {
			for (let [key, val] of this.children) {
				val.submitChanges(true);
			}
		}
	}

	addState(state: number) {
		this.state |= state;
	}

	hasState(state: number) {
		return (this.state & state) == state;
	}

	removeState(state: number) {
		this.state &= (1 << state / 2); // todo fix this
	}

	hasFlag(flag: number) {
		return this.flags.hasFlag(flag);
	}

	setFlag(flag: number) {
		this.flags.setFlag(flag);
	}

	resetFlag(flag: number) {
		this.flags.resetFlag(flag);
	}

	switchFlag(flag1: number, flag2: number) {
		this.flags.switchFlag(flag1, flag2);
	}

	remove() {
		this.parent.removeGameObject(this);
	}

	// gets root object
	getRoot() {
		return this.scene.root;
	}

	/**
	 * Sends message to all components in the scope of this object
	 * @param {Msg} msg message to sent 
	 */
	sendmsgToComponents(msg: Msg, applyToChildren = false) {
		// todo optimize and send only to subscribers!
		for (let component of this.components) {
			if (component.owner.hasState(STATE_LISTENING)) {
				component.onmessage(msg);
			}
		}

		if (applyToChildren) {
			for (let [key, val] of this.children) {
				val.sendmsgToComponents(msg, applyToChildren);
			}
		}
	}

	// adds a new game object into the scene
	addGameObject(obj: GameObject) {
		obj.scene = this.scene;
		obj.parent = this;
		this.objectsToAdd.push(obj);
	}

	// removes given game object as soon as the update cycle finishes
	removeGameObject(obj: GameObject) {
		obj.state = STATE_INACTIVE;
		this.objectsToRemove.push(obj);
	}

	addComponent(component: Component) {
		component.owner = this;
		component.scene = this.scene;
		this.componentsToAdd.push(component);
	}

	removeComponent(component: Component) {
		this.componentsToRemove.push(component);
	}

	removeComponentByName(name: string) {
		for (let cmp of this.components) {
			if (cmp.constructor.name == name) {
				this.removeComponent(cmp);
				return true;
			}
		}
		// try also the pending collection
		let cntr = 0;
		for (let cmp of this.componentsToAdd) {
			if (cmp.constructor.name == name) {
				this.componentsToAdd.splice(cntr);
				return true;
			}
			cntr++;
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
		for (let cmp of this.componentsToAdd) {
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

	update(delta: number, absolute: number) {
		if (this.hasState(STATE_UPDATABLE)) {
			this.submitChanges(false);

			for (let component of this.components) {
				component.update(delta, absolute);
			}

			for (let [key, val] of this.children) {
				val.update(delta, absolute);
			}
		}
	}

	// adds pending objects
	protected addPendingGameObjects(submitChanges = true) {
		for (let obj of this.objectsToAdd) {
			// set it in both addGameObject and _addPendingGameObject since
			// the parent might not had its scene assigned
			obj.scene = this.scene;
			obj.parent = this;
			this.children.set(obj.id, obj);
			this.mesh.addChild(obj.mesh);
			this.scene.addGameObject(obj);

			if (submitChanges) {
				obj.submitChanges(false);
			}
		}

		this.objectsToAdd = [];
	}

	// removes pending objects;
	protected removePendingGameObjects(submitChanges = true) {
		for (let obj of this.objectsToRemove) {
			obj.removeAllComponents();
			obj.submitChanges(false);
			this.scene.removeGameObject(obj);
			this.children.delete(obj.id);
			obj.parent = null;
			obj.scene = null;

			if (submitChanges) {
				obj.submitChanges(false);
			}
		}

		this.objectsToRemove = [];
	}

	protected addPendingComponents() {
		for (let obj of this.componentsToAdd) {
			obj.owner = this;
			obj.scene = this.scene;
			this.components.push(obj);
			obj.oninit();
		}

		this.componentsToAdd = [];
	}

	// removes all components that are to be removed
	protected removePendingComponents() {
		for (let component of this.componentsToRemove) {
			component.finalize();

			for (var i = 0; i < this.components.length; i++) {
				if (this.components[i] == component) {
					this.components.splice(i, 1);
					this.scene.removeComponent(component);
					break;
				}
			}
		}
		this.componentsToRemove = [];
	}
}