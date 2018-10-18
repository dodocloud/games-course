import * as PIXI from 'pixi.js'

export default class PixiBoot extends PIXI.Application
{
    text:PIXI.Text;
    ticks = 0;

	constructor()
	{
		super({
			view: <HTMLCanvasElement>document.getElementById('gameCanvas'),
			backgroundColor: 0x000000,
			width: 300,
			height: 300
		});

		document.body.appendChild(this.view);
        
        this.text = new PIXI.Text("Hello Pixi!", new PIXI.TextStyle({
            fill: "0xFFFFFF",
        }));
        this.text.position.x = this.screen.width/2;
        this.text.position.y = this.screen.height/2;
        this.text.anchor.set(0.5, 0.5);
        this.stage.addChild(this.text);
        
		this.ticker.add((deltaTime) => this.update(deltaTime));
	}

	update(deltaTime:number)
	{
        if(this.ticks++ % 10 == 0){
            this.text.visible = !this.text.visible;
        }
	}
}

new PixiBoot();