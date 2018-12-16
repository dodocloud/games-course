import { CameraComponent } from './../../ts/components/CameraComponent';
import Component from '../../ts/engine/Component';
import Scene from '../../ts/engine/Scene';
import { PIXICmp } from '../../ts/engine/PIXIObject';
import * as Matter from 'matter-js'


// workaround for require
import decomp from 'poly-decomp';
import { KeyInputComponent, KEY_LEFT, KEY_RIGHT, KEY_UP } from '../../ts/components/KeyInputComponent';
import { CameraComponent } from '../../ts/components/CameraComponent';
window.decomp = decomp;

/**
 * Controller for platforms that will move them upwards
 */
class PlatformComponent extends Component {
    private shift = 0;
    private platformHeight = 0;

    constructor(shift: number, platformHeight: number) {
        super();
        this.shift = shift;
        this.platformHeight = platformHeight;
    }

    onUpdate(delta: number, absolute: number) {
        let ownerMatter = <PIXICmp.MatterBody>this.owner.getPixiObj();
        if(ownerMatter.body.position.y -1 >= -this.platformHeight) {
            Matter.Body.setPosition(ownerMatter.body, {
                x: ownerMatter.body.position.x, 
                y: ownerMatter.body.position.y - 1
            })
        } else {
            Matter.Body.setPosition(ownerMatter.body, {
                x: ownerMatter.body.position.x,
                y: ownerMatter.body.position.y + this.shift
            })
        }
    }
}

/**
 * Controller of the cube
 */
class CubeController extends Component {
    onUpdate(delta: number, absolute: number) {
        let cmp = this.scene.stage.findComponentByClass(KeyInputComponent.name);
        let cmpKey = <KeyInputComponent><any>cmp;
        let ownerMatter = <PIXICmp.MatterBody>this.owner.getPixiObj();

        if(cmpKey.isKeyPressed(KEY_LEFT)){
            Matter.Body.applyForce(ownerMatter.body, {x: ownerMatter.body.position.x, y: ownerMatter.body.position.y},
                {x: -0.03, y: 0.0});
        }

        if(cmpKey.isKeyPressed(KEY_RIGHT)){
            Matter.Body.applyForce(ownerMatter.body, {x: ownerMatter.body.position.x, y: ownerMatter.body.position.y},
                {x: 0.03, y: 0.0});
        }

        if(cmpKey.isKeyPressed(KEY_UP)){
            Matter.Body.applyForce(ownerMatter.body, {x: ownerMatter.body.position.x, y: ownerMatter.body.position.y},
                {x: 0, y: -0.1});
        }
    }
}

export class MatterExample {

    // Start a new game
    init(scene: Scene) {

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

        
        let sWidth = scene.app.screen.width;
        let sHeight = scene.app.screen.height;
        let spaceHeight = sHeight * 0.25;
        let spaceWidth = sWidth * 0.3;

        let cubeSize = Math.min(spaceWidth * 0.75, spaceHeight * 0.75);
        let platformHeight = sHeight * 0.1;
        let platformWidth = sWidth - spaceWidth;
        let platformNum = Math.ceil(sHeight / (platformHeight + spaceHeight)) + 1;

        let platformIds = new Set<number>();
        let cubeId = 0;

        // add platforms
        for (let i = 0; i < platformNum; i++) {
            let x = (i % 2 == 0) ? spaceWidth : 0;
            let y = (platformHeight + spaceHeight) * i;
            // set to the center
            x += platformWidth / 2;
            y += platformHeight / 2;

            let body = Bodies.rectangle(x, y, platformWidth, platformHeight, { isStatic: true });
            // store id so that we can link it with PIXI
            platformIds.add(body.id);


            World.add(world, [
                body
            ]);
        }

        let wallSize = 50;

        // add walls to prevent the cube from falling to left and right
        World.add(world, [
            Bodies.rectangle(-wallSize / 2, sHeight / 2, wallSize, sHeight * 2, { isStatic: true }),
            Bodies.rectangle(sWidth + wallSize / 2, sHeight / 2, wallSize, sHeight * 2, { isStatic: true })
        ]);

        let cube = Bodies.rectangle(cubeSize / 2, spaceHeight + cubeSize / 2, cubeSize, cubeSize);
        cubeId = cube.id;
        World.add(world, cube);

        // add objects to PIXIJS
        let allBodies = Matter.Composite.allBodies(world);
        for (let body of allBodies) {
            if (body.render.visible) {
                let bodyPrim: PIXICmp.MatterBody;
                
                // distinguish between platforms and the cube
                if (platformIds.has(body.id)) {
                    bodyPrim = new PIXICmp.MatterBody("", body, world);
                    bodyPrim.addComponent(new PlatformComponent((platformHeight + spaceHeight) * platformNum, platformHeight));
                }else if (body.id == cubeId) {
                    let options = new PIXICmp.MatterBodyOptions();
                    options.fillStyle = "0xFF0000";
                    options.strokeStyle = "0xFFFFFF";
                    bodyPrim = new PIXICmp.MatterBody("", body, world, options);
                    bodyPrim.addComponent(new CubeController());
                    let camera = new CameraComponent();
                    camera.lookAt(bodyPrim);
                    bodyPrim.addComponent(camera);
                } else {
                    bodyPrim = new PIXICmp.MatterBody("", body, world);
                }

                scene.stage.getPixiObj().addChild(bodyPrim);
            }
        }

        // add key controller
        scene.stage.addComponent(new KeyInputComponent());
    }
}


