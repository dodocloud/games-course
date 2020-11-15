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
	acceleration: ECS.Vector;
}

type IntegrationComponentState = IntegrationComponentProps & {
	position: ECS.Vector;
}

/**
 * Component for numeric integration
 */
abstract class IntegrationBase extends ECS.Component<IntegrationComponentProps> {
	state: IntegrationComponentState;
	positionMemory: ECS.Vector[] = [];

	onInit() {
		this.state = {
			...this.props,
			color: this.props.color || 0xFFFFFF,
			position: new ECS.Vector(this.owner.position.x, this.owner.position.y)
		}
	}

	onFixedUpdate(delta: number, absolute: number) {
		this.updateDynamics(delta * 0.003); // downscale time unit a bit
		this.owner.position.set(this.state.position.x, this.state.position.y);

		const color = typeof(this.state.color) === 'number' ? this.state.color
			: PIXI.utils.string2hex(this.state.color);

		let gr = this.owner.asGraphics();
		gr.clear();
		gr.beginFill(color);
		gr.drawCircle(0, 0, 5);
		gr.lineStyle(1, color);
		gr.lineTo(this.state.velocity.x, this.state.velocity.y);
		gr.endFill();
		gr.lineStyle(1, PIXI.utils.string2hex(colors.rhino40));
		// draw history of last X steps
		const lastSteps = this.fixedFrequency;
		for(let i = this.positionMemory.length - 1; 
			i>= Math.max(this.positionMemory.length - 1 - lastSteps, 0); i--) {
			const val = this.positionMemory[i];
			gr.lineTo(val.x - this.owner.position.x, val.y - this.owner.position.y);
		}
		

		this.positionMemory.push(new ECS.Vector(gr.position.x, gr.position.y));

		// check borders ( *3 is for keeping the curve displayed for a while)
		if (this.owner.getBounds().bottom >= this.scene.app.screen.height * 3) { 
			this.owner.destroy();
			this.finish();
		}
	}

	abstract updateDynamics(delta: number);
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
		this.state.position = this.state.position.add(previousVelocity.add(this.state.velocity)
		.multiply(0.5 * deltaSec));
	}
}

class EulerImplicit extends IntegrationBase {
	updateDynamics(deltaSec: number) {
		this.state.velocity = this.state.velocity.add(this.state.acceleration.multiply(deltaSec));
		this.state.position = this.state.position.add(this.state.velocity.multiply(deltaSec));
	}
}


class EmitterComponent extends ECS.Component {

	particleFreq: number;

	constructor(frequency: number) {
		super();
		this.fixedFrequency = 0.5;
		this.particleFreq = frequency;
	}

	onFixedUpdate(delta: number, absolute: number) {
		this.createProjectile(colors.lemon, 1.0, IntegrationType.EULER_EXPLICIT);
		this.createProjectile(colors.royal, 1.0, IntegrationType.EULER_IMPROVED);
		this.createProjectile(colors.tomatoLight, 1.0, IntegrationType.EULER_IMPLICIT);
	}

	private createProjectile(color: number | string, alpha: number, type: IntegrationType) {
		// initial velocity
		let velX = Math.sqrt(this.scene.app.screen.width) * Math.cos(this.owner.rotation) * 4;
		let velY = Math.sqrt(this.scene.app.screen.width) * Math.sin(this.owner.rotation) * 4;
		let velocity = new ECS.Vector(velX, velY);
		let acceleration = new ECS.Vector(0, 0.75 * Math.sqrt(this.scene.app.screen.height));

		let projectile = new ECS.Graphics();
		projectile.pivot.set(1, 1);
		projectile.alpha = alpha;

		let component: ECS.Component<IntegrationComponentProps>;

		switch (type) {
			case IntegrationType.EULER_EXPLICIT: component = new EulerExplicit({color, velocity, acceleration});
				break;
			case IntegrationType.EULER_IMPLICIT: component = new EulerImplicit({color, velocity, acceleration});
				break;
			case IntegrationType.EULER_IMPROVED: component = new EulerImproved({color, velocity, acceleration});
				break;
		}

		component.fixedFrequency = this.particleFreq;

		new ECS.Builder(this.scene)
			.localPos(this.owner.position.x, this.owner.position.y)
			.withComponent(component)
			.withParent(this.scene.stage)
			.buildInto(projectile);
	}
}

export type MissileConfig = ECS.EngineConfig & {
	frequency: number;
}

export class Missile extends ECSExample {

	constructor(config?: MissileConfig) {
		super(config);
	}

	load() {
		const updateFrequency = (this.engine.config as MissileConfig).frequency;
		let emitter = new ECS.Graphics();
		emitter.beginFill(PIXI.utils.string2hex(colors.rhino80));
		emitter.drawPolygon([0, 0, 40, 0, 40, 20, 0, 20, 0, 0]);
		emitter.endFill();
		emitter.pivot.set(emitter.width / 2, emitter.height / 2);
		emitter.position.set(this.engine.scene.app.screen.width * 0.03, this.engine.scene.app.screen.height * 0.9);
		emitter.rotation = -Math.PI / 3;
		emitter.addComponent(new EmitterComponent(updateFrequency));
		this.engine.scene.stage.addChild(emitter);
	}
}
