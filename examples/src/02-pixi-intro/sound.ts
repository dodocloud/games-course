import * as PIXI from 'pixi.js';
import PIXISound from 'pixi-sound';
import { PIXIExample } from '../utils/APHExample';
export class Sound extends PIXIExample {
	
	sonic: PIXI.Sprite;
	
	load() {
		// TODO put your code here
		// 1) load assets/02-pixi-intro-sonic.png
		// 2) upon click, play this sound: ./assets/02-pixi-intro/sound.mp3
	}

	update() {
		// no-op
	}
}