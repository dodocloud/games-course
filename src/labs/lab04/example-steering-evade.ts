import * as ECSA from '../../../libs/pixi-component';
import { EvadeSteering, PursuitSteering } from './example-steering';

export class ExampleSteeringEvade {
  engine: ECSA.GameLoop;

  constructor(view: HTMLCanvasElement) {
    this.engine = new ECSA.GameLoop();
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);
    let scene = this.engine.scene;
    let evadeBoid = new ECSA.Graphics('EVADE');
    let pursuitBoid = new ECSA.Graphics('PURSUIT');
    evadeBoid.beginFill(0x47a1d5);
    evadeBoid.drawPolygon([-10, -10, -10, 10, 15, 0]);
    evadeBoid.endFill();
    evadeBoid.position.set(scene.app.screen.width * 0.7, scene.app.screen.height * 0.8);
    evadeBoid.scale.set(2);
    evadeBoid.addComponent(new EvadeSteering(pursuitBoid));

    let pursuitBoid2 = new ECSA.Graphics('PURSUIT2');
    pursuitBoid2.beginFill(0xe9e56f);
    pursuitBoid2.drawPolygon([-10, -10, -10, 10, 15, 0]);
    pursuitBoid2.endFill();
    pursuitBoid2.position.set(scene.app.screen.width * 0.3, scene.app.screen.height * 0.8);
    pursuitBoid2.scale.set(3);
    pursuitBoid2.addComponent(new PursuitSteering(pursuitBoid));

    pursuitBoid.beginFill(0xF00FFF);
    pursuitBoid.drawPolygon([-10, -10, -10, 10, 15, 0]);
    pursuitBoid.endFill();
    pursuitBoid.position.set(scene.app.screen.width / 4, scene.app.screen.height / 2);
    pursuitBoid.scale.set(3);
    scene.stage.addChild(pursuitBoid);
    pursuitBoid.addComponent(new PursuitSteering(evadeBoid));
    scene.stage.addChild(evadeBoid);
    scene.stage.addChild(pursuitBoid2);
  }
}

