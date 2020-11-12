import * as ECS from '../../libs/pixi-ecs';
import { ECSExample, getBaseUrl } from '../utils/APHExample';

const SPRITESHEET = `${getBaseUrl()}/assets/03-components/warrior.png`;

const sprite = {
	offsetMultX: 528,
	offsetMultY: 540,
	width: 528,
	height: 540
}

const FRAMES = 8;

export class Animation extends ECSExample {
	
	load() {
		this.engine.app.loader
			.add(SPRITESHEET)
			.load(() => {
				let texture = this.engine.app.loader.resources[SPRITESHEET].texture;
				let frame = 0, frameCounter = 0;
				new ECS.Builder(this.engine.scene)
					.asSprite(texture)
					.withParent(this.engine.scene.stage)
					.localPos(this.engine.app.view.width / 2, this.engine.app.view.height / 2)
					.anchor(0.5)
					.withComponent(new ECS.FuncComponent('animator').setFixedFrequency(10)
						.doOnFixedUpdate((cmp, delta, absolute) => {
							cmp.owner.asSprite().texture.frame = new PIXI.Rectangle((frame % 4 ) * sprite.offsetMultX, 
							Math.floor(frame / 4) * sprite.offsetMultY, sprite.width, sprite.height);
							frame = (frameCounter++) % FRAMES;
						}))
					.build();
			});
	}
	
	update() {
		// no-op
	}
}