import * as ECSA from '../../../libs/pixi-component';
import * as Matter from 'matter-js';
import * as PMath from '../../../libs/pixi-math';
import { GenericComponent } from '../../../libs/pixi-component/components/generic-component';

export abstract class MatterBase {
  engine: ECSA.GameLoop;
  mEngine: Matter.Engine;
  mWorld: Matter.World;
  random: PMath.Random;
  runner: Matter.Runner;

  constructor(view: HTMLCanvasElement) {
    this.engine = new ECSA.GameLoop();
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);
    this.random = new PMath.Random(6489);

    // create engine
    this.mEngine = Matter.Engine.create();
    this.mWorld = this.mEngine.world;

    // create runner
    this.runner = Matter.Runner.create(null);

    // add a new PIXI object when given event is invoked
    Matter.Events.on(this.mWorld, 'afterAdd', (event: any) => {
      this.addNewObject(event);
    });

    this.initMatter();

    // add mouse control
    let mouse = Matter.Mouse.create(this.engine.app.view),
    mouseConstraint = Matter.MouseConstraint.create(this.mEngine, {
      mouse: mouse
    });
    mouse.scale.x = mouse.scale.y = this.engine.app.view.width / this.engine.app.view.getBoundingClientRect().width;
    Matter.World.add(this.mWorld, mouseConstraint);

    // update runner during the ECSA game loop
    this.engine.scene.addGlobalComponent(new GenericComponent('').doOnUpdate((cmp, delta, absolute) => Matter.Runner.tick(this.runner, this.mEngine, delta)));
  }

  protected addNewObject(newObj: any) {
    if(newObj.type === 'body') {
      // single body
      this.engine.app.stage.addChild(new PMath.MatterBody('matter_body_' + newObj.id, newObj, this.mWorld, { showAngleIndicator: true }));
    } else if(newObj.type === 'constraint') {
      this.engine.app.stage.addChild(new PMath.MatterConstraint('matter_constraint_' + newObj.id, newObj, this.mWorld));
    } else if(newObj.object) {
      if(newObj.object.length) {
        // collection of objects inside a composite
        for(let obj of newObj.object) {
          this.addNewObject(obj);
        }
      } else {
        if (newObj.object.body) {
          // single object inside a composite
          this.engine.app.stage.addChild(new PMath.MatterBody('matter_body_' + newObj.object.body.id, newObj.object.body, this.mWorld, { showAngleIndicator: true }));
        }

        if(newObj.object.constraint) {
          // single constraint inside a composite
          this.engine.app.stage.addChild(new PMath.MatterConstraint('matter_constraint_' + newObj.object.constraint.id, newObj.object.constraint, this.mWorld));
        }

        // MatterJS can put the objects to any collection...
        if (newObj.object.bodies) {
          for(let obj of newObj.object.bodies) {
            this.addNewObject(obj);
          }
        }

        if (newObj.object.constraints) {
          for(let cst of newObj.object.constraints) {
            this.addNewObject(cst);
          }
        }

        if(newObj.object.composites) {
          for(let cmp of newObj.object.composites) {
            this.addNewObject(cmp);
          }
        }
      }
    }

    if (newObj.bodies) {
      for(let obj of newObj.bodies) {
        this.addNewObject(obj);
      }
    }
    if (newObj.constraints) {
      for(let cst of newObj.constraints) {
        this.addNewObject(cst);
      }
    }
  }

  protected abstract initMatter();
}