import * as PIXI from 'pixi.js';
import { PIXIExample, getBaseUrl } from '../utils/APHExample';

export class Particles extends PIXIExample {
	container: PIXI.ParticleContainer;

	private static particlesNum = 250;

	load() {
		this.container = new PIXI.ParticleContainer(Particles.particlesNum, {
			position: true,
			rotation: true,
		});
		
		let texture = PIXI.Texture.from(`${getBaseUrl()}/assets/02-pixi-intro/ghost.png`);

		for(let i=0; i< Particles.particlesNum; i++) {
			let particle = new PIXI.Sprite(texture);
			particle.position.set(Math.random() * this.app.screen.width, 
			Math.random() * this.app.screen.height);
			particle.anchor.set(0.5);
			particle.rotation = Math.random() * Math.PI;
			particle.scale.set(0.25);
			this.container.addChild(particle);
		}

		this.app.stage.addChild(this.container);
	}

	update(delta: number) {
		for(let child of this.container.children) {
			child.rotation += 0.1 * delta;
		}
	}
}