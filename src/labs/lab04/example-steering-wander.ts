import * as ECSA from '../../../libs/pixi-component';
import { WanderSteering } from './example-steering';

export class ExampleSteeringWander {
  engine: ECSA.GameLoop;

  constructor(view: HTMLCanvasElement) {
    this.engine = new ECSA.GameLoop();
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);
    this.createWander(100, 50, 0.1, 0xe9e56f);
    this.createWander(50, 20, 0.5, 0x47a1d5);
    this.createWander(0, 50, 0.8, 0x2a65c4);
    this.createWander(20, 60, 0.9, 0x69e5a1);
  }

  private createWander(wanderDistance: number, wanderRadius: number, wanderJittering: number, color: number) {
    let scene = this.engine.scene;
    let parent = new ECSA.Container('PARENT');
    scene.app.stage.addChild(parent);

    let circle = new ECSA.Graphics('CIRCLE');
    circle.lineStyle(2, 0xFF00FF);
    circle.drawCircle(0, 0, wanderRadius);
    circle.endFill();
    parent.addChild(circle);

    let dot = new ECSA.Graphics('DOT');
    dot.beginFill(0xFFFFFF);
    dot.drawCircle(0, 0, 10);
    dot.endFill();
    parent.addChild(dot);

    let wanderBoid = new ECSA.Graphics('WANDER');
    wanderBoid.beginFill(color);
    wanderBoid.drawPolygon([-10, -10, -10, 10, 15, 0]);
    wanderBoid.endFill();
    wanderBoid.scale.set(3);
    parent.addChild(wanderBoid);
    parent.position.set(scene.app.screen.width * Math.random(), scene.app.screen.height * Math.random());
    parent.addComponent(new WanderSteering(wanderDistance, wanderRadius, wanderJittering, wanderBoid, dot, circle));
  }
}