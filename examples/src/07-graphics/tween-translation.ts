import * as ECS from '../../libs/pixi-ecs';
import { ECSExample } from '../utils/APHExample';
import { TranslateAnimation, typeToFunction, InterpolationType } from './utils/animation';
import { Interpolation } from '../../libs/aph-math';

export type TweenTranslationConfig = ECS.EngineConfig & {
	interpolation: InterpolationType
}

export class TweenTranslation extends ECSExample {

	interpolation: () => number;

	constructor(config: TweenTranslationConfig) {
		super(config);
		this.interpolation = (config && config.interpolation) ? typeToFunction(config.interpolation) : Interpolation.linear;
	}

	load() {
		this.engine.app.loader
			.reset()
			.load(() => {

				let cmp = new TranslateAnimation(0, 0, this.engine.app.view.clientWidth - 200, this.engine.app.view.clientHeight - 200, 3000, true, 0);
				let graphics = new ECS.Builder(this.engine.scene)
					.asGraphics()
					.relativePos(0.5)
					.anchor(0.5)
					.withParent(this.engine.scene.stage)
					.withComponent(cmp)
					.build<ECS.Graphics>();

				const width = this.engine.app.view.width;
				graphics.beginFill(0xFF0000);
				graphics.drawRect(0, 0, width / 4, width / 4);
				graphics.endFill();

				cmp.interpolation = this.interpolation;
			});
	}
}
