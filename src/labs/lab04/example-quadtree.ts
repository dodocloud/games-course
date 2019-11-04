import * as ECSA from '../../../libs/pixi-component';
import { QuadTree, QuadTreeItem } from '../../../libs/pixi-math';



interface Item extends QuadTreeItem {
  vx: number; // x-velocity
  vy: number; // y-velocity
}

class ExampleQuadTreeBase {
  engine: ECSA.GameLoop;

  constructor(view: HTMLCanvasElement, objectNum: number, maxObjectsInLeaf: number, maxTreeLevels: number) {
    this.engine = new ECSA.GameLoop();
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);

    let scene = this.engine.scene;
    scene.clearScene();

    let bounds = new PIXI.Rectangle(0, 0, scene.app.screen.width, scene.app.screen.height);
    let tree = new QuadTree(bounds, maxObjectsInLeaf, maxTreeLevels);
    let items = new Array<Item>();

    // add items
    for (let i = 0; i < objectNum; i++) {
      let item: Item = {
        x: Math.random() * scene.app.screen.width,
        y: Math.random() * scene.app.screen.height,
        vx: Math.random() * 30 - 15,
        vy: Math.random() * 30 - 15,
      };
      items.push(item);
    }

    let builder = new ECSA.Builder(scene);

    builder
      .withComponent(new ECSA.GenericComponent('Updater') // update positions of all objects based on their velocities
        .doOnUpdate((cmp, delta, absolute) => {
          // remove all objects and subnodes
          tree.clear();
          // update objects and insert them into the tree again
          for (let item of items) {
            item.x += item.vx * delta * 0.01;
            item.y += item.vy * delta * 0.01;
            if ((item.x) > scene.app.screen.width || item.x < 0) {
              item.vx *= -1;
            }
            if ((item.y) > scene.app.screen.height || item.y < 0) {
              item.vy *= -1;
            }
            tree.insert(item);
          }
        })
      )
      .withComponent(new ECSA.GenericComponent('Renderer') // render objects and the tree
        .doOnUpdate((cmp, delta, absolute) => {
          let pixiObj = cmp.owner.asGraphics();
          pixiObj.clear();
          pixiObj.beginFill(0xe96f6f);

          for (let item of items) {
            pixiObj.drawCircle(item.x, item.y, 4);
          }
          pixiObj.endFill();

          pixiObj.lineStyle(1, 0x47a1d5);
          let drawQuadTree = (renderer: ECSA.Graphics, node: QuadTree) => {
            if (node.topRight == null) {
              renderer.drawRect(node.bounds.x, node.bounds.y, node.bounds.width, node.bounds.height);
            } else {
              drawQuadTree(renderer, node.topLeft);
              drawQuadTree(renderer, node.topRight);
              drawQuadTree(renderer, node.bottomLeft);
              drawQuadTree(renderer, node.bottomRight);
            }
          };
          drawQuadTree(pixiObj, tree);


        }))
      .asGraphics()
      .withParent(scene.stage)
      .build();
  }
}

export class ExampleQuadTreeSmall extends ExampleQuadTreeBase {
  constructor(view: HTMLCanvasElement) {
    super(view, 8, 2, 3);
  }
}

export class ExampleQuadTreeMedium extends ExampleQuadTreeBase {
  constructor(view: HTMLCanvasElement) {
    super(view, 20, 5, 4);
  }
}

export class ExampleQuadTreeLarge extends ExampleQuadTreeBase {
  constructor(view: HTMLCanvasElement) {
    super(view, 50, 10, 5);
  }
}

export class ExampleQuadTreeUltraLarge extends ExampleQuadTreeBase {
  constructor(view: HTMLCanvasElement) {
    super(view, 100, 2, 10);
  }
}