import Component, { ComponentState } from './component';
import Scene from './scene';
import Container from './game-objects/container';
import GameObject from './game-object';
import Flags from '../utils/flags';

/**
 * States of game objects
 */
export enum GameObjectState {
	NEW = 0,
	ATTACHED = 1,
	DETACHED = 2,
	DESTROYED = 3
}

/**
 * Game entity that aggregates generic attributes and components
 * It is used as a proxy by objects directly inherited from PIXI objects
 */
export default class GameObjectProxy {

	private static idCounter = 0;

	// auto-incremented identifier
	protected _id = 0;
	// state of this object
	protected _stateId = 0;
	// game object this proxy is attached to
	protected _pixiObj: Container = null;
	// link to scene
	protected _scene: Scene = null;
	// collection of tags
	protected _tags: Set<string> = new Set();
	// bit-array of flags
	protected flags = new Flags();
	// set of all components, mapped by their id
	protected components = new Map<number, Component<any>>();
	// generic attributse
	protected attributes: Map<string, any> = new Map<string, any>();
	// list of components that will be added at the end of update loop
	protected componentsToAdd = new Array<Component<any>>();
	protected _internalState: GameObjectState = GameObjectState.NEW;
	// last value of the game time
	protected lastAbsolute = 0;

	constructor(name: string, pixiObj: Container) {
		this._id = GameObjectProxy.idCounter++;
		this._pixiObj = pixiObj;
		this._pixiObj.name = name;
	}

	public get id() {
		return this._id;
	}

	public get pixiObj() {
		return this._pixiObj;
	}

	public get scene() {
		return this._scene;
	}

	public set scene(scene: Scene) {
		this._scene = scene;
	}

	public get rawAttributes() {
		return this.attributes;
	}

	public get rawComponents() {
		return this.components;
	}

	public get tags() {
		return new Set(this._tags);
	}

	public get isOnScene() {
		return this.scene !== null;
	}

	public get internalState() {
		return this._internalState;
	}

	public getAllFlags(): Set<number> {
		return this.flags.getAllFlags();
	}

	/**
	 * Returns true if this object is still waiting for
	 * an update within the scope of the current tick
	 */
	public get waitingForUpdate(): boolean {
		return this.lastAbsolute < this.scene.currentAbsolute;
	}

	/**
	 * Adds a new component
	 */
	addComponent(component: Component<any>, runInstantly: boolean = false) {
		if (runInstantly) {
			if (!this.isOnScene) {
				throw new Error('This object hasn\'t been added to the scene yet');
			}
			if (this._internalState === GameObjectState.DETACHED) {
				throw new Error('Can\'t run a component upon a detached object!');
			}
			this.initNewComponent(component);
			if (!this.waitingForUpdate) {
				// run only if this object has already run within the current tick
				component.onUpdate(this.scene.currentDelta, this.scene.currentAbsolute);
			}
		} else {
			this.componentsToAdd.push(component);
		}
	}

	/**
	 * Removes an existing component
	 */
	removeComponent(cmp: Component<any>) {
		if (cmp._cmpState === ComponentState.RUNNING) {
			cmp.onFinish();
			cmp._cmpState = ComponentState.FINISHED;
		}
		cmp.onDetach();
		cmp._cmpState = ComponentState.DETACHED;
		cmp.onRemove();
		cmp._cmpState = ComponentState.REMOVED;
		cmp._lastFixedUpdate = 0;
		cmp.owner = null;

		this.components.delete(cmp.id);

		if (this.isOnScene) {
			// inform the scene that will inform other objects, but only
			// if this object is still attached to the scene
			this.scene._onComponentRemoved(cmp, this);
		}
	}

	/**
	 * Removes all components
	 */
	removeAllComponents() {
		for (let [, cmp] of this.components) {
			this.removeComponent(cmp);
		}
	}

	/**
	 * Tries to find a component by given class name
	 * Keep in mind that if the name of a component is not specified as an attribute,
	 * this method may not work for minified/obfuscated code
	 */
	findComponentByName<T extends Component<any>>(name: string): T {
		for (let [, cmp] of this.components) {
			if (cmp.name === name) {
				return cmp as T;
			}
		}
		return null;
	}

	/**
	 * Inserts a new attribute or modifies an existing one
	 */
	assignAttribute(key: string, val: any) {
		if (!this.attributes.has(key)) {
			// new attribute
			this.attributes.set(key, val);
			if (this.isOnScene) {
				this.scene._onAttributeAdded(key, val, this);
			}
		} else {
			// replacing existing attribute
			let previous = this.attributes.get(key);
			this.attributes.set(key, val);
			if (this.isOnScene) {
				this.scene._onAttributeChanged(key, previous, val, this);
			}
		}
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
		if (this.attributes.has(key)) {
			let val = this.attributes.get(key);
			this.attributes.delete(key);
			if (this.isOnScene) {
				this.scene._onAttributeRemoved(key, val, this);
			}
			return true;
		}
		return false;
	}

	/**
	 * Add a new tag
	 */
	addTag(tag: string) {
		this._tags.add(tag);
		if (this.isOnScene) {
			this.scene._onTagAdded(tag, this);
		}
	}

	/**
	 * Removes tag
	 */
	removeTag(tag: string) {
		if (this._tags.has(tag)) {
			this._tags.delete(tag);
			if (this.isOnScene) {
				this.scene._onTagRemoved(tag, this);
			}
		}
	}

	/**
	 * Returns true if a given tag is set
	 */
	hasTag(tag: string): boolean {
		return this._tags.has(tag);
	}

