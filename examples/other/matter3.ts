import Component from '../../ts/engine/Component';
import DebugComponent from '../../ts/components/DebugComponent';
import Scene from '../../ts/engine/Scene';
import { PixiRunner } from '../../ts/PixiRunner'
import { PIXICmp } from '../../ts/engine/PIXIObject';
import * as Matter from 'matter-js'


// workaround for require
import decomp from 'poly-decomp';
window.decomp = decomp;

class RotationAnim extends Component {
    from = 0;
    to = 0;

    constructor(from: number, to: number) {
        super();
        this.from = from;
        this.to = to;
    }

    onInit() {
        this.owner.getPixiObj().rotation = this.from;
    }

    onUpdate(delta: number, absolute: number) {
        this.owner.getPixiObj().rotation += delta * 0.001;

        if ((this.to > this.from && this.owner.getPixiObj().rotation > this.to) ||
            (this.to < this.from && this.owner.getPixiObj().rotation < this.to)) {
            this.owner.getPixiObj().rotation = this.to;
            this.finish();
        }
    }
}


class MatterExample {
    engine: PixiRunner;

    // Start a new game
    constructor() {
        this.engine = new PixiRunner();

        this.engine.init(document.getElementById("gameCanvas") as HTMLCanvasElement, 1);

        Matter.Engine

        var Engine = Matter.Engine,
            Runner = Matter.Runner,
            Composites = Matter.Composites,
            World = Matter.World,
            Bodies = Matter.Bodies;

        // create engine
        var engine = Engine.create(),
            world = engine.world;

        // create runner
        var runner = Runner.create({});
        Runner.run(runner, engine);

        // create renderer
        var render = Matter.Render.create({
            element: document.body,
            engine: engine,
            canvas: document.getElementById("matterCanvas") as HTMLCanvasElement,
            options: {
                width: 600,
                height: 600,
            }
        });

        Matter.Render.run(render);

        // add mouse control
        var mouse = Matter.Mouse.create(render.canvas),
            mouseConstraint = Matter.MouseConstraint.create(engine, {
                mouse: mouse,
                constraint: {
                    stiffness: 0.2
                }
            });

        World.add(world, mouseConstraint);

        // keep the mouse in sync with rendering
        render.mouse = mouse;

        // fit the render viewport to the scene
        Matter.Render.lookAt(render, {
            min: { x: 0, y: 0 },
            max: { x: 600, y: 600 }
        });


        // add bodies
        var stack = Composites.stack(200, 200, 10, 5, 0, 0, function (x, y) {
            var sides = Math.round(Math.random() * 9 - 1);

            // triangles can be a little unstable, so avoid until fixed
            sides = (sides === 3) ? 4 : sides;

            // round the edges of some bodies
            var chamfer = null;
            if (sides > 2 && Math.random() > 0.7) {
                chamfer = {
                    radius: 10
                };
            }

            switch (Math.round(Math.random())) {
                case 0:
                    if (Math.random() < 0.8) {
                        return Bodies.rectangle(x, y, Math.random() * (50 + 25) - 25, Math.random() * (50 + 25) - 25, { chamfer: chamfer });
                    } else {
                        return Bodies.rectangle(x, y, Math.random() * (80 + 120) - 80, Math.random() * (25 + 30) - 25, { chamfer: chamfer });
                    }
                case 1:
                    return Bodies.polygon(x, y, sides, Math.random() * (50 + 25) - 25, { chamfer: chamfer });
            }
        });

        World.add(world, stack);

        World.add(world, [
            // walls
            Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
            Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
            Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
            Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
        ]);


        let allBodies = Matter.Composite.allBodies(world);
        for (let body of allBodies) {
            if (body.render.visible) {
                let bodyPrim = new PIXICmp.MatterBody("", body, world);
                this.engine.scene.stage.getPixiObj().addChild(bodyPrim);
            }
        }
    }
}

new MatterExample();


