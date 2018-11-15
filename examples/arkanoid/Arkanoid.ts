

import Component from '../../ts/engine/Component';
import DebugComponent from '../../ts/components/DebugComponent';
import Scene from '../../ts/engine/Scene';
import { PixiRunner } from '../../ts/PixiRunner'
import { PIXICmp } from '../../ts/engine/PIXIObject';
import { ATTR_FACTORY, SOUND_GAMEOVER, SOUND_HIT, SOUND_INTRO, SOUND_ROUND, DATA_JSON, SCENE_HEIGHT, SPRITES_RESOLUTION_HEIGHT } from './Constants';
import { TEXTURE_ARKANOID } from './Constants';
import { Factory } from './Factory';
import { Model } from './Model';


class Arkanoid {
    engine: PixiRunner;

    // Start a new game
    constructor() {
        this.engine = new PixiRunner();
        
        let canvas = (document.getElementById("gameCanvas") as HTMLCanvasElement);

        let screenHeight = canvas.height;
        
        // calculate ratio between intended resolution (here 400px of height) and real resolution
        // - this will set appropriate scale 
        let gameScale = SPRITES_RESOLUTION_HEIGHT / screenHeight;
        // scale the scene to 25 units if height
        let resolution = screenHeight / SCENE_HEIGHT * gameScale;
        this.engine.init(canvas, resolution / gameScale);

        // set global scale which has to be applied for ALL sprites as it will
        // scale them to defined unit size
        Factory.globalScale = 1 / resolution;

        PIXI.loader
            .reset()    // necessary for hot reload
            .add(TEXTURE_ARKANOID, 'static/arkanoid/sprites.png')
            .add(SOUND_HIT, 'static/arkanoid/hit.mp3')
            .add(SOUND_GAMEOVER, 'static/arkanoid/gameover.mp3')
            .add(SOUND_INTRO, 'static/arkanoid/intro.mp3')
            .add(SOUND_ROUND, 'static/arkanoid/round.mp3')
            .add(DATA_JSON, 'static/arkanoid/data.json')
            .load(() => this.onAssetsLoaded());
    }

    onAssetsLoaded() {
        // init factory and model
        let factory = new Factory();
        let model = new Model();
        model.loadModel(PIXI.loader.resources[DATA_JSON].data);
        factory.resetGame(this.engine.scene, model);
    }
}

export var arkanoid = new Arkanoid();

