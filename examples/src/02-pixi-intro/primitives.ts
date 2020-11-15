import * as PIXI from 'pixi.js';
import { PIXIExample } from '../utils/APHExample';
export class Primitives extends PIXIExample {

	load() {
		const graphics = new PIXI.Graphics();
		graphics.beginFill(0x222222);
		graphics.drawRect(100, 150, 600, 250);

		const circles = new PIXI.Graphics();

		circles.lineStyle(1, 0xFFFFDD);
		circles.drawCircle(250, 275, 90);
		circles.drawCircle(250, 275, 70);
		circles.beginFill(0xFFFFDD);
		circles.drawCircle(250, 275, 50);
		circles.endFill();

		graphics.addChild(circles);

		const circles2 = circles.clone();
		circles2.position.set(300, 0);
		graphics.addChild(circles2);

		graphics.lineStyle(1, 0xFFFFDD);
		graphics.moveTo(250 + 90, 275).lineTo(550 - 90, 275);

		this.app.stage.addChild(graphics);
	}

	update() {
		// no-op
	}
}