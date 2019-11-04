import * as ECSA from '../../../libs/pixi-component';
import { WanderSteering, PursuitSteering } from './example-steering';

export class ExampleSteeringPursuit {
  engine: ECSA.GameLoop;

  constructor(view: HTMLCanvasElement) {
    this.engine = new ECSA.GameLoop();
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);
    let scene = this.engine.scene;
    let wanderBoid = new ECSA.Graphics('WANDER');
    wanderBoid.beginFill(0x47a1d5);
    wanderBoid.drawPolygon([-10, -10, -10, 10, 15, 0]);
    wanderBoid.endFill();
    wanderBoid.position.set(scene.app.screen.width * 0.7, scene.app.screen.height * 0.8);
    wanderBoid.scale.set(2);
    wanderBoid.addComponent(new WanderSteering(20, 10, 0.1, wanderBoid));
    scene.stage.addChild(wanderBoid);

    let pursuitBoid = new ECSA.Graphics('PURSUIT');
    pursuitBoid.beginFill(0xF00FFF);
    pursuitBoid.drawPolygon([-10, -10, -10, 10, 15, 0]);
    pursuitBoid.endFill();
    pursuitBoid.position.set(scene.app.screen.width / 4, scene.app.screen.height / 2);
    pursuitBoid.scale.set(3);
    scene.stage.addChild(pursuitBoid);
    pursuitBoid.addComponent(new PursuitSteering(wanderBoid));
  }
}