	/**
	 * Sets flag at a given index
	 */
	setFlag(flag: number) {
		this.flags.setFlag(flag);
		if (this.isOnScene) {
			this.scene._onFlagChanged(flag, true, this);
		}
	}

	/**
	 * Resets flag at a given index
	 */
	resetFlag(flag: number) {
		this.flags.resetFlag(flag);
		if (this.isOnScene) {
			this.scene._onFlagChanged(flag, false, this);
		}
	}

	/**
	 * Returns true, if a flag at a given index is set
	 */
	hasFlag(flag: number): boolean {
		return this.flags.hasFlag(flag);
	}

	/**
	 * Inverts a flag at a given index
	 */
	invertFlag(flag: number) {
		this.flags.invertFlag(flag);
		if (this.isOnScene) {
			this.scene._onFlagChanged(flag, this.flags.hasFlag(flag), this);
		}
	}

	/**
	 * Gets a numeric state of this object
	 */
	get stateId(): number {
		return this._stateId;
	}

	/**
	 * Sets a numeric state of this object
	 */
	set stateId(state: number) {
		let previous = this.stateId;
		this._stateId = state;
		if (this.isOnScene) {
			this.scene._onStateChanged(previous, state, this);
		}
	}

	/**
	 * Processes a new child
	 * The child will initialize all components just here
	 */
	onChildAdded(object: GameObjectProxy) {
		if(object.internalState === GameObjectState.ATTACHED) {
			throw new Error(`This object has already been added to the scene: ${object.pixiObj.name}`);
		}
		object.scene = this.scene;
		object.attach();
	}

	/**
	 * Processes a removed child
	 * The child will detach all components just here
	 */
	onChildDetached(object: GameObjectProxy) {
		object.detach();
	}

	/**
	 * Processes a destroyed child
	 * The child will remove all components and destroys the PIXI object
	 */
	onChildDestroyed(object: GameObjectProxy) {
		object.destroy();
	}

	update(delta: number, absolute: number) {
		// initialize all components from the previous loop
		this.initNewComponents();


		// update all components
		for (let [, cmp] of this.components) {
			if (cmp._cmpState === ComponentState.RUNNING) {
				cmp.onUpdate(delta, absolute);
				
				// handle fixed update
				if (cmp.fixedFrequency && ((absolute - cmp._lastFixedUpdate) >= 1000 / cmp.fixedFrequency)) { // fixed update
					let delta = cmp._lastFixedUpdate === 0 ? 1000 / cmp.fixedFrequency : (absolute - cmp._lastFixedUpdate);
					cmp.onFixedUpdate(delta, absolute);
					cmp._lastFixedUpdate = absolute;
				}
			}
		}

		// update all children recursively and their components
		for (let child of this.pixiObj.children) {
			let cmpChild = <GameObject><any>child;
			if (cmpChild && cmpChild._proxy) { // some object may be regular PIXI objects, not PIXICmp
				cmpChild._proxy.update(delta, absolute);
			}
		}

		this.lastAbsolute = absolute;
	}

	initNewComponent(component: Component<any>) {
		if (!this.isOnScene) {
			throw new Error('The object must be on the scene before its components are initialized');
		}

		if (component.owner !== null) {
			throw new Error(`The component ${component.name}:${component.id} seems to already have a game object assigned!`);
		}
		component.owner = this.pixiObj;
		this.components.set(component.id, component);
		this.scene._onComponentAdded(component, this);

		component.onInit();
		component._cmpState = ComponentState.INITIALIZED;

		component.onAttach();
		component._cmpState = ComponentState.RUNNING;
	}

	initNewComponents() {
		if (this.componentsToAdd.length !== 0) {
			// create a copy because someone else can add new components in the meantime
			const toAdd = [...this.componentsToAdd];
			this.componentsToAdd = [];
			toAdd.forEach(cmp => {
				// at first, add it to the set so it can be looked up
				this.components.set(cmp.id, cmp);
				this.initNewComponent(cmp);
			});
		}
	}

	attach() {
		this._internalState = GameObjectState.ATTACHED;
		this.scene._onObjectAdded(this);
		this.initNewComponents();
		// re-attach detached components
		this.components.forEach(cmp => {
			if (cmp.cmpState === ComponentState.DETACHED) {
				this.scene._onComponentAdded(cmp, this);
				cmp.onAttach();
				cmp._cmpState = ComponentState.RUNNING;
			}
		});

		for (let child of this.pixiObj.children) {
			let cmpObj = <GameObject><any>child;
			if (cmpObj && cmpObj._proxy) {
				cmpObj._proxy.attach();
			}
		}
	}

	detach() {
		this._internalState = GameObjectState.DETACHED;

		// detach all components
		this.components.forEach(cmp => {
			if(cmp._cmpState !== ComponentState.DETACHED) {
				this.scene._onComponentDetached(cmp);
				cmp.onDetach();
				cmp._cmpState = ComponentState.DETACHED;
			}
		});

		this.scene._onObjectRemoved(this);

		for (let child of this.pixiObj.children) {
			let cmpObj = <GameObject><any>child;
			if (cmpObj && cmpObj._proxy) {
				cmpObj._proxy.detach();
			}
		}
	}

	destroy() {
		this._internalState = GameObjectState.DESTROYED;
		this.removeAllComponents();

		this.scene._onObjectRemoved(this);

		for (let child of this.pixiObj.children) {
			let cmpObj = <GameObject><any>child;
			if (cmpObj && cmpObj._proxy) {
				cmpObj._proxy.destroy();
			}
		}
	}
}