import Msg from './Msg';
import Scene from './Scene';
import { PIXICmp } from './PIXIObject';
import GameObjectProxy from './GameObjectProxy';


/**
 * Component that defines a functional behavior of an entity which is attached to
 */
export default class Component {
	private static idCounter = 0;
	private isFinished = false;

	// auto-incremented id
	id = 0;
	// owner object of this component
	owner: PIXICmp.ComponentObject = null;
	// link to scene
	scene: Scene = null;

	constructor() {
		this.id = Component.idCounter++;
	}

	/**
	 * Called when the component is being added to the scene
	 */
	onInit() {
		// override
	}

	/**
	 * Handles incoming message
	 */
	onMessage(msg: Msg) {
		// override
	}

	/**
	 * Handles update loop
	 */
	onUpdate(delta: number, absolute: number) {
		// override
	}

	/**
	 * Called before removal from scene
	 */
	onRemove() {
		// override
	}

	/**
	 * Called after finish()
	 */
	onFinish() {
		// override
	}

	/**
	 * Subscribes itself as a listener for action with given key
	 */
	subscribe(action: string, ...actions: string[]) {
		this.scene._subscribeComponent(action, this);
		for (let action of actions) {
			this.scene._subscribeComponent(action, this);
		}
	}

	/**
	 * Unsubscribes itself
	 */
	unsubscribe(action: string) {
		this.scene._unsubscribeComponent(action, this);
	}

	/**
	 * Sends a message to all subscribers
	 */
	sendMessage(action: string, data: any = null) {
		this.scene.sendMessage(new Msg(action, this, this.owner, data));
	}

	/**
	 * Detaches component from scene
	 */
	finish() {
		this.owner.removeComponent(this);
		this.onFinish();
		this.isFinished = true;
	}

	isRunning() {
		return !this.isFinished;
	}
}


