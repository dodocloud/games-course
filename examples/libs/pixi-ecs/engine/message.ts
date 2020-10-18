import Component from './component';
import Container from './game-objects/container';

/**
 * Response collected when a message is sent
 */
export interface MessageResponse {
	/**
	 * Id of a component that received a message
	 */
	componentId: number;
	/**
	 * Custom data payload
	 */
	data?: any;
	/**
	 * Custom error payload
	 */
	error?: any;
}

/**
 * A collection of responses for a message that has been sent
 */
export class MessageResponses {
	responses: MessageResponse[] = [];

	/**
	 * Gets data of the first response
	 */
	getData<T>(): T {
		return (this.responses && this.responses.length > 0) ? this.responses[0].data as T : null;
	}

	isProcessed() {
		return this.responses.length !== 0;
	}

	isSuccess() {
		return !this.isError();
	}

	isError() {
		return this.responses.filter(r => r.error != null).length ? true : false;
	}
}

/**
 * Messaging entity, informs who has sent it and from which component
 */
export default class Message {

	/**
	 * Action type identifier
	 */
	private _action: string = null;

	/**
	 * Component that sent this message
	 */
	private _component: Component<any> = null;

	/**
	 * GameObject attached to this message
	 */
	private _gameObject: Container = null;
	
	/**
	 * Data payload
	 */
	data: any = null;

	/*
	 * If any handler sets this flag to true, the message will not be sent further
	 */
	expired: boolean = false;

	/**
	 * Stores any response along the way
	 */
	responses: MessageResponses;


	constructor(action: string, component?: Component<any>, gameObject?: Container, data?: any) {
		this._action = action;
		this._component = component;
		this._gameObject = gameObject;
		this.data = data;
		this.responses = new MessageResponses();
	}

	get action() {
		return this._action;
	}

	get component() {
		return this._component;
	}

	get gameObject() {
		return this._gameObject;
	}
}