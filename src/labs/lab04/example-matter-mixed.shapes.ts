import { MatterBase } from './example-matter-base';
import * as Matter from 'matter-js';

export class ExampleMatterMixedShapes extends MatterBase {

  protected initMatter() {
    // add bodies
    let stack = Matter.Composites.stack(20, 20, 10, 5, 0, 0, (x, y) => {
      let sides = Math.round(this.random.uniform(1, 8));

      // triangles can be a little unstable, so avoid until fixed
      sides = (sides === 3) ? 4 : sides;

      // round the edges of some bodies
      let chamfer = null;
      if (sides > 2 && this.random.uniform() > 0.7) {
        chamfer = {
          radius: 10
        };
      }

      switch (Math.round(this.random.uniform(0, 1))) {
        case 0:
          if (this.random.uniform() < 0.8) {
            return Matter.Bodies.rectangle(x, y, this.random.uniform(25, 50), this.random.uniform(25, 50), { chamfer: chamfer });
          } else {
            return Matter.Bodies.rectangle(x, y, this.random.uniform(80, 120), this.random.uniform(25, 30), { chamfer: chamfer });
          }
        case 1:
          return Matter.Bodies.polygon(x, y, sides, this.random.uniform(25, 50), { chamfer: chamfer });
      }
    });

    Matter.World.add(this.mWorld, stack);

    Matter.World.add(this.mWorld, [
      // walls
      Matter.Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
      Matter.Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
      Matter.Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
      Matter.Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);
  }
}
