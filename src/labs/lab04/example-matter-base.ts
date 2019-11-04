import * as ECSA from '../../../libs/pixi-component';
import * as Matter from 'matter-js';
import * as PMath from '../../../libs/pixi-math';
import { GenericComponent } from '../../../libs/pixi-component/components/generic-component';
import { EventObject } from '../../../libs/dragonbones/event/event-object';

export abstract class MatterBase {
  engine: ECSA.GameLoop;
  mEngine: Matter.Engine;
  mWorld: Matter.World;
  random: PMath.Random;

  constructor(view: HTMLCanvasElement) {
    this.engine = new ECSA.GameLoop();
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);
    this.random = new PMath.Random(6489);

    // create engine
    this.mEngine = Matter.Engine.create();
    this.mWorld = this.mEngine.world;

    this.initMatter();
    this.createSyncObjects();
  }

  protected createSyncObjects() {

    // create runner
    let runner = Matter.Runner.create(null);

    // add mouse control
    let mouse = Matter.Mouse.create(this.engine.app.view),
      mouseConstraint = Matter.MouseConstraint.create(this.mEngine, {
        mouse: mouse
      });
    mouse.scale.x = mouse.scale.y = this.engine.app.view.width / this.engine.app.view.getBoundingClientRect().width;
    Matter.World.add(this.mWorld, mouseConstraint);


    // update runner during the ECSA game loop
    this.engine.scene.addGlobalComponent(new GenericComponent('').doOnUpdate((cmp, delta, absolute) => Matter.Runner.tick(runner, this.mEngine, delta)));

    // create object for each body
    let allBodies = Matter.Composite.allBodies(this.mWorld);
    for (let body of allBodies) {
      let pixiObj = new PMath.MatterBody('', body, this.mWorld, { showAngleIndicator: true });
      this.engine.app.stage.addChild(pixiObj);
    }

    // create object for each constraint
    let allConstraints = Matter.Composite.allConstraints(this.mWorld);
    for (let cst of allConstraints) {
      let pixiObj = new PMath.MatterConstraint('', cst as any, this.mWorld);
      this.engine.app.stage.addChild(pixiObj);
    }
  }

  protected abstract initMatter();
}