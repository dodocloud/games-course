import GameObject from './GameObject';
import Msg from './Msg';
import Scene from './Scene';


/**
 * Component that defines functional behavior of the game object (or its part)
 */
export default class Component {
    static idCounter = 0;
    id = 0;
    owner: GameObject = null;
    scene: Scene = null;
    isFinished = false;
    onFinished : (component: Component) => void = null;

	constructor() {
		this.id = Component.idCounter++;
	}

	// called whenever the component is added to the scene
	oninit() {
		// override
	}

	// subscribes itself as a listener for action with given key
	subscribe(action: string) {
		this.scene.subscribeComponent(action, this);
	}

	unsubscribe(action : string){
		this.scene.unsubscribeComponent(action, this);
	}

	// sends message to all subscribers
	sendmsg(action : string, data : any = null) {
		this.scene.sendmsgEntity(new Msg(action, this, this.owner, data));
	}

	// handles incoming message
	onmessage(msg : Msg) {
		// override
	}

	// invokes update cycle
	update(delta : number, absolute : number) {
		// override
	}

	// called whenever the component is to be removed
	finalize() {
		// override
	}

	// finishes this component
	finish() {
		this.owner.removeComponent(this);

		if (this.onFinished != null) {
			this.onFinished(this); // call the event
		}

		this.isFinished = true;
	}
}


