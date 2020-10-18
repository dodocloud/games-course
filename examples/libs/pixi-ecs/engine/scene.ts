import GameObjectProxy from './game-object-proxy';
import Message from './message';
import Component from './component';
import * as PIXI from 'pixi.js';
import { Messages, AttributeChangeMessage, StateChangeMessage, FlagChangeMessage, TagChangeMessage } from './constants';
import Container from './game-objects/container';
import { LookupMap } from '../utils/lookup-map';
import DebugComponent from '../components/debug-component';
import { QueryCondition, queryConditionCheck } from '../utils/query-condition';
import { MessageResponse } from './message';


/**
 * Class for action that is to be executed with a delay
 */
class Invocation {
	delay = 0; // time of invocation
	time = 0; // time of creation
	action: () => void = null; // action to execute
}

/**
 * Scene options
 * Note that every optimization consumes some memory as the data needs to be stored in maps and sets
 * If you don't need any of those features below, keep them disabled
 */
export interface SceneConfig {
	// enables searching by object flags
	flagsSearchEnabled?: boolean;
	// enables searching by object states
	statesSearchEnabled?: boolean;
	// enables searching by object tags
	tagsSearchEnabled?: boolean;
	// enables searching by object names
	namesSearchEnabled?: boolean;
	// enables notifying concerning attributes
	notifyAttributeChanges?: boolean;
	// enables notifying concerning states
	notifyStateChanges?: boolean;
	// enables notifying concerning flags
	notifyFlagChanges?: boolean;
	// enables notifying concerning tags
	notifyTagChanges?: boolean;
	// injects a debugging component and debugging HTML element
	debugEnabled?: boolean;
}

export const defaultConfig: SceneConfig = {
	flagsSearchEnabled: false,
	statesSearchEnabled: false,
	tagsSearchEnabled: true,
	namesSearchEnabled: true,
	notifyAttributeChanges: false,
	notifyStateChanges: false,
	notifyFlagChanges: false,
	notifyTagChanges: false,
	debugEnabled: false,
};

/**
 * Scene that keeps a collection of all game objects and component listeners
 */
export default class Scene {
	app: PIXI.Application;
	name: string;
	width: number;
	height: number;
	resolution: number;
	
	// PIXI stage object
	stage: Container = null;
	
	// collection of actions that should be invoked with a delay
	private pendingInvocations: Invocation[];
	// message action keys and all subscribers that listens to all these actions
	private subscribers: LookupMap<string, Component<any>>;
	// game objects mapped by their flags
	private gameObjectFlags: LookupMap<number, Container>;
	// game objects mapped by their state
	private gameObjectStates: LookupMap<number, Container>;
	// game objects mapped by their tags
	private gameObjectTags: LookupMap<string, Container>;
	// game objects mapped by their names
	private gameObjectNames: LookupMap<string, Container>;
	// collection of ALL game objects, mapped by their ids
	private gameObjects: Map<number, Container>;
	// indicator if the scene is just being updated
	private isUpdating: boolean;
	private _currentDelta: number;
	private _currentAbsolute: number;

	private _config: SceneConfig;
	// indicator that will be reset upon first update
	private sceneCleared: boolean;

	constructor(name: string, app: PIXI.Application, config?: SceneConfig) {
		this.name = name;
		this.subscribers = new LookupMap();
		this.gameObjects = new Map();

		this.initConfig(config);

		this.app = app;
		this.resolution = this.app.renderer.resolution;
		this.width = this.app.renderer.width / this.resolution;
		this.height = this.app.renderer.height / this.resolution;
		this.clearScene();
	}

	get config() {
		return this._config;
	}

	get currentDelta() {
		return this._currentDelta;
	}

	get currentAbsolute() {
		return this._currentAbsolute;
	}

	/**
	 * Adds a new function that will be invoked after a given amount of time
	 * @param delay delay in miliseconds. If 0, it will be invoked IN THE END OF THE UPDATE LOOP
	 * @param action function pointer with no arguments
	 */
	callWithDelay(delay: number, action: () => void) {
		this.pendingInvocations.push({
			delay: delay,
			time: 0,
			action: action
		});
	}

	/**
	 * Adds a component to the stage object (global component)
	 */
	addGlobalComponent(cmp: Component<any>) {
		this.stage.addComponent(cmp);
	}

	/**
	 * Adds a component to the stage object and invokes it immediately (global component)
	 */
	addGlobalComponentAndRun(cmp: Component<any>) {
		this.stage.addComponentAndRun(cmp);
	}

	/**
	 * Tries to find a global component by its class
	 */
	findGlobalComponentByName<T extends Component<any>>(className: string): T {
		return this.stage.findComponentByName<T>(className);
	}

