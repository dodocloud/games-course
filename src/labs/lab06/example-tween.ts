import * as ECSA from '../../../libs/pixi-component';
import { Interpolation, TranslateAnimation } from '../../utils/animation';

class ExampleTween {
  engine: ECSA.GameLoop;

  constructor(view: HTMLCanvasElement, interpolation: any) {
    this.engine = new ECSA.GameLoop();
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);

    let loader = this.engine.app.loader;
    loader
    .reset()
    .load(() => {

      let cmp = new TranslateAnimation(0, 0, view.clientWidth - 200, view.clientHeight - 200, 3000, true, 0);
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

export class ExampleTweenLinear extends ExampleTween {
  constructor(view: HTMLCanvasElement) {
    super(view, Interpolation.linear);
  }
}

export class ExampleTweenEaseInOut extends ExampleTween {
  constructor(view: HTMLCanvasElement) {
    super(view, Interpolation.easeinout);
  }
}

export class ExampleTweenSineIn extends ExampleTween {
  constructor(view: HTMLCanvasElement) {
    super(view, Interpolation.sineIn);
  }
}