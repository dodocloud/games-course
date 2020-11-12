import * as ECS from '../../libs/pixi-ecs';
import { ECSExample, getBaseUrl } from '../utils/APHExample';
import { Random } from '../../libs/aph-math';

const ITERATIONS = 1000;

abstract class DistributionBase extends ECSExample {
	random: Random;
	render: ECS.Graphics;

	load() {
		this.random = new Random(135061);

		this.render = new ECS.Graphics('');
		let width = this.engine.app.screen.width;
		let height = this.engine.app.screen.height;

		let radius = width / 3;

		let target = new ECS.Graphics();
		this.engine.app.stage.addChild(target);
		target.beginFill(0xa6aeb8);
		target.drawCircle(width / 2, height / 2, radius);
		target.endFill();

		this.engine.app.stage.addChild(this.render);

		let counter = 0;

		this.render.addComponent(new ECS.FuncComponent('').doOnUpdate((cmp, delta, absolute) => {
			let sampleX = Math.floor(this.generateNumber(-radius, radius));
			let sampleY = Math.floor(this.generateNumber(-radius, radius));
			this.render.beginFill(0x000000);
			if (new ECS.Vector(sampleX, sampleY).magnitude() <= radius) {
				this.render.drawCircle(width / 2 + sampleX, height / 2 + sampleY, 6);
			}
			this.render.endFill();

			if (counter++ >= ITERATIONS) {
				cmp.finish();
			}
		}));
	}

	abstract generateNumber(min: number, max: number): number;
}

export class DistributionNormal extends DistributionBase {

	generateNumber(min: number, max: number): number {
		return this.random.normal(min, max, 1);
	}
}

export class DistributionUniform extends DistributionBase {

	generateNumber(min: number, max: number): number {
		return this.random.uniform(min, max);
	}
}