	/**
	 * Removes a component from a stage object
	 */
	removeGlobalComponent(cmp: Component<any>) {
		this.stage.removeComponent(cmp);
	}

	/**
	 * Inserts a global attribute
	 */
	assignGlobalAttribute(key: string, val: any) {
		this.stage.assignAttribute(key, val);
	}

	/**
	 * Gets a global attribute by its id
	 */
	getGlobalAttribute<T>(key: string): T {
		return this.stage.getAttribute<T>(key);
	}

	/**
	 * Removes a global attribute by its key
	 */
	removeGlobalAttribute(key: string): boolean {
		return this.stage.removeAttribute(key);
	}

	/**
	 * Gets object by its id
	 */
	findObjectById(id: number): Container {
		if (this.gameObjects.has(id)) {
			return this.gameObjects.get(id);
		}
		return null;
	}

	/**
	 * Finds all objects that meet specific condition
	 */
	findObjectsByQuery(query: QueryCondition): Array<Container> {
		let result: Container[] = [];
		// linear complexity
		for (let [, object] of this.gameObjects) {
			if (queryConditionCheck(object, query)) {
				result.push(object);
			}
		}
		return result;
	}

	/**
	 * Finds all game objects by their name
	 */
	findObjectsByName(name: string): Array<Container> {
		if (!this.config.namesSearchEnabled) {
			throw new Error('Searching by name is not enabled. See SceneConfig');
		}
		return this.gameObjectNames.findAll(name);
	}

	/**
	 * Finds a first object of a given name
	 */
	findObjectByName(name: string): Container {
		if (!this.config.namesSearchEnabled) {
			throw new Error('Searching by name is not enabled. See SceneConfig');
		}
		return this.gameObjectNames.findFirst(name);
	}

	/**
	 * Finds all game objects by their tag
	 */
	findObjectsByTag(tag: string): Array<Container> {
		if (!this.config.tagsSearchEnabled) {
			throw new Error('Searching by tag is not enabled. See SceneConfig');
		}
		return this.gameObjectTags.findAll(tag);
	}

	/**
	 * Finds a first object with a given tag
	 */
	findObjectByTag(tag: string): Container {
		if (!this.config.tagsSearchEnabled) {
			throw new Error('Searching by tag is not enabled. See SceneConfig');
		}
		return this.gameObjectTags.findFirst(tag);
	}

	/**
	 * Finds all game objects by their flag
	 */
	findObjectsByFlag(flag: number): Array<Container> {
		if (!this.config.flagsSearchEnabled) {
			throw new Error('Searching by flags is not enabled. See SceneConfig');
		}
		return this.gameObjectFlags.findAll(flag);
	}

	/**
	 * Finds a first object with a given flag
	 */
	findObjectByFlag(flag: number): Container {
		if (!this.config.flagsSearchEnabled) {
			throw new Error('Searching by flags is not enabled. See SceneConfig');
		}
		return this.gameObjectFlags.findFirst(flag);
	}

	/**
	 * Finds all game objects by their state
	 */
	findObjectsByState(state: number): Array<Container> {
		if (!this.config.statesSearchEnabled) {
			throw new Error('Searching by states is not enabled. See SceneConfig');
		}
		return this.gameObjectStates.findAll(state);
	}

	/**
	 * Finds a first object of a given state
	 */
	findObjectByState(state: number): Container {
		if (!this.config.statesSearchEnabled) {
			throw new Error('Searching by states is not enabled. See SceneConfig');
		}
		return this.gameObjectStates.findFirst(state);
	}


	/**
	 * Sends message to all subscribers
	 */
	sendMessage(msg: Message, tagFilter?: string[]) {
		const responses: MessageResponse[] = [];
		this.subscribers.findAll(msg.action).forEach(ent => {
			// don't send expired messages 
			// don't send message to its own sender
			if (!msg.expired && (msg.component == null || msg.component.id !== ent.id)) {
				// apply tagFilter
				if(!tagFilter || tagFilter.find(tag => ent.owner.hasTag(tag))) {
					// collect responses
					const resp = ent.onMessage(msg);
					if(resp) {
						responses.push({
							componentId: ent.id,
							data: resp
						});
					}
				}
			}
		});

		msg.responses.responses = responses;

		// check global subscribers that are interested in all messages (usually for debugging)
		this.subscribers.findAll(Messages.ANY).forEach(ent => ent.onMessage(msg));
	
		if (this.config.debugEnabled) {
			console.log(`MSG: ${msg.action}; ${msg.responses.isProcessed() ? 'PROCESSED' : 'IGNORED'} ${msg.responses.isError() ? 'ERROR' : 'SUCCESS'}`);
		}
	}

