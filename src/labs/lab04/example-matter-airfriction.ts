import { MatterBase } from './example-matter-base';
import * as Matter from 'matter-js';

export class ExampleMatterAirFriction extends MatterBase {

  protected initMatter() {
    // add bodies
    Matter.World.add(this.mWorld, [
      // falling blocks
      Matter.Bodies.rectangle(200, 100, 60, 60, { frictionAir: 0.001 }),
      Matter.Bodies.rectangle(400, 100, 60, 60, { frictionAir: 0.05 }),
      Matter.Bodies.rectangle(600, 100, 60, 60, { frictionAir: 0.1 }),

      // walls
      Matter.Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
      Matter.Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
      Matter.Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
      Matter.Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);
  }
}