

import Component from '../../ts/engine/Component';
import DebugComponent from '../../ts/components/DebugComponent';
import Scene from '../../ts/engine/Scene';
import ChainingComponent from '../../ts/components/ChainingComponent';
import { PixiRunner } from '../../ts/PixiRunner'
import { PIXICmp } from '../../ts/engine/PIXIObject';
import { CannonController } from './components';
import { TEXTURE_BOMBER, TEXTURE_CANNON, TEXTURE_COPTER_LEFT, TEXTURE_PARATROOPER, TEXTURE_COPTER_RIGHT, 
    TEXTURE_PARATROOPER_PARACHUTE, TEXTURE_PROJECTILE, TEXTURE_TOWER, TEXTURE_TURRET } from './constants';


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
        let tower = new PIXICmp.Sprite("tower", PIXI.Texture.fromImage("tower"));
        tower.anchor.set(0.5, 1);
        tower.position.set(this.engine.app.screen.width/2, this.engine.app.screen.height);
        this.engine.app.stage.addChild(tower);

        let turret = new PIXICmp.Sprite("turret", PIXI.Texture.fromImage("turret"));
        turret.anchor.set(0.5, 1);
        turret.position.set(0, -tower.height);
        tower.addChild(turret);

        let cannon = new PIXICmp.Sprite("cannon", PIXI.Texture.fromImage("cannon"));
        cannon.anchor.set(0.5, 1);
        cannon.position.set(0, -turret.height*0.7);
        turret.addChild(cannon);

        cannon.addComponent(new CannonController());
    }
}

new Paratrooper();

