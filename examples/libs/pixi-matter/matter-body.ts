import * as ECS from '../pixi-ecs';
import * as Matter from 'matter-js';

export interface MatterBodyOptions {
	fillStyle?: number;
	strokeStyle?: number;
	strokeStyleWireframe?: number;
	strokeStyleAngle?: number;
	lineWidth?: number;
	showWireframes?: boolean;
	showAngleIndicator?: boolean;
	showAxes?: boolean;
}

/**
 * Wrapper for Matter-JS bodies
 */
export class MatterBody extends ECS.Graphics {

	body: Matter.Body;
	world: Matter.World;
	options: MatterBodyOptions;

	constructor(name: string = '', body: Matter.Body, world: Matter.World, options?: MatterBodyOptions) {
		super(name);
		if (!body.parts) {
			throw new Error('Body.parts is undefined');
		}
		this.body = body;
		this.world = world;
		this.options = {
			fillStyle: (options && options.fillStyle) ? options.fillStyle : 0x1a1a0aff,
			strokeStyle: (options && options.strokeStyle) ? options.strokeStyle : 0xe9e66f,
			strokeStyleWireframe: (options && options.strokeStyleWireframe) ? options.strokeStyleWireframe : 0xacacac,
			strokeStyleAngle: (!options || !options.showAngleIndicator) ? undefined : ((options && options.strokeStyleAngle) ? options.strokeStyleAngle : 0xd54d47),
			lineWidth: (options && options.lineWidth) ? options.lineWidth : 1,
			showWireframes: (options && options.showWireframes) ? options.showWireframes : true,
			showAngleIndicator: (options && options.showAngleIndicator) ? options.showAngleIndicator : true,
			showAxes: (options && options.showAxes) ? options.showAxes : false,
		};
		this.createBodyPrimitive();

		this.addComponent(new ECS.FuncComponent('MatterSync').doOnUpdate((cmp, delta, absolute) => {
			// synchronize position and rotation
			if (!this.body.isStatic) {
				// static bodies have rotation hardcoded in their vertices
				this.rotation = this.body.angle;
			}
			this.position.x = this.body.position.x;
			this.position.y = this.body.position.y;
		}));
	}

	// render body
	protected createBodyPrimitive() {
		let fillStyle = this.options.fillStyle,
			strokeStyle = this.options.strokeStyle,
			strokeStyleAngle = this.options.strokeStyleAngle,
			strokeStyleWireframe = this.options.strokeStyleWireframe,
			part;


		// clear the primitive
		this.clear();

		// handle compound parts
		for (let k = this.body.parts.length > 1 ? 1 : 0; k < this.body.parts.length; k++) {
			part = this.body.parts[k];
			if (!this.options.showWireframes) {
				this.beginFill(fillStyle, 1);
				this.lineStyle(this.options.lineWidth, strokeStyle, 1);
			} else {
				this.lineStyle(this.options.lineWidth, strokeStyleWireframe, 1);
			}
			this.moveTo(part.vertices[0].x - this.body.position.x, part.vertices[0].y - this.body.position.y);

			for (let j = 1; j < part.vertices.length; j++) {
				this.lineTo(part.vertices[j].x - this.body.position.x, part.vertices[j].y - this.body.position.y);
			}

			this.lineTo(part.vertices[0].x - this.body.position.x, part.vertices[0].y - this.body.position.y);

			this.endFill();

			// angle indicator
			if (this.options.showAngleIndicator || this.options.showAxes) {
				this.beginFill(0, 0);
				this.lineStyle(1, strokeStyleAngle, 1);
				this.moveTo(part.position.x - this.body.position.x, part.position.y - this.body.position.y);
				this.lineTo(((part.vertices[0].x + part.vertices[part.vertices.length - 1].x) / 2 - this.body.position.x),
					((part.vertices[0].y + part.vertices[part.vertices.length - 1].y) / 2 - this.body.position.y));

				this.endFill();
			}
		}
	}
}
