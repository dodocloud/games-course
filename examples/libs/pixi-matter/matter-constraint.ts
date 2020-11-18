import * as ECS from '../pixi-ecs';
import * as Matter from 'matter-js';

/**
 * Options for MatterConstraint object
 */
export class MatterConstraintOptions {
	strokeStyle: string = '0x00FF00';
	lineWidth: number = 1;
}

/**
 * Wrapper for Matter-JS constraints
 */
export class MatterConstraint extends ECS.Graphics {

	constraint: Matter.Constraint;
	world: Matter.World;
	options?: MatterConstraintOptions;

	constructor(name: string = '', constraint: Matter.Constraint, world: Matter.World, options?: MatterConstraintOptions) {
		super(name);
		this.constraint = constraint;
		this.world = world;
		this.options = options || new MatterConstraintOptions();
		this.renderPrimitive();

		this.addComponent(new ECS.FuncComponent('MatterSync').doOnUpdate((cmp, delta, absolute) => {
			this.renderPrimitive(); // re-render at each udpate
		}));

	}

	// render constraint
	protected renderPrimitive() {
		let strokeStyle = PIXI.utils.string2hex(this.options.strokeStyle);


		// clear the primitive
		this.clear();

		let bodyA = this.constraint.bodyA,
			bodyB = this.constraint.bodyB,
			pointA = this.constraint.pointA,
			pointB = this.constraint.pointB;

		// render the constraint on every update, since they can change dynamically
		this.beginFill(0, 0);
		this.lineStyle(this.options.lineWidth, strokeStyle, 1);

		if (bodyA) {
			this.moveTo(bodyA.position.x + pointA.x, bodyA.position.y + pointA.y);
		} else {
			this.moveTo(pointA.x, pointA.y);
		}

		if (bodyB) {
			this.lineTo(bodyB.position.x + pointB.x, bodyB.position.y + pointB.y);
		} else if (pointB) {
			this.lineTo(pointB.x, pointB.y);
		}

		this.endFill();
	}
}
