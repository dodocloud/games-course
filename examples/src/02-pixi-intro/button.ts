import * as PIXI from 'pixi.js';


export class ButtonExample extends PIXI.Application {
	private sonic: PIXI.Sprite;
	private animRunning = false;

	constructor(view: HTMLCanvasElement) {
		super({
			view,
			backgroundColor: 0x000000,
			width: view.clientWidth,
			height: view.clientHeight,
		});

		this.init();
		this.ticker.add(deltaTime => this.update(deltaTime));
	}

	init() {
		let texture = PIXI.Texture.from('./assets/02-pixi-intro/sonic.png');
		this.sonic = new PIXI.Sprite(texture); // or PIXI.Sprite.from(<url>)
		this.sonic.position.set(this.screen.width / 2, this.screen.height / 2);
		this.sonic.anchor.set(0.5);


		// TODO put your code here
		// 1) If you click on the sprite, the animation will stop
		// 2) If you click twice, the animation will resume
		this.stage.addChild(this.sonic);
	}

	update(deltaTime: number) {
		if (this.animRunning) {
			this.sonic.rotation += deltaTime * 0.01;
		}
	}
}


new ButtonExample(<HTMLCanvasElement>document.getElementById('gameCanvas'));