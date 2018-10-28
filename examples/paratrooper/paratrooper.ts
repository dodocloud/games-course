

import Component from '../../ts/engine/Component';
import DebugComponent from '../../ts/components/DebugComponent';
import Scene from '../../ts/engine/Scene';
import ChainingComponent from '../../ts/components/ChainingComponent';
import { PixiRunner } from '../../ts/PixiRunner'
import { PIXICmp } from '../../ts/engine/PIXIObject';
import { CannonController } from './components';


class Paratrooper {
    engine: PixiRunner;

    // Start a new game
    constructor() {
        this.engine = new PixiRunner();

        this.engine.init(document.getElementById("gameCanvas") as HTMLCanvasElement, 1);

        PIXI.loader
            .reset()    // necessary for hot reload
            .add('bomber', 'bomber.png')
            .add('cannon', 'cannon.png')
            .add('copter_left', 'copter_left.png')
            .add('copter_right', 'copter_right.png')
            .add('paratrooper_parachute', 'paratrooper_parachute.png')
            .add('paratrooper', 'paratrooper.png')
            .add('projectile', 'projectile.png')
            .add('tower', 'tower.png')
            .add('turret', 'turret.png')
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

