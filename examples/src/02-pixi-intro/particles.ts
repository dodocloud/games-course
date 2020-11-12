import * as PIXI from 'pixi.js';
import { PIXIExample } from '../utils/APHExample';

export class Particles extends PIXIExample {
	container: PIXI.ParticleContainer;

	private static particlesNum = 250;

	load() {
        // TODO put your code here
        // 1) create PIXI.ParticleContainer
        // 2) load assets/02-pixi-intro/ghost.png
        // 3) create ~200 random particles
        // 4) in the update loop, rotate the particles
	}

	update(delta: number) {
		// TODO put your code here
	}
}