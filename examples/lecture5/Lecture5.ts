import { AIAgentsFactory } from './AIAgentsFactory';

import { PixiRunner } from '../../ts/PixiRunner'
import { PIXICmp } from '../../ts/engine/PIXIObject';
import { TEXTURE_AI } from './Constants';
import { AIModel } from './AIModel';

class Lecture5 {
    engine: PixiRunner;

    // Start a new game
    constructor() {
        this.engine = new PixiRunner();
        this.engine.init(document.getElementById("gameCanvas") as HTMLCanvasElement, 1);

        PIXI.loader
            .reset()    // necessary for hot reload
            .add(TEXTURE_AI, "static/examples/aiexample.png")
            .load(() => this.onAssetsLoaded());
    }

    onAssetsLoaded() {
        let factory = new AIAgentsFactory();
        factory.initializeGame(this.engine.scene.stage, new AIModel());
    }
}

new Lecture5();

