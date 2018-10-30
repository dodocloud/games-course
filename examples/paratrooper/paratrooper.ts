

import Component from '../../ts/engine/Component';
import DebugComponent from '../../ts/components/DebugComponent';
import Scene from '../../ts/engine/Scene';
import ChainingComponent from '../../ts/components/ChainingComponent';
import { PixiRunner } from '../../ts/PixiRunner'
import { PIXICmp } from '../../ts/engine/PIXIObject';
import { ATTR_FACTORY } from './constants';
import ParatrooperFactory from './ParatroperFactory';
import {
    TEXTURE_BOMBER, TEXTURE_CANNON, TEXTURE_COPTER_LEFT, TEXTURE_PARATROOPER, TEXTURE_COPTER_RIGHT,
    TEXTURE_PARATROOPER_PARACHUTE, TEXTURE_PROJECTILE, TEXTURE_TOWER, TEXTURE_TURRET
} from './constants';


class Paratrooper {
    engine: PixiRunner;

    // Start a new game
    constructor() {
        this.engine = new PixiRunner();

        this.engine.init(document.getElementById("gameCanvas") as HTMLCanvasElement, 1);

        PIXI.loader
            .reset()    // necessary for hot reload
            .add(TEXTURE_BOMBER, 'bomber.png')
            .add(TEXTURE_CANNON, 'cannon.png')
            .add(TEXTURE_COPTER_LEFT, 'copter_left.png')
            .add(TEXTURE_COPTER_RIGHT, 'copter_right.png')
            .add(TEXTURE_PARATROOPER_PARACHUTE, 'paratrooper_parachute.png')
            .add(TEXTURE_PARATROOPER, 'paratrooper.png')
            .add(TEXTURE_PROJECTILE, 'projectile.png')
            .add(TEXTURE_TOWER, 'tower.png')
            .add(TEXTURE_TURRET, 'turret.png')
            .load(() => this.onAssetsLoaded());
    }

    onAssetsLoaded() {
        let factory = new ParatrooperFactory();
        let model = factory.loadGameModel();
        this.engine.scene.addGlobalAttribute(ATTR_FACTORY, factory);
        factory.initializeGame(this.engine.scene.root, model);
    }
}

new Paratrooper();

