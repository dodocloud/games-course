import * as PIXI from 'pixi.js';
import { PIXIExample } from '../utils/APHExample';

export class Text extends PIXIExample {

    text: PIXI.Text;

	load() {
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fill: ['#ffffff', '#00ff99'],
            stroke: '#4a1850',
            strokeThickness: 5
        });

        this.text = new PIXI.Text('Hello World', style);
        this.text.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
        this.text.anchor.set(0.5);
        this.app.stage.addChild(this.text);
    }

    directionLeft = false;

    update(deltaTime: number) {
        if(this.directionLeft) {
            this.text.position.x -= deltaTime * 2;
        } else {
            this.text.position.x += deltaTime * 2;
        }

        if(this.text.getBounds().left < 0) {
            this.directionLeft = false;
        } else if(this.text.getBounds().right > this.app.screen.width) {
            this.directionLeft = true;
        }
    }
}