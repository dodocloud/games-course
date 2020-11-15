
import * as ECS from '../../libs/pixi-ecs';
import { ECSExample } from '../utils/APHExample';
import { KeyInputComponent } from '../../libs/pixi-ecs/components/key-input-component';

/**
 * Controls:
 * Q: will reverse the direction of all entities
 * W: will stop/resume the scene
 * E: will emit a new object (square/circle)
 * click on an item will make all other items of the same type take a color of the clicked one
 */

enum Attributes {
	SCENE_STATE = 'SCENE_STATE'
}

interface SceneState {
	isRunning: boolean
}

enum Direction {
	LEFT = 0, RIGHT = 1, UP = 2, DOWN = 3
}

enum Messages {
	SCENE_PAUSE = 'SCENE_PAUSE',
	SCENE_RESUME = 'SCENE_RESUME',
	CHANGE_DIRECTION = 'CHANGE_DIRECTION',
	CHANGE_COLOR = 'CHANGE_COLOR'
}

/**
 * Properties for EntityBehavior
 */
interface EntityProps {
	dir: Direction,
	running: boolean
}

// just for consistency
interface EntityState extends EntityProps {

}

class EntityBehavior extends ECS.Component<EntityProps> {

	// state is of the sam
	state: EntityState = {
		dir: Direction.LEFT,
		running: true
	}

	private modifyState(obj) {
		this.state = {
			...this.state,
			...obj
		}
	}

	onInit() {
		this.modifyState({
			dir: this.props.dir,
			running: this.props.running
		});

		this.subscribe(Messages.SCENE_PAUSE, Messages.SCENE_RESUME,
			Messages.CHANGE_DIRECTION, Messages.CHANGE_COLOR);

		this.owner.interactive = true;
		this.owner.on('click', () => {

			// get tag of the owner
			let tagToFind: string;
			if (this.owner.hasTag('SQUARE')) {
				tagToFind = 'SQUARE';
			} else if (this.owner.hasTag('CIRCLE')) {
				tagToFind = 'CIRCLE';
			}

			this.sendMessage(Messages.CHANGE_COLOR, this.owner.asGraphics().tint, [tagToFind]);
		});
	}

	onRemove() {
		this.owner.removeAllListeners();
	}

	onMessage(msg: ECS.Message) {
		if (msg.action === Messages.SCENE_PAUSE) {
			this.modifyState({
				running: false
			});
		} else if (msg.action === Messages.SCENE_RESUME) {
			this.modifyState({
				running: true
			});
		} else if (msg.action === Messages.CHANGE_DIRECTION) {
			let newDir: Direction;
			switch (this.state.dir) {
				case Direction.LEFT:
					newDir = Direction.RIGHT;
					break;
				case Direction.RIGHT:
					newDir = Direction.LEFT;
					break;
				case Direction.UP:
					newDir = Direction.DOWN;
					break;
				case Direction.DOWN:
					newDir = Direction.UP;
					break;
			}
			this.modifyState({
				dir: newDir
			});
		} else if (msg.action === Messages.CHANGE_COLOR) {
			const tint: number = msg.data;
			this.owner.asGraphics().tint = tint;
		}
	}

	onUpdate(delta: number, absolute: number) {

		if (!this.state.running) {
			return;
		}

		const dir = this.state.dir;
		const pos = this.owner.position;
		const scrWidth = this.scene.app.screen.width;
		const scrHeight = this.scene.app.screen.height;
		const boundRect = this.owner.getBounds();
		const diff = delta * 0.04;
		let newDir = dir;

		switch (dir) {
			case Direction.LEFT:
				pos.x -= diff;
				if (boundRect.left <= 0) {
					newDir = Direction.RIGHT;
				}
				break;
			case Direction.RIGHT:
				pos.x += diff;
				if (boundRect.right >= scrWidth) {
					newDir = Direction.LEFT;
				}
				break;
			case Direction.DOWN:
				pos.y += diff;
				if (boundRect.bottom >= scrHeight) {
					newDir = Direction.UP;
				}
				break;
			case Direction.UP:
				pos.y -= diff;
				if (boundRect.top <= 0) {
					newDir = Direction.DOWN;
				}
				break;
		}

		if (dir !== newDir) {
			this.modifyState({
				dir: newDir
			});
		}
	}
}

// factory for new objects
const objectEmitter = (scene: ECS.Scene): ECS.Graphics => {
	const obj = new ECS.Graphics();
	const randomColor = (Math.floor(Math.random() * 0xFF) << 16) +
		(Math.floor(Math.random() * 0xFF) << 8) + Math.floor(Math.random() * 0xFF);
	const size = 40;

	const randomPosX = Math.random() * (scene.app.screen.width - size);
	const randomPosY = Math.random() * (scene.app.screen.height - size);

	obj.beginFill(0xFFFFFF);
	obj.tint = randomColor;

	// 50% chance for each type
	if (Math.random() > 0.5) {
		obj.drawRect(0, 0, size, size);
		obj.name = 'SQUARE';
		obj.addTag('SQUARE');
	} else {
		obj.drawCircle(0, 0, size / 2);
		obj.name = 'CIRCLE';
		obj.addTag('CIRCLE');
	}

	obj.endFill();
	obj.position.set(randomPosX, randomPosY);

	let randomDir: Direction = Math.floor(Math.random() * 4);

	obj.addComponent(new EntityBehavior({
		dir: randomDir,
		running: scene.getGlobalAttribute<SceneState>(Attributes.SCENE_STATE).isRunning
	}));

	return obj;
};

class SceneManager extends ECS.Component {

	keyInput: ECS.KeyInputComponent;

	onInit() {
		this.keyInput = this.scene.findGlobalComponentByName(ECS.KeyInputComponent.name);
		// emit 3 objects
		this.emitObject();
		this.emitObject();
		this.emitObject();
	}

	onUpdate() {
		if (this.keyInput.isKeyPressed(ECS.Keys.KEY_Q)) {
			this.keyInput.handleKey(ECS.Keys.KEY_Q);
			this.changeDirection();
		}

		if (this.keyInput.isKeyPressed(ECS.Keys.KEY_W)) {
			this.keyInput.handleKey(ECS.Keys.KEY_W);

			const sceneState = this.scene.getGlobalAttribute<SceneState>(Attributes.SCENE_STATE);
			let isRunning: boolean;
			if (sceneState.isRunning) {
				isRunning = false;
				this.pauseScene();
			} else {
				isRunning = true;
				this.resumeScene();
			}

			this.scene.assignGlobalAttribute(Attributes.SCENE_STATE, {
				...sceneState,
				isRunning: isRunning
			});
		}

		if (this.keyInput.isKeyPressed(ECS.Keys.KEY_E)) {
			this.keyInput.handleKey(ECS.Keys.KEY_E);
			this.emitObject();
		}
	}

	emitObject() {
		const newObj = objectEmitter(this.scene);
		this.scene.stage.addChild(newObj);
	}

	changeDirection() {
		this.sendMessage(Messages.CHANGE_DIRECTION);
	}

	pauseScene() {
		this.sendMessage(Messages.SCENE_PAUSE);
	}

	resumeScene() {
		this.sendMessage(Messages.SCENE_RESUME);
	}
}

export class Graphics extends ECSExample {
	load() {
		this.engine.scene.assignGlobalAttribute(Attributes.SCENE_STATE, {
			isRunning: true
		} as SceneState);

		this.engine.scene.addGlobalComponent(new KeyInputComponent());
		this.engine.scene.addGlobalComponent(new SceneManager());
	}
}