import * as ECSA from '../../../libs/pixi-component';
import { Random } from '../../../libs/pixi-math';

const ITERATIONS = 1000;

abstract class DistributionBase {
  engine: ECSA.GameLoop;
  random: Random;
  render: ECSA.Graphics;

  constructor(view: HTMLCanvasElement) {
    this.engine = new ECSA.GameLoop({ transparent: true});
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);
    this.random = new Random(135061);

    this.render = new ECSA.Graphics('');
    let width = this.engine.app.screen.width;
    let height = this.engine.app.screen.height;

    let radius = width / 3;

    let target = new ECSA.Graphics();
    this.engine.app.stage.addChild(target);
    target.beginFill(0xd54747);
    target.drawCircle(width / 2, height / 2, radius);
    target.endFill();

    this.engine.app.stage.addChild(this.render);

    let counter = 0;

    this.render.addComponent(new ECSA.GenericComponent('').doOnUpdate((cmp, delta, absolute) => {
      let sampleX = Math.floor(this.generateNumber(-radius, radius));
      let sampleY = Math.floor(this.generateNumber(-radius, radius));
      this.render.beginFill(0x000000);
      if(new ECSA.Vector(sampleX, sampleY).magnitude() <= radius) {
        this.render.drawCircle(width / 2 + sampleX, height / 2 + sampleY, 10);
      }
      this.render.endFill();

      if(counter++ >= ITERATIONS) {
        cmp.finish();
      }
    }));
  }

  abstract generateNumber(min: number, max: number): number;
}

export class ExampleGaussSpread extends DistributionBase {

  generateNumber(min: number, max: number): number {
   return this.random.normal(min, max, 1);
  }
}

export class ExampleUniformSpread extends DistributionBase {

  generateNumber(min: number, max: number): number {
    return this.random.uniform(min, max);
  }
}