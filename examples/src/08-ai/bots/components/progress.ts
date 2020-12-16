import * as ECS from '../../../../libs/pixi-ecs';

/**
 * Progress indicator
 */
export class Progress extends ECS.Component {

	currentProgress: () => number;

	constructor(currentProgress: () => number) {
		super();
		this.currentProgress = currentProgress;
	}

	onUpdate(delta: number, absolute: number) {
		let progress = this.currentProgress();

		if (progress <= 0) {
			this.owner.visible = false;
		} else {
			this.owner.visible = true;
			let render = this.owner.asGraphics();
			render.clear();
			render.beginFill(0x000000, 0.8);
			render.drawRect(0, 0, this.owner.parent.width, 20);
			render.beginFill(0x1fbe1b);
			render.drawRect(2, 2, progress * (this.owner.parent.width - 4), 16);
			render.endFill();
		}
	}
}