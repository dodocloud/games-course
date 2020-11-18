import * as ECS from '../../libs/pixi-ecs';

const SCENE_WIDTH = 16;

const TEXTURE_SCALE = SCENE_WIDTH / (100 * 16);

enum Messages {
	BALL_ATTACH = 'BALL_ATTACH',
	BALL_RELEASE = 'BALL_RELEASE'
}

enum BallStates {
	ATTACHED = 1,
	RELEASED = 2
}

const releaseSpeed = 0.1;
class BallController extends ECS.Component {
	paddle: ECS.Container;
	velocity: ECS.Vector;
	lastAttachPositionX: number;

	onInit() {
		this.subscribe(Messages.BALL_ATTACH, Messages.BALL_RELEASE);
		this.paddle = this.scene.findObjectByName('paddle');
	}

	onMessage(msg: ECS.Message) {
		if (msg.action === Messages.BALL_ATTACH) {
			if (this.owner.stateId !== BallStates.ATTACHED) {
				this.attachBall();
			}
		} else if (msg.action === Messages.BALL_RELEASE) {
			if (this.owner.stateId !== BallStates.RELEASED) {
				this.releaseBall();
			}
		}
	}

	attachBall() {
		this.owner.stateId = BallStates.ATTACHED;
		this.updateBallAttached();
	}

	releaseBall() {
		this.owner.stateId = BallStates.RELEASED;
		const diffX = this.owner.position.x - this.lastAttachPositionX;
		this.velocity = new ECS.Vector(diffX, -releaseSpeed);
		this.lastAttachPositionX = null;
	}

	updateBallAttached() {
		const paddleBound = this.paddle.getBounds();
		const ballBound = this.owner.getBounds();
		const diffX = paddleBound.left - ballBound.left + paddleBound.width / 2 - ballBound.width / 2;
		const diffY = paddleBound.top - ballBound.bottom;

		this.lastAttachPositionX = this.owner.position.x;
		this.owner.position.x += diffX;
		this.owner.position.y += diffY;
	}

	updateBallMovement(delta: number) {
		this.owner.position.x += delta * this.velocity.x * 0.04;
		this.owner.position.y += delta * this.velocity.y * 0.04;

		const bounds = this.owner.getBounds();
		if (bounds.right < 0) {
			this.velocity = new ECS.Vector(-this.velocity.x, this.velocity.y);
		}
		if (bounds.left > SCENE_WIDTH) {
			this.velocity = new ECS.Vector(-this.velocity.x, this.velocity.y);
		}
		if (bounds.top < 0) {
			this.velocity = new ECS.Vector(this.velocity.x, -this.velocity.y);
		}
		if (bounds.top > this.scene.getGlobalAttribute<number>('SCENE_HEIGHT')) {
			this.attachBall();
		}
	}

	onUpdate(delta: number, absolute: number) {
		switch (this.owner.stateId) {
			case BallStates.ATTACHED:
				this.updateBallAttached();
				break;
			case BallStates.RELEASED:
				this.updateBallMovement(delta);
				break;
		}
	}
}

class PaddleController extends ECS.Component {
	moveLeft(units: number) {
		const bbox = this.owner.getBounds();
		if (bbox.left >= 0) {
			this.owner.position.x -= Math.min(units, bbox.left);
		}
	}

	moveRight(units: number) {
		const bbox = this.owner.getBounds();
		if (bbox.right <= SCENE_WIDTH) {
			this.owner.position.x += Math.min(units, SCENE_WIDTH - bbox.right);
		}
	}

	onUpdate(delta: number, absolute: number) {
		const keyInputCmp = this.scene.findGlobalComponentByName<ECS.KeyInputComponent>(ECS.KeyInputComponent.name);

		if (keyInputCmp.isKeyPressed(ECS.Keys.KEY_LEFT)) {
			this.moveLeft(delta * 0.01);
		}
		if (keyInputCmp.isKeyPressed(ECS.Keys.KEY_RIGHT)) {
			this.moveRight(delta * 0.01);
		}
		if (keyInputCmp.isKeyPressed(ECS.Keys.KEY_SPACE)) {
			keyInputCmp.handleKey(ECS.Keys.KEY_SPACE);
			this.sendMessage(Messages.BALL_RELEASE);
		}
	}
}

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
			.add('spritesheet', './assets/game_blockbreaker/spritesheet.png')
			.load(() => this.load())
	}

	load() {
		const scene = this.engine.scene;
		let bricks = new ECS.Container('bricksLayer');
		scene.stage.addChild(bricks);
		scene.addGlobalComponent(new ECS.KeyInputComponent());

		for (let i = 0; i < SCENE_WIDTH; i++) {
			for (let j = 0; j < 5; j++) {
				let sprite = new ECS.Sprite('', this.createTexture(100, 0, 100, 50));
				sprite.scale.set(TEXTURE_SCALE);
				sprite.position.x = i;
				sprite.position.y = j * 0.5;
				bricks.addChild(sprite);
			}
		}

		const sceneHeight = SCENE_WIDTH / (this.engine.app.view.width / this.engine.app.view.height);

		scene.assignGlobalAttribute('SCENE_HEIGHT', sceneHeight);

		new ECS.Builder(this.engine.scene)
			.anchor(0.5)
			.localPos(SCENE_WIDTH / 2, sceneHeight - 1)
			.withName('paddle')
			.asSprite(this.createTexture(0, 125, 100, 25))
			.withParent(scene.stage)
			.withComponent(new PaddleController())
			.scale(TEXTURE_SCALE)
			.build();

		new ECS.Builder(this.engine.scene)
			.anchor(0.5)
			.withName('ball')
			.asSprite(this.createTexture(0, 100, 20, 20))
			.withParent(scene.stage)
			.withComponent(new BallController())
			.scale(TEXTURE_SCALE)
			.build();

		scene.sendMessage(new ECS.Message(Messages.BALL_ATTACH));
	}

	private createTexture(offsetX: number, offsetY: number, width: number, height: number) {
		let texture = PIXI.Texture.from('spritesheet');
		texture = texture.clone();
		texture.frame = new PIXI.Rectangle(offsetX, offsetY, width, height);
		return texture;
	}
}

export default new BlockBreaker();