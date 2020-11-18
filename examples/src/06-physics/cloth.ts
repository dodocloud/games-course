import * as ECS from '../../libs/pixi-ecs';
import { ECSExample } from '../utils/APHExample';

class Particle {
	pos: ECS.Vector;
	previousPos: ECS.Vector;

	constructor(pos: ECS.Vector) {
		this.pos = pos;
		this.previousPos = pos.clone();
	}

	draw(obj: ECS.Graphics) {
		obj.lineStyle(0);
		obj.beginFill(0xd54747);
		obj.drawCircle(this.pos.x, this.pos.y, 4);
		obj.endFill();
	}
}

interface Constraint {
	draw(obj: ECS.Graphics);
	relax();
}

class PinConstraint implements Constraint {
	particle: Particle;
	pos: ECS.Vector;

	constructor(particle: Particle, pos: ECS.Vector) {
		this.particle = particle;
		this.pos = pos;
	}

	relax() {
		this.particle.pos = this.pos.clone();
	}

	draw(obj: ECS.Graphics) {
		obj.beginFill(0xFFFFFF, 0.55);
		obj.drawCircle(this.pos.x, this.pos.y, 12);
		obj.endFill();
	}
}

class DistanceConstraint implements Constraint {
	particleA: Particle;
	particleB: Particle;
	stiffness: number;
	distance: number;

	constructor(particleA: Particle, particleB: Particle, stiffness: number) {
		this.particleA = particleA;
		this.particleB = particleB;
		this.stiffness = stiffness;
		this.distance = particleA.pos.distance(particleB.pos);
	}

	relax() {
		let direction = this.particleA.pos.subtract(this.particleB.pos);
		let mag = direction.magnitudeSquared();
		let normal = direction.multiply(((this.distance * this.distance - mag) / mag) * this.stiffness);
		this.particleA.pos = this.particleA.pos.add(normal);
		this.particleB.pos = this.particleB.pos.subtract(normal);
	}

	draw(obj: ECS.Graphics) {
		obj.lineStyle(1, 0xd54747);
		obj.moveTo(this.particleA.pos.x, this.particleA.pos.y);
		obj.lineTo(this.particleB.pos.x, this.particleB.pos.y);
		obj.endFill();
	}
}

class Cloth {
	particles: Particle[] = [];
	constraints: Constraint[] = [];
	gravity: ECS.Vector;

	constructor(gravity: ECS.Vector) {
		this.gravity = gravity;
	}

	update() {
		for (let particle of this.particles) {
			let velocity = particle.pos.subtract(particle.previousPos);
			particle.previousPos = particle.pos;
			particle.pos = particle.pos.add(this.gravity);
			particle.pos = particle.pos.add(velocity);
		}

		for (let constraint of this.constraints) {
			constraint.relax();
		}
	}

	draw(obj: ECS.Graphics) {
		for (let constraint of this.constraints) {
			constraint.draw(obj);
		}
		for (let particle of this.particles) {
			particle.draw(obj);
		}
	}
}

export class ClothView extends ECSExample {
	mouse: ECS.Vector;
	draggedEntity: Particle = null;
	cloth: Cloth;

	load() {
		this.cloth = new Cloth(new ECS.Vector(0, 0.2));

		const { width, height } = this.engine.app.screen;

		this.initCloth(new ECS.Vector(width / 2, height / 2),
			width * 2 / 3, height * 2 / 3, 9, 4, 0.1
		);
		let obj = new ECS.Graphics();
		this.engine.app.stage.addChild(obj);

		obj.addComponent(new ECS.PointerInputComponent({
			handlePointerDown: true,
			handlePointerOver: true,
			handlePointerRelease: true,
		}));

		obj.addComponent(new ECS.FuncComponent('updater')
			.doOnUpdate((cmp, delta, absolute) => {
				this.cloth.update();
				obj.clear();
				this.draw(obj);
			})
			.doOnMessage(ECS.PointerMessages.POINTER_DOWN, (cmp, msg) =>
				this.mousePressed(msg.data.mousePos.posX, msg.data.mousePos.posY)
			)
			.doOnMessage(ECS.PointerMessages.POINTER_OVER, (cmp, msg) =>
				this.mouseMoved(msg.data.mousePos.posX, msg.data.mousePos.posY)
			)
			.doOnMessage(ECS.PointerMessages.POINTER_RELEASE, (cmp, msg) =>
				this.mouseReleased()
			)
		)
	}

	draw(obj: ECS.Graphics) {
		this.cloth.draw(obj);

		let nearest = this.findNearestParticle();
		if (nearest) {
			obj.beginFill(0xACB0FA);
			obj.drawCircle(nearest.pos.x, nearest.pos.y, 8);
			obj.endFill();
		}
	}

	initCloth(origin: ECS.Vector, width: number, height: number, segments: number,
		pinMod: number, stiffness: number
	) {
		let xStep = width / segments;
		let yStep = height / segments;

		for (let y = 0; y < segments; y++) {
			for (let x = 0; x < segments; x++) {
				let px = origin.x + x * xStep - width / 2 + xStep / 2;
				let py = origin.y + y * yStep - height / 2 + yStep / 2;

				this.cloth.particles.push(new Particle(new ECS.Vector(px, py)));

				if (x > 0) {
					let particleA = this.cloth.particles[y * segments + x];
					let particleB = this.cloth.particles[y * segments + (x - 1)];

					this.cloth.constraints.push(new DistanceConstraint(
						particleA, particleB, stiffness
					));
				}

				if (y > 0) {
					let particleA = this.cloth.particles[y * segments + x];
					let particleB = this.cloth.particles[(y - 1) * segments + x];

					this.cloth.constraints.push(new DistanceConstraint(
						particleA, particleB, stiffness
					));
				}
			}
		}

		for (let x = 0; x < segments; x++) {
			if (x % pinMod === 0) {
				const particle = this.cloth.particles[x];
				this.cloth.constraints.push(new PinConstraint(particle, particle.pos));
			}
		}
	}

	findNearestParticle(): Particle {
		if (!this.mouse) {
			return null;
		}

		let selectionRadius = 40;
		let distToNearest = 0;
		let entity: Particle = null;

		for (let particle of this.cloth.particles) {
			let distToMouseSquared = particle.pos.squareDistance(this.mouse);
			if (distToMouseSquared < (selectionRadius * selectionRadius) &&
				(!entity || distToMouseSquared < distToNearest)
			) {
				entity = particle;
				distToNearest = distToMouseSquared;
			}
		}
		return entity;
	}

	mousePressed(x: number, y: number) {
		this.mouse = new ECS.Vector(x, y);
		this.draggedEntity = this.findNearestParticle();
	}

	mouseMoved(x: number, y: number) {
		this.mouse = new ECS.Vector(x, y);
		if (this.draggedEntity) {
			this.draggedEntity.pos = new ECS.Vector(x, y);
		}
	}

	mouseReleased() {
		this.draggedEntity = null;
	}
}
