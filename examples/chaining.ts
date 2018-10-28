import { TranslateAnimation } from './../ts/components/Animation';
import Component from '../ts/engine/Component';
import DebugComponent from '../ts/components/DebugComponent';
import Scene from '../ts/engine/Scene';
import ChainingComponent from '../ts/components/ChainingComponent';
import { PixiRunner } from '../ts/PixiRunner'
import {PIXICmp} from '../ts/engine/PIXIObject';

class Chaining {
    // Start a new game
    constructor() {
        let engine = new PixiRunner();

        engine.init(document.getElementById("gameCanvas") as HTMLCanvasElement, 100);

        // debugging
        engine.scene.addGlobalComponent(new DebugComponent(false, document.getElementById("debugSect")));

        let rectangleGfx = new PIXICmp.Graphics();
        rectangleGfx.beginFill(0xfff012, 1);
        rectangleGfx.drawRect(0, 0, 1, 1);
        rectangleGfx.position.set(200, 200);
        rectangleGfx.addComponent(new ChainingComponent()
        .beginInterval(0)
        .execute((cmp) => cmp.addComponentAndWait(new TranslateAnimation(1, 1, 2, 1, 1), null, true))
        .execute((cmp) => cmp.addComponentAndWait(new TranslateAnimation(2, 1, 2, 2, 1), null, true))
        .execute((cmp) => cmp.addComponentAndWait(new TranslateAnimation(2, 2, 1, 2, 1), null, true))
        .execute((cmp) => cmp.addComponentAndWait(new TranslateAnimation(1, 2, 1, 1, 1), null, true))
        .endInterval()
    );

        engine.app.stage.addChild(rectangleGfx);
    }
}

new Chaining();

