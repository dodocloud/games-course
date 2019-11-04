import * as ECSA from '../../../libs/pixi-component';
import { Random } from '../../../libs/pixi-math';

abstract class DistributionBase {
  engine: ECSA.GameLoop;
  random: Random;

  constructor(view: HTMLCanvasElement) {
    this.engine = new ECSA.GameLoop();
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);
    this.random = new Random(9876511);

    let render = new ECSA.Graphics('');
    let width = this.engine.app.screen.width;
    let height = this.engine.app.screen.height;

    this.engine.app.stage.addChild(render);

    render.lineStyle(2, 0xFF0000);
    render.moveTo(width * 0.95, height * 0.95);
    render.lineTo(width * 0.05, height * 0.95);
    render.lineTo(width * 0.05, height * 0.05);
    render.lineStyle(0);

    let iterations = Math.floor(width * 0.9);
    let samples = new Array(iterations);
    samples = samples.fill(0, 0, samples.length);

    for(let i = 0; i< iterations*40; i++) {
      let sample = Math.floor(this.generateNumber(0, iterations));
      if(sample >= 0 && sample <= samples.length) {
        samples[sample]++;
      }
    }
    let max = Math.max(...samples);

    render.beginFill(0x0F0FF0);
    for(let i =0; i < iterations; i++) {
      let frequency = (samples[i]) / (max);
      render.drawCircle(width * 0.05 + i, height * 0.05 + (height * 0.9) * (1 - frequency), 2);
    }
    render.endFill();
  }

  abstract generateNumber(min: number, max: number): number;
}

export class ExampleGauss extends DistributionBase {

  generateNumber(min: number, max: number): number {
   return this.random.normal(min, max, 1);
  }
}

export class ExampleUniform extends DistributionBase {

  generateNumber(min: number, max: number): number {
    return this.random.uniform(min, max);
  }
}