import * as PIXI from 'pixi.js';
import PIXISound from 'pixi-sound';

class SoundExample extends PIXI.Application {
	
	sonic: PIXI.Sprite;
	
	constructor(view: HTMLCanvasElement) {
		super({
			view,
			width: view.clientWidth,
			height: view.clientHeight,
		});

		this.init();
	}

	init() {
		// TODO put your code here
		// 1) load assets/02-pixi-intro-sonic.png
		// 2) upon click, play this sound: ./assets/02-pixi-intro/sound.mp3
	}
}


new SoundExample(<HTMLCanvasElement>document.getElementById('gameCanvas'));