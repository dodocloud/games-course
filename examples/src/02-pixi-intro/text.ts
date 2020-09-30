import * as PIXI from 'pixi.js';

export class TextExample extends PIXI.Application {

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
        // TODO put your code here
        // 1) define PIXI.TextStyle
        // 2) create PIXI.Text object
        // 3) add the text to the stage
        // 4) in update method, animate the text from left to right
    }

    update(deltaTime: number) {
        // TODO put your code here
    }
}

new TextExample(<HTMLCanvasElement>document.getElementById('gameCanvas'));