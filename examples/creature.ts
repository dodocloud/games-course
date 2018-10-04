import * as PIXI from 'pixi.js'

export default class PixiBoot extends PIXI.Application
{
    creature:PIXI.Sprite;

	constructor()
	{
		super({
			view: <HTMLCanvasElement>document.getElementById('gameCanvas'),
			backgroundColor: 0x000000,
			width: 800,
			height: 800
		});

		document.body.appendChild(this.view);

		this.creature = PIXI.Sprite.fromImage('creature.png');
        this.creature.anchor.set(0.5);
		this.creature.x = this.screen.width / 2;
		this.creature.y = this.screen.height / 2;
		this.stage.addChild(this.creature);
		this.ticker.add((deltaTime) => this.update(deltaTime));
	}

	update(deltaTime:number)
	{
        this.creature.rotation += 0.01 * deltaTime;
	}
}

new PixiBoot();