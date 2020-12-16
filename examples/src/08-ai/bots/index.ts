import * as ECS from '../../../libs/pixi-ecs';
import { Assets } from './constants';
import { BotFactory } from './bot-factory';
import { GameModel } from './model';
import { ECSExample, getBaseUrl } from '../../utils/APHExample';

export class Bots extends ECSExample {
	engine: ECS.Engine;

	load() {
		this.engine.app.loader
			.reset()    // for hot reload
			.add(Assets.TEXTURE, `${getBaseUrl()}/assets/08-ai/spritesheet.png`)
			.load(() => this.onAssetsLoaded());
	}

	onAssetsLoaded() {
		let factory = new BotFactory();
		factory.initializeGame(this.engine.scene.stage, new GameModel());
	}
}