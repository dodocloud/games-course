import * as Matter from 'matter-js';
import * as ECS from '../../libs/pixi-ecs';
import * as PixiMatter from '../../libs/pixi-matter';
import { ECSExample } from '../utils/APHExample';

type PlatformProps = {
	shift: number,
	platformHeight: number
}

class PlatformComponent extends ECS.Component<PlatformProps> {

	onUpdate(delta: number, absolute: number) {
		let ownerMatter = this.owner as PixiMatter.MatterBody;

		if (ownerMatter.body.position.y - 1 >= -this.props.platformHeight) {
			Matter.Body.setPosition(ownerMatter.body, {
				x: ownerMatter.body.position.x,
				y: ownerMatter.body.position.y - 1
			})
		} else {
			Matter.Body.setPosition(ownerMatter.body, {
				x: ownerMatter.body.position.x,
				y: ownerMatter.body.position.y + this.props.shift
			});
		}

	}
}

class CubeController extends ECS.Component {
	onUpdate(delta: number, absolute: number) {
		let cmp = this.scene.stage
			.findComponentByName<ECS.KeyInputComponent>(ECS.KeyInputComponent.name);

		const ownerMatter = this.owner as PixiMatter.MatterBody;

		if (cmp.isKeyPressed(ECS.Keys.KEY_LEFT)) {
			Matter.Body.applyForce(ownerMatter.body,
				{ x: ownerMatter.position.x, y: ownerMatter.body.position.y },
				{ x: -0.03, y: 0.0 }
			)
		} else if (cmp.isKeyPressed(ECS.Keys.KEY_RIGHT)) {
			Matter.Body.applyForce(ownerMatter.body,
				{ x: ownerMatter.position.x, y: ownerMatter.body.position.y },
				{ x: 0.03, y: 0.0 }
			)
		}
	}
}

export class MatterBinding extends ECSExample {

	load() {

		const binder = new PixiMatter.MatterBind();
		binder.init(this.engine.scene, {
			mouseControl: false,
			renderConstraints: false,
			renderAngles: false,
		});

		const sWidth = this.engine.scene.app.screen.width;
		const sHeight = this.engine.scene.app.screen.height;

		const spacingX = sWidth * 0.3;
		const spacingY = sHeight * 0.25;

		const platformWidth = sWidth - spacingX;
		const platformHeight = sHeight * 0.1;
		const platformNum = Math.ceil(sHeight / (platformHeight + spacingY)) + 1;

		for (let i = 0; i < platformNum; i++) {
			const x = ((i % 2 == 0) ? spacingX : 0) + platformWidth / 2;
			const y = (platformHeight + spacingY) * i + platformHeight / 2;

			const body = binder.addBody(Matter.Bodies.rectangle(
				x, y, platformWidth, platformHeight, { isStatic: true }
			));
			const shift = (platformHeight + spacingY) * platformNum;
			body.addComponent(new PlatformComponent({ shift, platformHeight }))
		}

		const wallWidth = 50;

		binder.addBody(Matter.Bodies.rectangle(
			-wallWidth / 2, sHeight / 2, wallWidth, sHeight * 2, { isStatic: true }
		))
		binder.addBody(Matter.Bodies.rectangle(
			sWidth + wallWidth / 2, sHeight / 2, wallWidth, sHeight * 2, { isStatic: true }
		))


		const cubeSize = Math.min(spacingX * 0.75, spacingY * 0.75);
		const cube = binder.addBody(Matter.Bodies.rectangle(
			cubeSize / 2, spacingY + cubeSize / 2, cubeSize, cubeSize,
		));
		cube.addComponent(new CubeController());

		this.engine.scene.stage.addComponent(new ECS.KeyInputComponent());
	}
}