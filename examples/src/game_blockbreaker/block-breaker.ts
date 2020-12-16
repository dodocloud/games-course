import * as ECS from '../../libs/pixi-ecs';
import LevelParser from './level-parser';
import { Assets, SCENE_WIDTH } from './constants';
import { Factory } from './factory';

class BlockBreaker {
	engine: ECS.Engine;

	constructor() {
		this.engine = new ECS.Engine();
		let canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

		this.engine.init(canvas, {
			width: canvas.width,
			height: canvas.height,
			resolution: canvas.width / SCENE_WIDTH
		});

		this.engine.app.loader
			.reset()
			.add(Assets.SPRITESHEET, './assets/game_blockbreaker/spritesheet.png')
			.add(Assets.LEVELS, './assets/game_blockbreaker/levels.txt')
			.load(() => this.loadGame())
	}

	loadGame() {
		const levelsStr = this.engine.app.loader.resources[Assets.LEVELS].data;
		const parser = new LevelParser();
		const levels = parser.parse(levelsStr);
		const factory = new Factory();
		factory.loadLevel(levels[0], this.engine.scene);
	}
}

export default new BlockBreaker();