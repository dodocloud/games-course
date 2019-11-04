import * as ECSA from '../../../libs/pixi-component';
import { SeekSteering } from './example-steering';

export class ExampleSteeringSeek {
  engine: ECSA.GameLoop;

  constructor(view: HTMLCanvasElement) {
    this.engine = new ECSA.GameLoop();
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);
    let scene = this.engine.scene;
    let target = new ECSA.Graphics('TARGET');
    target.beginFill(0xe96f6f);
    target.drawCircle(0, 0, 40);
    target.endFill();
    target.position.x = scene.app.screen.width / 2;
    target.position.y = scene.app.screen.height / 2;
    scene.stage.addChild(target);
    let seekBoid = new ECSA.Graphics('SEEK');
    seekBoid.beginFill(0x47a1d5);
    seekBoid.drawPolygon([-10, -10, -10, 10, 15, 0]);
    seekBoid.endFill();
    seekBoid.scale.set(3);
    scene.stage.addChild(seekBoid);
    seekBoid.addComponent(new SeekSteering(target));
  }
}


