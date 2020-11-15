import * as ECS from '../../libs/pixi-ecs';
import { ECSExample, getBaseUrl } from '../utils/APHExample';
import { colors } from '../utils/colors';

export enum IntegrationType {
	EULER_EXPLICIT,
	EULER_IMPROVED,
	EULER_IMPLICIT,
}

export type IntegrationComponentProps = {
	color?: number | string;
	velocity: ECS.Vector;
	origin: ECS.Vector;
}

type IntegrationComponentState = IntegrationComponentProps & {
	position: ECS.Vector;
	acceleration: ECS.Vector;
}
	
/**
* Component for numeric integration
*/
abstract class IntegrationBase extends ECS.Component<IntegrationComponentProps> {
	state: IntegrationComponentState;

	onInit() {
		this.state = {
			...this.props,
			position: new ECS.Vector(this.owner.position.x, this.owner.position.y),
			acceleration: new ECS.Vector(0),
		}
		// init position
		this.state.position = new ECS.Vector(this.owner.position.x, this.owner.position.y);
	}

	abstract updateDynamics(delta: number);

	onFixedUpdate(delta: number, absolute: number) {
		// update acceleration
		this.state.acceleration = this.state.origin.subtract(this.state.position);
		this.updateDynamics(delta * 0.001); // scale time unit a bit
		this.owner.position.set(this.state.position.x, this.state.position.y);

		const color = typeof(this.state.color) === 'number' ? this.state.color : 
			PIXI.utils.string2hex(this.state.color);

		let gr = this.owner.asGraphics();
		gr.clear();
		gr.beginFill(color);
		gr.drawCircle(0, 0, 10);
		gr.lineStyle(1, color);
		gr.lineTo(this.state.velocity.x, this.state.velocity.y);
	}
}

class EulerExplicit extends IntegrationBase {
	updateDynamics(deltaSec: number) {
		let previousVelocity = this.state.velocity.clone();
		this.state.velocity = this.state.velocity.add(this.state.acceleration.multiply(deltaSec));
		this.state.position = this.state.position.add(previousVelocity.multiply(deltaSec));
	}
}

class EulerImproved extends IntegrationBase {
	updateDynamics(deltaSec: number) {
		let previousVelocity = this.state.velocity.clone();
		this.state.velocity = this.state.velocity.add(this.state.acceleration.multiply(deltaSec));
		this.state.position = this.state.position.add(previousVelocity.add(this.state.velocity).multiply(0.5 * deltaSec));
	}
}

class EulerImplicit extends IntegrationBase {
	updateDynamics(deltaSec: number) {
		this.state.velocity = this.state.velocity.add(this.state.acceleration.multiply(deltaSec));
		this.state.position = this.state.position.add(this.state.velocity.multiply(deltaSec));
	}
}

export type RotationConfig = ECS.EngineConfig & {
	frequency: number;
}

export class Rotation extends ECSExample {
	
	constructor(config?: RotationConfig) {
		super(config);
	}

	load() {
		const { width, height } = this.engine.scene.app.screen;
		const updateFrequency = (this.engine.config as RotationConfig).frequency;
		let center = new ECS.Graphics();
		center.beginFill(0xFFFFFF);
		center.drawCircle(width / 2, height / 2, 50);
		center.endFill();

		center.lineStyle(2, 0x555555);
		center.arc(width / 2, height / 2, height / 5, 0, 2 * Math.PI, false);
		center.moveTo(width / 2 + height / 4, height / 2);
		center.arc(width / 2, height / 2, height / 4, 0, 2 * Math.PI, false);
		center.moveTo(width / 2 + height / 3, height / 2);
		center.arc(width / 2, height / 2, height / 3, 0, 2 * Math.PI, false);
		center.moveTo(width / 2 + height / 2, height / 2);
		center.arc(width / 2, height / 2, height / 2, 0, 2 * Math.PI, false);

		this.engine.scene.stage.addChild(center);

		this.createProjectile(colors.lemon, updateFrequency, IntegrationType.EULER_EXPLICIT);
		this.createProjectile(colors.royal, updateFrequency, IntegrationType.EULER_IMPROVED);
		this.createProjectile(colors.tomatoLight, updateFrequency, IntegrationType.EULER_IMPLICIT);
	}

	private createProjectile(color: string, frequency: number, type: IntegrationType) {
		// will start left from the center
		let velX = 0;
		let velY = this.engine.scene.app.screen.height * (0.5 - 1 / 3);
		let velocity = new ECS.Vector(velX, velY);
		let origin = new ECS.Vector(this.engine.scene.app.screen.width / 2, this.engine.scene.app.screen.height / 2);

		let projectile = new ECS.Graphics();
		projectile.endFill();
		projectile.pivot.set(1, 1);

		let component: ECS.Component<IntegrationComponentProps>;

		switch (type) {
			case IntegrationType.EULER_EXPLICIT: component = new EulerExplicit({ color, velocity, origin });
				break;
			case IntegrationType.EULER_IMPLICIT: component = new EulerImplicit({ color, velocity, origin });
				break;
			case IntegrationType.EULER_IMPROVED: component = new EulerImproved({ color, velocity, origin });
				break;
		}

		component.fixedFrequency = frequency;

		new ECS.Builder(this.engine.scene)
			.localPos(this.engine.scene.app.screen.width / 3, this.engine.scene.app.screen.height / 2)
			.withComponent(component)
			.withParent(this.engine.scene.stage)
			.buildInto(projectile);
	}
}
