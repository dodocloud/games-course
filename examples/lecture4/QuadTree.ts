import { QuadTree, QuadTreeItem } from './../../ts/utils/QuadTree';
import Scene from '../../ts/engine/Scene';
import { PIXICmp } from '../../ts/engine/PIXIObject';
import PIXIObjectBuilder from '../../ts/engine/PIXIObjectBuilder';
import { GenericComponent } from '../../ts/components/GenericComponent';

const OBJECT_NUM = 100;
const MAX_OBJECTS_IN_LEAF = 1;
const MAX_TREE_LEVELS = 10;


export class QuadTreeExample {
    init(scene: Scene) {
        scene.clearScene();

        let bounds = new PIXI.Rectangle(0, 0, scene.app.screen.width, scene.app.screen.height);
        let tree = new QuadTree(bounds, MAX_OBJECTS_IN_LEAF, MAX_TREE_LEVELS);
        let items = new Array<QuadTreeItem>();

        // add items
        for (let i = 0; i < OBJECT_NUM; i++) {
            let item = new QuadTreeItem();
            item.x = Math.random() * scene.app.screen.width;
            item.y = Math.random() * scene.app.screen.height;
            item.width = item.height = 3;
            item.vx = Math.random() * 5 - 2.5;
            item.vy = Math.random() * 5 - 2.5;
            items.push(item);
        }

        let builder = new PIXIObjectBuilder(scene);

        builder
            .withComponent(new GenericComponent("Updater") // update positions of all objects based on their velocities
                .doOnUpdate((cmp, delta, absolute) => {
                    // remove all objects and subnodes
                    tree.clear();
                    // update objects and insert them into the tree again
                    for (let item of items) {
                        item.x += item.vx * delta * 0.01;
                        item.y += item.vy * delta * 0.01;
                        if ((item.x + item.width) > scene.app.screen.width || item.x < 0) item.vx *= -1;
                        if ((item.y + item.height) > scene.app.screen.height || item.y < 0) item.vy *= -1;

                        tree.insert(item);
                    }
                })
            )
            .withComponent(new GenericComponent("Renderer") // render objects and the tree
                .doOnUpdate((cmp, delta, absolute) => {
                    let pixiObj = <PIXICmp.Graphics>cmp.owner.getPixiObj();
                    pixiObj.clear();
                    pixiObj.lineStyle(1, 0xFF0000);

                    for (let item of items) {
                        pixiObj.drawRect(item.x, item.y, item.width, item.height);
                    }

                    pixiObj.lineStyle(2, 0x00FF00);
                    let drawQuadTree = (renderer: PIXICmp.Graphics, node: QuadTree) => {
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
            .build(new PIXICmp.Graphics(""), scene.stage);
    }
}
