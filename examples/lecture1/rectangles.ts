import * as PIXI from 'pixi.js'

export default class PixiBoot extends PIXI.Application
{
    rectangle1:PIXI.Graphics;

	constructor()
	{
		super({
			view: <HTMLCanvasElement>document.getElementById('gameCanvas'),
			backgroundColor: 0x000000,
			width: 600,
			height: 600
		});

		document.body.appendChild(this.view);

        this.rectangle1 = new PIXI.Graphics();
        this.rectangle1.beginFill(0xFFFF00);
        this.rectangle1.drawRect(0,0,200,200);
        this.rectangle1.position.x = 200;
        this.rectangle1.position.y = 200;
        this.rectangle1.pivot.set(100,100);
        this.rectangle1.endFill();

        let rectangle2 = new PIXI.Graphics();
        rectangle2.beginFill(0x00FFFF);
        rectangle2.drawRect(0,0,100,100);
        rectangle2.position.x = this.rectangle1.width;
        rectangle2.position.y = this.rectangle1.height;
        rectangle2.endFill();
        this.rectangle1.addChild(rectangle2);

        let rectangle3 = new PIXI.Graphics();
        rectangle3.beginFill(0xFF00FF);
        rectangle3.drawRect(0,0,50,50);
        rectangle3.position.x = rectangle2.width;
        rectangle3.position.y = rectangle2.height;
        rectangle3.endFill();
        rectangle2.addChild(rectangle3);

        
        
        this.stage.addChild(this.rectangle1);
        
		this.ticker.add((deltaTime) => this.update(deltaTime));
	}

	update(deltaTime:number)
	{
        this.rectangle1.rotation+=deltaTime*0.01;
	}
}

new PixiBoot();