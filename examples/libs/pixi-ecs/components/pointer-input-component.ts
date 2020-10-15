import Component from '../engine/component';
import Message from '../engine/message';

export enum PointerMessages {
	POINTER_TAP = 'pointer-tap',
	POINTER_DOWN = 'pointer-down',
	POINTER_OVER = 'pointer-over',
	POINTER_RELEASE = 'pointer-release'
}

export interface PointerInputComponentProps {
	handleClick?: boolean;
	handlePointerDown?: boolean;
	handlePointerOver?: boolean;
	handlePointerRelease?: boolean;
}

/**
 * Component that handles touch and mouse events and transforms them into messages
 * that can be subscribed by any other component
 */
export class PointerInputComponent extends Component<PointerInputComponentProps> {

	private lastTouch: Touch | MouseEvent = null;
	private messagesToSend: Message[];

	constructor(props: PointerInputComponentProps) {
		super({
			handleClick: true,
			handlePointerDown: false,
			handlePointerOver: false,
			handlePointerRelease: false,
			...props
		});
	}

	onAttach() {
		this.lastTouch = null;
		this.messagesToSend = [];

		let canvas = this.scene.app.view;

		canvas.addEventListener('touchstart', this.handleStart, false);
		canvas.addEventListener('touchend', this.handleEnd, false);
		canvas.addEventListener('mousedown', this.handleStart, false);
		if (this.props.handlePointerRelease || this.props.handleClick) {
			canvas.addEventListener('mouseup', this.handleEnd, false);
		}
		if (this.props.handlePointerOver) {
			canvas.addEventListener('mousemove', this.handleMove, false);
			canvas.addEventListener('touchmove', this.handleMove, false);
		}
	}

	onUpdate() {
		for (let msg of this.messagesToSend) {
			this.scene.sendMessage(msg);
		}
		this.messagesToSend = [];
	}

	onDetach() {
		let canvas = this.scene.app.view;
		canvas.removeEventListener('touchstart', this.handleStart);
		canvas.removeEventListener('touchend', this.handleEnd);
		canvas.removeEventListener('mousedown', this.handleStart);

		if (this.props.handlePointerRelease || this.props.handleClick) {
			canvas.removeEventListener('mouseup', this.handleEnd);
		}

		if (this.props.handlePointerOver) {
			canvas.removeEventListener('mousemove', this.handleMove);
			canvas.removeEventListener('touchmove', this.handleMove);
		}
	}

	sendMessage(action: string, data: any = null): Message {
		// wait for next update loop to send all the messages
		this.messagesToSend.push(new Message(action, this, this.owner, data));
		return null;
	}

	protected handleStart = (evt: TouchEvent | MouseEvent) => {
		evt.preventDefault();
		let isTouch = (window.TouchEvent && evt instanceof TouchEvent);
		if (isTouch && (evt as TouchEvent).changedTouches.length === 1) {
			// only single-touch
			this.lastTouch = (evt as TouchEvent).changedTouches[0];
		} else {
			this.lastTouch = evt as MouseEvent;
		}

		if (this.props.handlePointerDown) {
			this.sendMessage(PointerMessages.POINTER_DOWN, {
				mousePos: this.getMousePos(this.scene.app.view, evt, isTouch),
				isTouch: isTouch
			});
		}
	}

	protected handleMove = (evt: TouchEvent) => {
		evt.preventDefault();
		let isTouch = typeof (evt.changedTouches) !== 'undefined';
		this.sendMessage(PointerMessages.POINTER_OVER, {
			mousePos: this.getMousePos(this.scene.app.view, evt, isTouch),
			isTouch: isTouch
		});
	}

	protected handleEnd = (evt: TouchEvent | MouseEvent) => {
		evt.preventDefault();
		let posX, posY;
		let isTouch = (window.TouchEvent && evt instanceof TouchEvent);
		if (this.lastTouch != null) {
			if (isTouch && (evt as TouchEvent).changedTouches.length === 1) {
				posX = (evt as TouchEvent).changedTouches[0].pageX;
				posY = (evt as TouchEvent).changedTouches[0].pageY;

			} else {
				// mouse
				posX = (evt as MouseEvent).pageX;
				posY = (evt as MouseEvent).pageY;
			}

			// 10px tolerance should be enough
			if (Math.abs(this.lastTouch.pageX - posX) < 10 &&
				Math.abs(this.lastTouch.pageY - posY) < 10 && (isTouch || this.props.handleClick)) {
				// at last send the message to all subscribers about this event
				this.sendMessage(PointerMessages.POINTER_TAP, {
					mousePos: this.getMousePos(this.scene.app.view, evt, isTouch),
					isTouch: isTouch
				});
			} else {
				this.sendMessage(PointerMessages.POINTER_RELEASE, {
					mousePos: this.getMousePos(this.scene.app.view, evt, isTouch),
					isTouch: isTouch
				});
			}
		}
	}

	// Get the mouse position
	protected getMousePos(canvas: HTMLCanvasElement, evt: TouchEvent | MouseEvent, isTouch: boolean) {
		let rect = canvas.getBoundingClientRect();
		let res = this.scene.app.renderer.resolution;
		let clientX = isTouch ? (evt as TouchEvent).changedTouches[0].clientX : (evt as MouseEvent).clientX;
		let clientY = isTouch ? (evt as TouchEvent).changedTouches[0].clientY : (evt as MouseEvent).clientY;
		return {
			posX: Math.round((clientX - rect.left) / (rect.right - rect.left) * this.scene.app.view.width / res),
			posY: Math.round((clientY - rect.top) / (rect.bottom - rect.top) * this.scene.app.view.height / res)
		};
	}
}
