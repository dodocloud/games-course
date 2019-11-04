import { MatterBase } from './example-matter-base';
import * as Matter from 'matter-js';

export class ExampleMatterFriction extends MatterBase {

  protected initMatter() {
    // add bodies
    Matter.World.add(this.mWorld, [
      // walls
      Matter.Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
      Matter.Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
      Matter.Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
      Matter.Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    Matter.World.add(this.mWorld, [
      Matter.Bodies.rectangle(300, 180, 700, 20, { isStatic: true, angle: Math.PI * 0.06 }),
      Matter.Bodies.rectangle(300, 70, 40, 40, { friction: 0.001 })
    ]);

    Matter.World.add(this.mWorld, [
      Matter.Bodies.rectangle(300, 350, 700, 20, { isStatic: true, angle: Math.PI * 0.06 }),
      Matter.Bodies.rectangle(300, 250, 40, 40, { friction: 0.0005 })
    ]);

    Matter.World.add(this.mWorld, [
      Matter.Bodies.rectangle(300, 520, 700, 20, { isStatic: true, angle: Math.PI * 0.06 }),
      Matter.Bodies.rectangle(300, 430, 40, 40, { friction: 0 })
    ]);
  }
}