	/**
	 * Removes all objects from scene at the end of current update loop
	 */
	clearSceneAsync(newConfig?: SceneConfig) {
		this.callWithDelay(0, () => this.clearScene(newConfig));
	}

	/**
	 * Removes all objects from the scene
	 */
	clearScene(newConfig?: SceneConfig) {
		if (this.isUpdating) {
			throw new Error('Scene can\'t be cleared during update loop. Use clearSceneAsync() instead!');
		}

		this.sendMessage(new Message(Messages.SCENE_CLEAR, null, null, this.name));

		if (newConfig) {
			this.initConfig(newConfig);
		}

		// reinitialize everything
		this.subscribers.clear();
		if (this.config.namesSearchEnabled) {
			if (this.gameObjectNames) {
				this.gameObjectNames.clear();
			} else {
				this.gameObjectNames = new LookupMap();
			}
		}
		if (this.config.statesSearchEnabled) {
			if (this.gameObjectStates) {
				this.gameObjectStates.clear();
			} else {
				this.gameObjectStates = new LookupMap();
			}
		}
		if (this.config.tagsSearchEnabled) {
			if (this.gameObjectTags) {
				this.gameObjectTags.clear();
			} else {
				this.gameObjectTags = new LookupMap();
			}
		}
		if (this.config.flagsSearchEnabled) {
			if (this.gameObjectFlags) {
				this.gameObjectFlags.clear();
			} else {
				this.gameObjectFlags = new LookupMap();
			}
		}

		this.sceneCleared = true;
		this.gameObjects.clear();
		this.pendingInvocations = [];
		this._currentDelta = this._currentAbsolute = 0;

		let newStage = new Container('stage');
	
		// stage doesn't have any parents, we need to remove its children recursively
		for (let child of this.app.stage.children) {
			child.destroy();
		}
		this.app.stage.destroy();
		this.app.stage = newStage; // reassign the default stage with our custom one (we need objects from namespace only)
		newStage._proxy.scene = this; // assign a scene
		this.stage = newStage;

		if (this.config.debugEnabled) {
			// inject debugger component
			this.addGlobalComponentAndRun(new DebugComponent());
		}

		this._onObjectAdded(newStage._proxy);
	}

	// ===============================================================================
	// methods that are supposed to be invoked only from within this library
	// ===============================================================================

	// executes the update cycle
	_update(delta: number, absolute: number) {
		if (this.sceneCleared) {
			this.sceneCleared = false;
		}

		this._currentDelta = delta;
		this._currentAbsolute = absolute;

		this.isUpdating = true;
		// update root object and all other objects recursively
		this.stage._proxy.update(delta, absolute);
		this.isUpdating = false;

		// execute pending invocations
		let i = this.pendingInvocations.length;
		while (i--) {
			let invocation = this.pendingInvocations[i];
			invocation.time += delta;

			if (invocation.time >= invocation.delay) {
				// call the function and remove it from the collection
				this.pendingInvocations.splice(i, 1);
				invocation.action();

				// check if the scene hasn't been cleared in the meantime
				if (this.sceneCleared) {
					break;
				}
			}
		}
	}


	// subscribes given component for messaging system
	_subscribeComponent(msgKey: string, component: Component<any>) {
		this.subscribers.insert(msgKey, component);
	}

	// unsubscribes given component
	_unsubscribeComponent(msgKey: string, component: Component<any>) {
		this.subscribers.remove(msgKey, component);
	}

	_onObjectAdded(obj: GameObjectProxy) {
		let pixiObj = obj.pixiObj;
		// fill all collections
		if (this.config.namesSearchEnabled) {
			this.gameObjectNames.insert(pixiObj.name, pixiObj);
		}

		if (this.config.flagsSearchEnabled) {
			obj.getAllFlags().forEach(flag => this.gameObjectFlags.insert(flag, pixiObj));
		}

		if (this.config.tagsSearchEnabled) {
			obj.tags.forEach(tg => this.gameObjectTags.insert(tg, pixiObj));
		}

		if (this.config.statesSearchEnabled) {
			this.gameObjectStates.insert(pixiObj.stateId, pixiObj);
		}

		this.gameObjects.set(obj.id, obj.pixiObj);
		this.sendMessage(new Message(Messages.OBJECT_ADDED, null, obj.pixiObj));
	}

