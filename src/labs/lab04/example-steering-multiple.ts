import * as ECSA from '../../../libs/pixi-component';
import { PursuitSteering, EvadeSteering, WanderSteering } from './example-steering';

export class ExampleSteeringMultiple {
  engine: ECSA.GameLoop;

  objects: ECSA.Container[] = [];

  constructor(view: HTMLCanvasElement) {
    this.engine = new ECSA.GameLoop();
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);

    for(let i =0; i< 100; i++) {
      this.createRandomObject();
    }
  }

  private createRandomObject() {
    let scene = this.engine.scene;
    let boid = new ECSA.Graphics();
    boid.beginFill((Math.floor(Math.random() * 0xFF) << 16) + (Math.floor(Math.random() * 0xFF) << 8) + (Math.floor(Math.random() * 0xFF)));
    boid.drawPolygon([-10, -10, -10, 10, 15, 0]);
    boid.endFill();
    boid.position.set(scene.app.screen.width * Math.random(), scene.app.screen.height * Math.random());
    boid.scale.set(1 + Math.random() * 3);

    let components = 0;

    if(Math.random() > 0.5 && this.objects.length !== 0) {
      let randomTarget = this.objects[Math.floor(Math.random() * (this.objects.length - 1))];
      boid.addComponent(new PursuitSteering(randomTarget));
      components++;
    } else if(Math.random() > 0.7 && this.objects.length !== 0) {
      let randomTarget = this.objects[Math.floor(Math.random() * (this.objects.length - 1))];
      boid.addComponent(new EvadeSteering(randomTarget));
      components++;
    }

    if(Math.random() > 0.5) {
      boid.addComponent(new WanderSteering(Math.random() * 100, Math.random() * 50, Math.random(), boid));
      components++;
    }

    if(components !== 0) {
      this.objects.push(boid);
      scene.stage.addChild(boid);
    }
  }
}