import Message from '../engine/message';
import Component from '../engine/component';
import { QueryCondition, queryConditionCheck } from '../utils/query-condition';


interface MessageCaptureContext<T> {
	onlyOnce: boolean;
	condition?: QueryCondition;
	handler: (cmp: Component<T>, msg: Message) => void;
}

/**
 * Functional component
 */
export class FuncComponent<T = void> extends Component<T> {
	protected duration: number = 0;
	protected firstRun: number = 0;

	private onInitFunc: (cmp: Component<T>) => void = null;
	private onAttachFunc: (cmp: Component<T>) => void = null;
	private onMessageHandlers = new Map<string, MessageCaptureContext<T>>();
	private onMessageConditionalHandlers = new Map<string, Set<MessageCaptureContext<T>>>();
	private onUpdateFunc: (cmp: Component<T>, delta: number, absolute: number) => void = null;
	private onFixedUpdateFunc: (cmp: Component<T>, delta: number, absolute: number) => void = null;
	private onDetachFunc: (cmp: Component<T>) => void = null;
	private onRemoveFunc: (cmp: Component<T>) => void = null;
	private onFinishFunc: (cmp: Component<T>) => void = null;

	/**
	 * Creates a new functional component
	 * @param name name that will be used instead of class name within the scene
	 */
	constructor(name: string, props?: T) {
		super(props);
		this._name = name;
	}

	public get name() {
		return this._name;
	}

	/**
	 * Registers a function that will be invoked for onInit()
	 */
	doOnInit(func: (cmp: FuncComponent<T>) => void): FuncComponent<T> {
		this.onInitFunc = func;
		return this;
	}

	/**
	 * Registers a function that will be invoked for onAttach()
	 */
	doOnAttach(func: (cmp: FuncComponent<T>) => void): FuncComponent<T> {
		this.onAttachFunc = func;
		return this;
	}

	/**
	 * Registers a function that will be invoked when a specific message arrives
	 */
	doOnMessage(action: string, handler: (cmp: FuncComponent<T>, msg: Message) => void): FuncComponent<T> {
		this.onMessageHandlers.set(action, { handler: handler, onlyOnce: false });
		return this;
	}

	/**
	 * Registers a function that will be invoked when a specific message arrives, but only once
	 */
	doOnMessageOnce(action: string, handler: (cmp: FuncComponent<T>, msg: Message) => void): FuncComponent<T> {
		this.onMessageHandlers.set(action, { handler: handler, onlyOnce: true });
		return this;
	}

	/**
	 * Registers a function that will be invoked when a specific message arrives and given conditions are met
	 * Can be used to listen only for a group of objects
	 */
	doOnMessageConditional(action: string, condition: QueryCondition, handler: (cmp: FuncComponent<T>, msg: Message) => void) {
		if (!this.onMessageConditionalHandlers.has(action)) {
			this.onMessageConditionalHandlers.set(action, new Set());
		}
		this.onMessageConditionalHandlers.get(action).add({ onlyOnce: false, handler: handler, condition: condition });
		return this;
	}

	/**
	 * Registers a function that will be invoked for onFixedUpdate
	 */
	doOnFixedUpdate(func: (cmp: FuncComponent<T>, delta: number, absolute: number) => void): FuncComponent<T> {
		this.onFixedUpdateFunc = func;
		return this;
	}


	/**
	 * Registers a function that will be invoked for onUpdate
	 */
	doOnUpdate(func: (cmp: FuncComponent<T>, delta: number, absolute: number) => void): FuncComponent<T> {
		this.onUpdateFunc = func;
		return this;
	}

	/**
	 * Registers a function that will be invoked for onDetach()
	 */
	doOnDetach(func: (cmp: FuncComponent<T>) => void): FuncComponent<T> {
		this.onDetachFunc = func;
		return this;
	}

	/**
	 * Registers a function that will be invoked for onRemove()
	 */
	doOnRemove(func: (cmp: FuncComponent<T>) => void): FuncComponent<T> {
		this.onRemoveFunc = func;
		return this;
	}

	/**
	 * Registers a function that will be invoked for onFinish()
	 */
	doOnFinish(func: (cmp: FuncComponent<T>) => void): FuncComponent<T> {
		this.onFinishFunc = func;
		return this;
	}

	/**
	 * Sets frequency for the fixed loop
	 */
	setFixedFrequency(fixedfrequency: number): FuncComponent<T> {
		this.fixedFrequency = fixedfrequency;
		return this;
	}

	/**
	 * Sets a duration for how long this component should run
	 */
	setDuration(duration: number): FuncComponent<T> {
		this.duration = duration;
		return this;
	}

	onInit() {
		if (this.onInitFunc != null) {
			this.onInitFunc(this);
		}
	}

	onAttach() {
		if (this.onAttachFunc != null) {
			this.onAttachFunc(this);
		}
		// register all messages
		for (let [key] of this.onMessageHandlers) {
			this.subscribe(key);
		}
		for (let [key] of this.onMessageConditionalHandlers) {
			this.subscribe(key);
		}
	}

	onMessage(msg: Message) {
		if (this.onMessageHandlers.has(msg.action)) {
			let handler = this.onMessageHandlers.get(msg.action);
			handler.handler(this, msg); // invoke handler
			if (handler.onlyOnce) { // if true, the handler should be invoked only once
				this.onMessageHandlers.delete(msg.action);
				this.unsubscribe(msg.action);
			}
		}

		if (this.onMessageConditionalHandlers.has(msg.action)) {
			let set = this.onMessageConditionalHandlers.get(msg.action);
			for (let handler of set) {
				if (msg.gameObject && queryConditionCheck(msg.gameObject, handler.condition)) {
					handler.handler(this, msg);
				}
			}
		}
	}

	onFixedUpdate(delta: number, absolute: number) {
		if (this.onFixedUpdateFunc != null) {
			this.onFixedUpdateFunc(this, delta, absolute);
		}
	}

	onUpdate(delta: number, absolute: number) {
		if (this.firstRun === 0) {
			this.firstRun = absolute;
		}
		if (this.duration !== 0 && (absolute - this.firstRun) >= this.duration) {
			this.finish();
			return;
		}

		if (this.onUpdateFunc != null) {
			this.onUpdateFunc(this, delta, absolute);
		}
	}

	onDetach() {
		if (this.onDetachFunc != null) {
			this.onDetachFunc(this);
		}
	}

	onRemove() {
		if(this.onRemoveFunc != null) {
			this.onRemoveFunc(this);
		}
	}

	onFinish() {
		this.firstRun = 0;
		if (this.onFinishFunc != null) {
			this.onFinishFunc(this);
		}
	}
}