	_onObjectRemoved(obj: GameObjectProxy) {
		let gameObj = obj.pixiObj;

		if (this.config.namesSearchEnabled) {
			this.gameObjectNames.remove(gameObj.name, gameObj);
		}

		if (this.config.flagsSearchEnabled) {
			this.gameObjectFlags.removeItem(gameObj);
		}

		if (this.config.statesSearchEnabled) {
			this.gameObjectStates.removeItem(gameObj);
		}

		if (this.config.tagsSearchEnabled) {
			this.gameObjectTags.removeItem(gameObj);
		}

		this.gameObjects.delete(obj.id);

		// notify listeners
		this.sendMessage(new Message(Messages.OBJECT_REMOVED, null, gameObj));
	}

	_onComponentAdded(component: Component<any>, obj: GameObjectProxy) {
		component.scene = this;
		this.sendMessage(new Message(Messages.COMPONENT_ADDED, component, obj.pixiObj));
	}

	_onComponentDetached(component: Component<any>) {
		this.subscribers.removeItem(component);
		this.sendMessage(new Message(Messages.COMPONENT_DETACHED, component, component.owner));
	}

	_onComponentRemoved(component: Component<any>, obj: GameObjectProxy) {
		this.subscribers.removeItem(component);
		this.sendMessage(new Message(Messages.COMPONENT_REMOVED, component, obj.pixiObj));
	}

	_onStateChanged(previous: number, current: number, obj: GameObjectProxy) {
		if (this.config.statesSearchEnabled) {
			this.gameObjectStates.remove(previous, obj.pixiObj);
			this.gameObjectStates.insert(current, obj.pixiObj);
		}
		if (this.config.notifyStateChanges) {
			let data: StateChangeMessage = { previous, current };
			this.sendMessage(new Message(Messages.STATE_CHANGED, null, obj.pixiObj, data));
		}
	}

	_onAttributeAdded(key: string, value: any, obj: GameObjectProxy) {
		if (this.config.notifyAttributeChanges) {
			let data: AttributeChangeMessage = {
				key: key,
				type: Messages.ATTRIBUTE_ADDED,
				previousValue: null,
				currentValue: value
			};
			this.sendMessage(new Message(Messages.ATTRIBUTE_ADDED, null, obj.pixiObj, data));
		}
	}

	_onAttributeChanged(key: string, previousValue: any, currentValue: any, obj: GameObjectProxy) {
		if (this.config.notifyAttributeChanges) {
			let data: AttributeChangeMessage = {
				key: key,
				type: Messages.ATTRIBUTE_CHANGED,
				previousValue: previousValue,
				currentValue: currentValue
			};
			this.sendMessage(new Message(Messages.ATTRIBUTE_CHANGED, null, obj.pixiObj, data));
		}
	}

	_onAttributeRemoved(key: string, value: any, obj: GameObjectProxy) {
		if (this.config.notifyAttributeChanges) {
			let data: AttributeChangeMessage = {
				key: key,
				type: Messages.ATTRIBUTE_REMOVED,
				previousValue: value,
				currentValue: null
			};
			this.sendMessage(new Message(Messages.ATTRIBUTE_REMOVED, null, obj.pixiObj, data));
		}
	}

	_onFlagChanged(flag: number, set: boolean, obj: GameObjectProxy) {
		if (this.config.flagsSearchEnabled) {
			if (set) {
				this.gameObjectFlags.insert(flag, obj.pixiObj);
			} else {
				this.gameObjectFlags.remove(flag, obj.pixiObj);
			}
		}
		if (this.config.notifyFlagChanges) {
			let data: FlagChangeMessage = { flag, isSet: set };
			this.sendMessage(new Message(Messages.FLAG_CHANGED, null, obj.pixiObj, data));
		}
	}

	_onTagAdded(tag: string, obj: GameObjectProxy) {
		if (this.config.tagsSearchEnabled) {
			this.gameObjectTags.insert(tag, obj.pixiObj);
		}
		if (this.config.notifyTagChanges) {
			let data: TagChangeMessage = { tag, type: Messages.TAG_ADDED };
			this.sendMessage(new Message(Messages.TAG_ADDED, null, obj.pixiObj, data));
		}
	}

	_onTagRemoved(tag: string, obj: GameObjectProxy) {
		if (this.config.tagsSearchEnabled) {
			this.gameObjectTags.remove(tag, obj.pixiObj);
		}
		if (this.config.notifyTagChanges) {
			let data: TagChangeMessage = { tag, type: Messages.TAG_REMOVED };
			this.sendMessage(new Message(Messages.TAG_REMOVED, null, obj.pixiObj, data));
		}
	}

	private initConfig(config?: SceneConfig) {
		this._config = {
			...defaultConfig,
			...config
		};
	}
}