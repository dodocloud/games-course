import * as ECSA from '../../../libs/pixi-component';
import { Interpolation, RotationAnimation } from '../../utils/animation';

class ExampleTween2 {
  engine: ECSA.GameLoop;

  constructor(view: HTMLCanvasElement, interpolation: any) {
    this.engine = new ECSA.GameLoop();
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);

    let loader = this.engine.app.loader;
    loader
    .reset()
    .load(() => {

      let cmp = new RotationAnimation(0, 2*Math.PI, 2000, true, 0);
      let graphics = new ECSA.Builder(this.engine.scene)
        .asGraphics()
        .relativePos(0.5)
        .anchor(0.5)
        .withParent(this.engine.scene.stage)
        .withComponent(cmp)
        .build<ECSA.Graphics>();

      graphics.beginFill(0xFF0000);
      graphics.drawRect(0, 0, 200, 200);
      graphics.endFill();

      cmp.interpolation = interpolation;
    });
  }
}

export class ExampleTweenLinear2 extends ExampleTween2 {
  constructor(view: HTMLCanvasElement) {
    super(view, Interpolation.linear);
  }
}

export class ExampleTweenQuadraticIn2 extends ExampleTween2 {
  constructor(view: HTMLCanvasElement) {
    super(view, Interpolation.quadraticEaseIn);
  }
}

export class ExampleTweenExpo2 extends ExampleTween2 {
  constructor(view: HTMLCanvasElement) {
    super(view, Interpolation.expoIn);
  }
}