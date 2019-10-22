
import * as ECSA from '../../../libs/pixi-component';

class Squares {
  engine: ECSA.GameLoop;

  constructor() {
    this.engine = new ECSA.GameLoop();
    let canvas = (document.getElementById('gameCanvas') as HTMLCanvasElement);

    this.engine.init(canvas, 800, 600, 1, null, true);

    let square1 = new ECSA.Graphics();
    square1.beginFill(0xFF0000);
    square1.drawRect(0, 0, 200, 200);
    square1.endFill();

    let square2 = new ECSA.Graphics();
    square2.beginFill(0x0000FF);
    square2.drawRect(0, 0, 200, 200);
    square2.endFill();

    let builder = new ECSA.Builder(this.engine.scene).withParent(this.engine.scene.stage).anchor(0.5);

    builder.relativePos(0.25, 0.5).buildInto(square1, false);
    builder.relativePos(0.75, 0.5).buildInto(square2, false);
  }
}

export default new Squares();

