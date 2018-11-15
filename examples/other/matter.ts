import { PixiRunner } from '../../ts/PixiRunner'
import { PIXICmp } from '../../ts/engine/PIXIObject';
import * as Matter from 'matter-js'

// workaround for require
import decomp from 'poly-decomp';
window.decomp = decomp;

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
        var group = Matter.Body.nextGroup(true),
            particleOptions = { friction: 0.00001, collisionFilter: { group: group }, render: { visible: false } },
            constraintOptions = { stiffness: 0.06 },
            cloth = Matter.Composites.softBody(200, 200, 20, 12, 5, 5, false, 8, particleOptions, constraintOptions);

        // make the first row static
        for (var i = 0; i < 20; i++) {
            cloth.bodies[i].isStatic = true;
        }

        // add bodies to the world
        Matter.World.add(world, [
            cloth,
            Matter.Bodies.circle(300, 500, 80, { isStatic: true }),
            Matter.Bodies.rectangle(500, 480, 80, 80, { isStatic: true }),
            Matter.Bodies.rectangle(400, 609, 800, 50, { isStatic: true })
        ]);


        // add bodies and constraints to PIXI
        let allBodies = Matter.Composite.allBodies(world);
        for (let body of allBodies) {
            if (body.render.visible) {
                let bodyPrim = new PIXICmp.MatterBody("", body, world);
                this.engine.scene.stage.getPixiObj().addChild(bodyPrim);
            }
        }

        let allConstraints = Matter.Composite.allConstraints(world);
        for (let constraint of allConstraints) {
            let constraintPrim = new PIXICmp.MatterConstraint("", <Matter.Constraint><any>constraint, world);
            this.engine.scene.stage.getPixiObj().addChild(constraintPrim);
        }
    }
}

new MatterExample();


