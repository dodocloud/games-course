import { MatterBase } from './example-matter-base';
import * as Matter from 'matter-js';

export class ExampleMatterNewtonCradle extends MatterBase {

  protected initMatter() {
    // add bodies
    let cradle = (<any>(Matter.Composites)).newtonsCradle(280, 100, 5, 30, 200);
    Matter.World.add(this.mWorld, cradle);
    Matter.Body.translate(cradle.bodies[0], { x: -180, y: -100 });

    cradle = (<any>(Matter.Composites)).newtonsCradle(280, 380, 7, 20, 140);
    Matter.World.add(this.mWorld, cradle);
    Matter.Body.translate(cradle.bodies[0], { x: -140, y: -100 });
  }
}