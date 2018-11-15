import Component from '../../ts/engine/Component';
import DebugComponent from '../../ts/components/DebugComponent';
import Scene from '../../ts/engine/Scene';
import { PixiRunner } from '../../ts/PixiRunner'
import { PIXICmp } from '../../ts/engine/PIXIObject';
import * as Matter from 'matter-js'
import ChainingComponent from '../../ts/components/ChainingComponent';


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
        var group = Matter.Body.nextGroup(true);

        var bridge = Matter.Composites.stack(160, 290, 15, 1, 0, 0, function (x, y) {
            return Bodies.rectangle(x - 20, y, 53, 20, {
                collisionFilter: { group: group },
                chamfer: 5,
                density: 0.005,
                frictionAir: 0.05,
                render: {
                    fillStyle: '#575375'
                }
            });
        });


        Matter.Composites.chain(bridge, 0.3, 0, -0.3, 0, {
            stiffness: 1,
            length: 0,
            render: {
                visible: false
            }
        });

        var stack = Matter.Composites.stack(250, 50, 6, 3, 0, 0, function (x, y) {
            return Bodies.rectangle(x, y, 50, 50, Math.random() * 20 + 20);
        });


        Matter.World.add(world, [
            bridge,
            stack,
            Bodies.rectangle(30, 490, 220, 380, {
                isStatic: true,
                chamfer: { radius: 20 }
            }),
            Bodies.rectangle(770, 490, 220, 380, {
                isStatic: true,
                chamfer: { radius: 20 }
            }),
            Matter.Constraint.create({
                pointA: { x: 140, y: 300 },
                bodyB: bridge.bodies[0],
                pointB: { x: -25, y: 0 },
                length: 2,
                stiffness: 0.9
            }),
            Matter.Constraint.create({
                pointA: { x: 660, y: 300 },
                bodyB: bridge.bodies[bridge.bodies.length - 1],
                pointB: { x: 25, y: 0 },
                length: 2,
                stiffness: 0.9
            })
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


