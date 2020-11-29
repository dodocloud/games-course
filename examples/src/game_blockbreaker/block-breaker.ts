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

enum Tags {
	BRICK = 'brick',
	BALL = 'ball',
	PADDLE = 'paddle'
}

enum Attrs {
	VELOCITY = 'velocity',
	SCENE_HEIGHT = 'scene_height'
}

const releaseSpeed = 0.1;

class CollisionHandler extends ECS.Component {
	
	onUpdate(delta: number, absolute: number) {
		const ball = this.scene.findObjectByTag(Tags.BALL);
		const bricks = this.scene.findObjectsByTag(Tags.BRICK);
		const paddle = this.scene.findObjectByTag(Tags.PADDLE);

		const colliders = [...bricks, paddle];
		const ballBox = ball.getBounds();
		const velocity = ball.getAttribute<ECS.Vector>(Attrs.VELOCITY);

		for(let collider of colliders) {
			const cBox = collider.getBounds();
			const horizIntersection = this.horizIntersection(ballBox, cBox);
			const vertIntersection = this.vertIntersection(ballBox, cBox);

			const collides = horizIntersection > 0 && vertIntersection > 0;
			
			if(collides) {
				let newVelocity: ECS.Vector;

				if(collider.hasTag(Tags.BRICK)) {
					if(horizIntersection < vertIntersection) {
						newVelocity = new ECS.Vector(-velocity.x, velocity.y);
					} else {
						newVelocity = new ECS.Vector(velocity.x, -velocity.y);
					}
				} else if(collider.hasTag(Tags.PADDLE)) {
					const magnitude = velocity.magnitude();
					if((ballBox.left + ballBox.width / 2) > (cBox.left + cBox.width / 2)) {
						newVelocity = new ECS.Vector(velocity.x + magnitude / 5, -velocity.y).normalize().multiply(magnitude);
					} else {
						newVelocity = new ECS.Vector(velocity.x - magnitude / 5, -velocity.y).normalize().multiply(magnitude);
					}
				}

				ball.assignAttribute(Attrs.VELOCITY, newVelocity);
				
				if(collider.hasTag(Tags.BRICK)) {
					collider.destroy();
				}
				break;
			}

		}
	}

	private horizIntersection(boundsA: PIXI.Rectangle, boundsB: PIXI.Rectangle) {
		return Math.min(boundsA.right, boundsB.right) - Math.max(boundsA.left, boundsB.left);
	}

	private vertIntersection(boundsA: PIXI.Rectangle, boundsB: PIXI.Rectangle) {
		return Math.min(boundsA.bottom, boundsB.bottom) - Math.max(boundsA.top, boundsB.top);
	}
}

class BallController extends ECS.Component {
	paddle: ECS.Container;
	lastAttachPositionX: number;

	get velocity() {
		return this.owner.getAttribute<ECS.Vector>(Attrs.VELOCITY);
	}

	set velocity(velocity: ECS.Vector) {
		this.owner.assignAttribute(Attrs.VELOCITY, velocity);
	}
	
	onInit() {
		this.subscribe(Messages.BALL_ATTACH, Messages.BALL_RELEASE);
		this.paddle = this.scene.findObjectByTag(Tags.PADDLE);
		this.velocity = new ECS.Vector(0);
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
		const diffY = -releaseSpeed;
		this.velocity = new ECS.Vector(diffX / 2, diffY).normalize().multiply(releaseSpeed);
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
		if (bounds.top > this.scene.getGlobalAttribute<number>(Attrs.VELOCITY)) {
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
				sprite.addTag(Tags.BRICK);
				bricks.addChild(sprite);
			}
		}

		const sceneHeight = SCENE_WIDTH / (this.engine.app.view.width / this.engine.app.view.height);

		scene.assignGlobalAttribute(Attrs.SCENE_HEIGHT, sceneHeight);

		new ECS.Builder(this.engine.scene)
			.anchor(0.5)
			.localPos(SCENE_WIDTH / 2, sceneHeight - 1)
			.withTag(Tags.PADDLE)
			.asSprite(this.createTexture(0, 125, 100, 25))
			.withParent(scene.stage)
			.withComponent(new PaddleController())
			.scale(TEXTURE_SCALE)
			.build();

		new ECS.Builder(this.engine.scene)
			.anchor(0.5)
			.withTag(Tags.BALL)
			.asSprite(this.createTexture(0, 100, 20, 20))
			.withParent(scene.stage)
			.withComponent(new BallController())
			.scale(TEXTURE_SCALE)
			.build();

		scene.addGlobalComponent(new CollisionHandler());
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