

import Component from '../../ts/engine/Component';
import DebugComponent from '../../ts/components/DebugComponent';
import Scene from '../../ts/engine/Scene';
import { PixiRunner } from '../../ts/PixiRunner'
import { PIXICmp } from '../../ts/engine/PIXIObject';
import Msg from '../../ts/engine/Msg';
import { TEXTURE_ROCKET } from './constants';
import { Example1 } from './example1';
import { Example2 } from './example2';
import { Example3 } from './example3';
import { Example4 } from './example4';

class Components {
    engine: PixiRunner;

    // Start a new game
    constructor() {
        this.engine = new PixiRunner();

        this.engine.init(document.getElementById("gameCanvas") as HTMLCanvasElement, 1);

        PIXI.loader
            .reset()    // necessary for hot reload
            .add(TEXTURE_ROCKET, 'static/examples/rocket.png')
            .load(() => this.onAssetsLoaded());
    }

    onAssetsLoaded() {
        // load example
        new Example1().init(this.engine.scene);
    }
}

new Components();

