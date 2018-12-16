import { DynamicsComponent } from '../../ts/components/DynamicsComponent';
import Scene from '../../ts/engine/Scene';
import Component from '../../ts/engine/Component';
import Msg from '../../ts/engine/Msg';
import { PIXICmp } from '../../ts/engine/PIXIObject';
import PIXIObjectBuilder from '../../ts/engine/PIXIObjectBuilder';
import Vec2 from '../../ts/utils/Vec2';
import { ATTR_DYNAMICS } from '../../ts/engine/Constants';
import Dynamics from '../../ts/utils/Dynamics';

/**
 * Base class for integration methods
 */
abstract class IntegrationCmp extends Component {

    velocity: Vec2;
    aceleration: Vec2;
    position: Vec2;

    onInit() {
        this.position = new Vec2(this.owner.getPixiObj().position.x, this.owner.getPixiObj().position.y);
    }

    abstract updateDynamics(delta: number);

    onUpdate(delta: number, absolute: number) {
        this.updateDynamics(delta * 0.001);
        this.owner.getPixiObj().position.set(this.position.x, this.position.y);

        // check borders
        if (this.owner.getPixiObj().position.y >= this.scene.app.screen.height) {
            this.owner.remove();
        }
    }
}

/**
 * Euler integration
 */
class EulerIntegration extends IntegrationCmp {
    constructor(velocity: Vec2, aceleration: Vec2) {
        super();
        this.velocity = velocity;
        this.aceleration = aceleration;
    }

    updateDynamics(deltaSec: number) {
        this.velocity = this.velocity.add(this.aceleration.multiply(deltaSec));
        this.position = this.position.add(this.velocity.multiply(deltaSec));

    }
}

/**
 * Improved euler integration 
 */
class EulerImproved extends IntegrationCmp {

    constructor(velocity: Vec2, aceleration: Vec2) {
        super();
        this.velocity = velocity;
        this.aceleration = aceleration;
    }

    updateDynamics(deltaSec: number) {
        let previous = this.velocity.clone();
        this.velocity = this.velocity.add(this.aceleration.multiply(deltaSec));
        this.position = this.position.add(this.velocity.add(previous).multiply(0.5*deltaSec));
    }
}

/**
 * Velocity verlet integration
 */
class VelocityVerletIntegration extends IntegrationCmp {

    constructor(velocity: Vec2, aceleration: Vec2) {
        super();
        this.velocity = velocity;
        this.aceleration = aceleration;
    }

    updateDynamics(deltaSec: number) {
        this.position = this.position.add(this.velocity.multiply(deltaSec).add(this.aceleration.multiply(0.5*deltaSec*deltaSec)));
        this.velocity = this.velocity.add(this.aceleration.multiply(deltaSec));
    }
}

/**
 * Cannon component that emits 3 projectiles once per 3 seconds
 */
class CannonComponent extends Component {
    lastShot = 0;

    onUpdate(delta: number, absolute: number) {
        if ((absolute - this.lastShot) > 2000) {
            this.lastShot = absolute;
           
            // create a new projectile
            let velX = 100 * Math.cos(this.owner.getPixiObj().rotation);
            let velY = 100 * Math.sin(this.owner.getPixiObj().rotation);

            // white projectile with euler integration
            let projectile = new PIXICmp.Graphics("");
            projectile.beginFill(0xFFFFFF);
            projectile.drawCircle(0, 0, 2);
            projectile.endFill();
            projectile.pivot.set(1, 1);

            new PIXIObjectBuilder(this.scene)
                .localPos(this.owner.getPixiObj().position.x, this.owner.getPixiObj().position.y)
                .withComponent(new EulerIntegration(new Vec2(velX, velY), new Vec2(0, 0.75 * Math.sqrt(this.scene.app.screen.height))))
                .build(projectile, this.scene.stage);

            // green projectile with improved euler integration
            let projectile2 = new PIXICmp.Graphics("");
            projectile2.beginFill(0x00FF00);
            projectile2.drawCircle(0, 0, 3);
            projectile2.endFill();
            projectile2.pivot.set(1, 1);

            new PIXIObjectBuilder(this.scene)
                .localPos(this.owner.getPixiObj().position.x, this.owner.getPixiObj().position.y)
                .withComponent(new EulerImproved(new Vec2(velX, velY), new Vec2(0, 0.75 * Math.sqrt(this.scene.app.screen.height))))
                .build(projectile2, this.scene.stage);

            // red projectile with velocity verlet integration
            let projectile3 = new PIXICmp.Graphics("");
            projectile3.beginFill(0xFF0000);
            projectile3.drawCircle(0, 0, 2);
            projectile3.endFill();
            projectile3.pivot.set(1, 1);

            new PIXIObjectBuilder(this.scene)
                .localPos(this.owner.getPixiObj().position.x, this.owner.getPixiObj().position.y)
                .withComponent(new VelocityVerletIntegration(new Vec2(velX, velY), new Vec2(0, 0.75 * Math.sqrt(this.scene.app.screen.height))))
                .build(projectile3, this.scene.stage);
        }
    }
}

export class Integrations {
    init(scene: Scene) {
        scene.clearScene();

        let cannon = new PIXICmp.Graphics("CANNON");
        cannon.beginFill(0xFF0000);
        cannon.drawPolygon([0, 0, 40, 0, 40, 20, 0, 20, 0, 0]);
        cannon.endFill();
        cannon.pivot.set(cannon.width / 2, cannon.height / 2);
        cannon.position.set(scene.app.screen.width * 0.03, scene.app.screen.height * 0.9);
        cannon.rotation = -Math.PI / 3;
        cannon.addComponent(new CannonComponent());
        scene.stage.getPixiObj().addChild(cannon);
    }
}
