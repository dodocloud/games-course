import * as PIXI from 'pixi.js';

export class PrimitivesExample extends PIXI.Application {

	constructor(view: HTMLCanvasElement) {
		super({
            view,
			backgroundColor: 0x000000,
			width: view.clientWidth,
			height: view.clientHeight,
		});

		this.init();
	}

	init() {
        // TODO put your code here - create PIXI.Graphics()
        // don't forget to add the root object to this.stage 
	}
}

new PrimitivesExample(<HTMLCanvasElement>document.getElementById('gameCanvas'));