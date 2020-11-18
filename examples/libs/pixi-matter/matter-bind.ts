import * as ECS from '../pixi-ecs';
import * as Math from '../aph-math';
import * as Matter from 'matter-js';
import { MatterBody } from './matter-body';
import {MatterConstraint} from './matter-constraint';

export type MatterBindConfig = {
	mouseControl?: boolean,
	renderConstraints?: boolean,
	renderAngles?: boolean,
}

/**
 * Binder class for all Matter-JS projects
 */
export class MatterBind {
	mEngine: Matter.Engine;
	mWorld: Matter.World;
	runner: Matter.Runner;
	config: MatterBindConfig;
	scene: ECS.Scene;

	init(scene: ECS.Scene, config?: MatterBindConfig) {
		// create matterJS engine
		this.mEngine = Matter.Engine.create();
		this.mWorld = this.mEngine.world;
		this.scene = scene;
	
		this.config = {
			mouseControl: true,
			renderConstraints: true,
			renderAngles: true,
			...config
		}

		// create runner
		this.runner = Matter.Runner.create(null);

		// add a new PIXI object when given event is invoked
		Matter.Events.on(this.mWorld, 'afterAdd', (event: any) => {
			this.addNewObject(event, scene);
        });

		// add mouse control
		if(this.config.mouseControl) {
			let mouse = Matter.Mouse.create(scene.app.view),
				mouseConstraint = Matter.MouseConstraint.create(this.mEngine, {
					mouse: mouse
				});
			mouse.scale.x = mouse.scale.y = scene.app.view.width / scene.app.view.getBoundingClientRect().width;
			Matter.World.add(this.mWorld, mouseConstraint);
		}
		// update runner during the ECSA game loop
		scene.addGlobalComponent(new ECS.FuncComponent('').doOnUpdate((_, delta) => Matter.Runner.tick(this.runner, this.mEngine, delta)));
	}

	/**
	 * Adds a new body to the matter world and returns sync PIXI-ECS object
	 * @param body body to add
	 */
	addBody(body: Matter.Body) {
		Matter.World.add(this.mWorld, [body]);
		return this.findSyncObjectForBody(body);
	}

	/**
	 * Adds a new contraint to the matter world and returns sync PIXI-ECS object
	 * @param constraint constraint to add
	 */
	addConstraint(constraint: Matter.Constraint) {
		Matter.World.add(this.mWorld, [constraint]);
		return this.findSyncObjectForConstraint(constraint);
	}

	/**
	 * Finds a PIXI-ECS sync object for given MatterJS object
	 */
	findSyncObjectForBody(body: Matter.Body) {
		return this.scene.findObjectByName(`matter_body_${body.id}`);
	}

	/**
	 * Finds a PIXI-ECS sync object for given MatterJS constraint
	 */
	findSyncObjectForConstraint(constraint: Matter.Constraint) {
		return this.scene.findObjectByName(`matter_constraint_${constraint.id}`);
	}

	protected addNewObject(newObj: any, scene: ECS.Scene) {
		if (newObj.type === 'body') {
			// single body
			scene.stage.addChild(new MatterBody('matter_body_' + newObj.id, newObj, 
			this.mWorld, { showAngleIndicator: this.config.renderAngles }));
		} else if (newObj.type === 'constraint' && this.config.renderConstraints) {
			// single constraint
			scene.stage.addChild(new MatterConstraint('matter_constraint_' + newObj.id, newObj, 
			this.mWorld));
		} else if (newObj.object) {
			if (newObj.object.length) {
				// collection of objects inside a composite
				for (let obj of newObj.object) {
					this.addNewObject(obj, scene);
				}
			} else {
				if (newObj.object.body) {
					// single object inside a composite
					scene.stage.addChild(new MatterBody('matter_body_' + newObj.object.body.id, newObj.object.body,
					 this.mWorld, { showAngleIndicator: this.config.renderAngles }));
				}

				if (newObj.object.constraint && this.config.renderConstraints) {
					// single constraint inside a composite
					scene.stage.addChild(new MatterConstraint('matter_constraint_' + newObj.object.constraint.id, newObj.object.constraint, this.mWorld));
				}

				// MatterJS can put the objects to any collection...
				if (newObj.object.bodies) {
					for (let obj of newObj.object.bodies) {
						this.addNewObject(obj, scene);
					}
				}

				if (newObj.object.constraints && this.config.renderConstraints) {
					for (let cst of newObj.object.constraints) {
						this.addNewObject(cst, scene);
					}
				}

				if (newObj.object.composites) {
					for (let cmp of newObj.object.composites) {
						this.addNewObject(cmp, scene);
					}
				}
			}
		}

		// inner bodies
		if (newObj.bodies) {
			for (let obj of newObj.bodies) {
				this.addNewObject(obj, scene);
			}
		}
		// inner constraints
		if (newObj.constraints && this.config.renderConstraints) {
			for (let cst of newObj.constraints) {
				this.addNewObject(cst, scene);
			}
		}
	}
}
