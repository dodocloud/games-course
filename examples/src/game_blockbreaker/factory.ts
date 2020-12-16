import * as ECS from '../../libs/pixi-ecs';
import { Attrs, Messages, Tags, SCENE_WIDTH, TEXTURE_SCALE, Assets } from './constants';
import Level, { BRICK_INDEX_NONE } from './level';
import { PaddleKeyboardController } from './paddle-controller';
import { BallController } from './ball-controller';
import { BallCollisionTrigger } from './ball-collision-trigger';
import { BallCollisionResolver } from './ball-collision-resolver';
import { GameManager } from './game-manager';

export class Factory {
	loadLevel(level: Level, scene: ECS.Scene) {
		let bricks = new ECS.Container('bricksLayer');
		scene.stage.addChild(bricks);
		scene.addGlobalComponentAndRun(new ECS.KeyInputComponent());

		for (let i = 0; i < level.columns; i++) {
			for (let j = 0; j < level.rows; j++) {
				const index = level.getBrick(i, j);
				if (index !== BRICK_INDEX_NONE) {
					let sprite = new ECS.Sprite('', this.createBrickTexture(index));
					sprite.scale.set(TEXTURE_SCALE);
					sprite.position.x = i;
					sprite.position.y = j * 0.5;
					sprite.addTag(Tags.BRICK);
					bricks.addChild(sprite);
				}
			}
		}

		const sceneHeight = SCENE_WIDTH / (scene.app.view.width / scene.app.view.height);

		scene.assignGlobalAttribute(Attrs.SCENE_HEIGHT, sceneHeight);

		new ECS.Builder(scene)
			.anchor(0.5)
			.localPos(SCENE_WIDTH / 2, sceneHeight - 1)
			.withTag(Tags.PADDLE)
			.asSprite(this.createTexture(0, 125, 100, 25))
			.withParent(scene.stage)
			.withComponent(new PaddleKeyboardController())
			.scale(TEXTURE_SCALE)
			.build();

		new ECS.Builder(scene)
			.anchor(0.5)
			.withTag(Tags.BALL)
			.asSprite(this.createTexture(0, 100, 20, 20))
			.withParent(scene.stage)
			.withComponent(new BallController())
			.scale(TEXTURE_SCALE)
			.build();

		scene.addGlobalComponent(new BallCollisionTrigger());
		scene.addGlobalComponent(new BallCollisionResolver());
		scene.addGlobalComponent(new GameManager());
		scene.sendMessage(new ECS.Message(Messages.BALL_ATTACH));
	}

	private createBrickTexture(index: number) {
		if (index >= 0 && index <= 4) {
			return this.createTexture(100 * index, 0, 100, 50);
		} else if (index >= 5 && index <= 9) {
			return this.createTexture(100 * (index - 5), 50, 100, 50);
		} else {
			throw new Error(`Wrong brick texture index: ${index}`);
		}
	}

	private createTexture(offsetX: number, offsetY: number, width: number, height: number) {
		let texture = PIXI.Texture.from(Assets.SPRITESHEET);
		texture = texture.clone();
		texture.frame = new PIXI.Rectangle(offsetX, offsetY, width, height);
		return texture;
	}
}