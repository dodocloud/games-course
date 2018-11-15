import { DynamicsComponent } from './../../ts/components/DynamicsComponent';
import Scene from '../../ts/engine/Scene';
import Component from '../../ts/engine/Component';
import Msg from '../../ts/engine/Msg';
import { PIXICmp } from '../../ts/engine/PIXIObject';
import PIXIObjectBuilder from '../../ts/engine/PIXIObjectBuilder';
import { SteeringMath } from '../../ts/utils/SteeringMath';
import Vec2 from '../../ts/utils/Vec2';
import Dynamics from '../../ts/utils/Dynamics';
import { ATTR_DYNAMICS } from '../../ts/engine/Constants';
import { Path, PathContext } from '../../ts/utils/Path';


/**
 * Base class for all steering components
 */
abstract class SteeringComponent extends DynamicsComponent {
    math = new SteeringMath();

    onInit() {
        super.onInit();
        this.dynamics.velocity.x = 1;
        this.dynamics.velocity.y = 1;
    }

    protected abstract calcForce(delta: number): Vec2;


    onUpdate(delta: number, absolute: number) {

        // update dynamics and set new position
        let force = this.calcForce(delta);
        this.dynamics.aceleration = force;
        this.dynamics.aceleration = this.dynamics.aceleration.limit(30);
        this.dynamics.velocity = this.dynamics.velocity.limit(30);
        super.onUpdate(delta, absolute);

        // change rotation based on the velocity
        let currentAngle = Math.atan2(this.dynamics.velocity.y, this.dynamics.velocity.x);
        let ownerPx = this.owner.getPixiObj();
        ownerPx.rotation = currentAngle;

        // check borders - object will be moved to the opposite side of the scene
        let bbox = ownerPx.getBounds();
        let area = new PIXI.Rectangle(0, 0, this.scene.app.screen.width, this.scene.app.screen.height);

        if (bbox.right < area.left && this.dynamics.velocity.x < 0) {
            ownerPx.position.x += (area.width + bbox.width);
        }

        if (bbox.left > area.right && this.dynamics.velocity.x > 0) {
            ownerPx.position.x -= (area.width + bbox.width);
        }

        if (bbox.bottom < area.top && this.dynamics.velocity.y < 0) {
            ownerPx.position.y += (area.height + bbox.height);
        }

        if (bbox.top > area.bottom && this.dynamics.velocity.y > 0) {
            ownerPx.position.y -= (area.height + bbox.height);
        }
    }
}

/**
 * Component for Seek
 */
class SeekSteering extends SteeringComponent {
    target: PIXI.Container;

    constructor(target: PIXI.Container) {
        super(10);
        this.target = target;
    }

    protected calcForce(delta: number): Vec2 {
        let targetPos = new Vec2(this.target.position.x, this.target.position.y);
        let ownerPos = new Vec2(this.owner.getPixiObj().position.x, this.owner.getPixiObj().position.y);
        return this.math.seek(targetPos, ownerPos, this.dynamics.velocity, 60, 100);
    }
}

/**
 * Component for Evade
 */
class EvadeSteering extends SteeringComponent {
    target: PIXICmp.ComponentObject;

    constructor(target: PIXICmp.ComponentObject) {
        super(5);
        this.target = target;
    }

    protected calcForce(delta: number): Vec2 {
        let targetPos = new Vec2(this.target.getPixiObj().position.x, this.target.getPixiObj().position.y);
        let ownerPos = new Vec2(this.owner.getPixiObj().position.x, this.owner.getPixiObj().position.y);
        let targetVelocity = (<Dynamics>this.target.getAttribute(ATTR_DYNAMICS)).velocity;
        return this.math.evade(targetPos, ownerPos, 300, this.dynamics.velocity, targetVelocity);
    }
}

/**
 * Component for Pursuit
 */
class PursuitSteering extends SteeringComponent {
    target: PIXICmp.ComponentObject;

    constructor(target: PIXICmp.ComponentObject) {
        super(3);
        this.target = target;
    }

    protected calcForce(delta: number): Vec2 {
        let targetPos = new Vec2(this.target.getPixiObj().position.x, this.target.getPixiObj().position.y);
        let ownerPos = new Vec2(this.owner.getPixiObj().position.x, this.owner.getPixiObj().position.y);
        let targetVelocity = (<Dynamics>this.target.getAttribute(ATTR_DYNAMICS)).velocity;
        return this.math.pursuit(targetPos, ownerPos, 30, this.dynamics.velocity, targetVelocity);
    }
}

/**
 * Component for Follow
 */
class FollowSteering extends SteeringComponent {

    path: Path;
    context: PathContext;

    constructor(path: Path) {
        super(3);
        this.path = path;
        this.context = new PathContext();
    }

    onInit() {
        super.onInit();
    }

    protected calcForce(delta: number): Vec2 {
        let ownerPos = new Vec2(this.owner.getPixiObj().position.x, this.owner.getPixiObj().position.y);
        return this.math.follow(ownerPos, this.dynamics.velocity, this.path, this.context, 40, 40, 30, 40);
    }
}

/**
 * Component for Wander
 */
class WanderSteering extends SteeringComponent {
    wanderTarget = new Vec2(0, 0);
    angle = 0;
    triangle: PIXI.Container;
    circle: PIXI.Container;
    dot: PIXI.Container;
    wanderDistance: number;
    wanderRadius: number;
    wanderJittering: number;

    constructor(wanderDistance: number, wanderRadius: number, wanderJittering: number) {
        super(10);
        this.wanderDistance = wanderDistance;
        this.wanderRadius = wanderRadius;
        this.wanderJittering = wanderJittering;
    }

    onInit() {
        super.onInit();
        this.triangle = this.scene.findFirstObjectByTag("TRIANGLE").getPixiObj();
        this.circle = this.scene.findFirstObjectByTag("CIRCLE").getPixiObj();
        this.dot = this.scene.findFirstObjectByTag("DOT").getPixiObj();
    }

    protected calcForce(delta: number): Vec2 {
        return this.math.wander(this.dynamics, this.wanderTarget, this.wanderRadius, this.wanderDistance, this.wanderJittering, delta);
    }

    onUpdate(delta: number, absolute: number) {
        super.onUpdate(delta, absolute);

        let desiredAngle = Math.atan2(this.dynamics.aceleration.y, this.dynamics.aceleration.x);
        let currentAngle = Math.atan2(this.dynamics.velocity.y, this.dynamics.velocity.x);

        this.triangle.rotation = - Math.PI / 2;
        this.dot.position.set(this.wanderDistance + Math.cos(desiredAngle - currentAngle) * this.wanderRadius, Math.sin(desiredAngle - currentAngle) * this.wanderRadius);
        this.circle.position.set(this.wanderDistance, 0);
    }
}

export class Steering {
    init(scene: Scene) {
        scene.clearScene();

        // ====================== SEEK BEHAVIOR ==========================
        let target = new PIXICmp.Graphics("TARGET");
        target.beginFill(0xCDCD00);
        target.drawCircle(0, 0, 10);
        target.endFill();
        target.position.x = scene.app.screen.width / 3;
        target.position.y = scene.app.screen.height / 3;
        scene.stage.getPixiObj().addChild(target);

        let seekPoint = new PIXICmp.Graphics("SEEK");
        seekPoint.beginFill(0xFF0000);
        seekPoint.drawPolygon([-10, -10, -10, 10, 15, 0]);
        seekPoint.endFill();
        scene.stage.getPixiObj().addChild(seekPoint);
        seekPoint.addComponent(new SeekSteering(target));

        // ====================== EVADE BEHAVIOR ==========================

        let evadePoint = new PIXICmp.Graphics("EVADE");
        evadePoint.beginFill(0xFF0000);
        evadePoint.drawPolygon([-10, -10, -10, 10, 15, 0]);
        evadePoint.endFill();
        evadePoint.position.set(scene.app.screen.width / 4, scene.app.screen.height / 2);
        scene.stage.getPixiObj().addChild(evadePoint);
        evadePoint.addComponent(new EvadeSteering(seekPoint));
        // TODO: set visibility to true
        evadePoint.visible = false;

        // ====================== PURSUIT BEHAVIOR ==========================

        let pursuitPoint = new PIXICmp.Graphics("PURSUIT");
        pursuitPoint.beginFill(0xF00FFF);
        pursuitPoint.drawPolygon([-10, -10, -10, 10, 15, 0]);
        pursuitPoint.endFill();
        pursuitPoint.position.set(scene.app.screen.width / 4, scene.app.screen.height / 2);
        scene.stage.getPixiObj().addChild(pursuitPoint);
        pursuitPoint.addComponent(new PursuitSteering(seekPoint));
        // TODO: set visibility to true
        pursuitPoint.visible = false;
        // ====================== FOLLOW BEHAVIOR ==========================

        let followPoint = new PIXICmp.Graphics("FOLLOW");
        followPoint.beginFill(0x00F0F0);
        followPoint.drawPolygon([-10, -10, -10, 10, 15, 0]);
        followPoint.endFill();
        followPoint.position.set(scene.app.screen.width / 8, scene.app.screen.height / 4);
        scene.stage.getPixiObj().addChild(followPoint);

        let path = new Path(new Vec2(50, 50), new Vec2(150, 150));
        // TODO add segments to the path
        //path.addSegment(new Vec2(100, 60));
        followPoint.addComponent(new FollowSteering(path));

        /*  TODO: uncomment this to display path segments
            for (let segment of path.segments) {
            let seg = new PIXICmp.Graphics("");
            seg.lineStyle(2, 0xFF00FF);
            seg.drawCircle(0, 0, 5);
            seg.endFill();
            seg.position.set(segment.start.x, segment.start.y);
            scene.stage.getPixiObj().addChild(seg);
        }*/
        // TODO: set visibility to true
        followPoint.visible = false;
        // ====================== WANDER BEHAVIOR ==========================

        let wanderDistance = 10;
        let wanderRadius = 200;
        let wanderJittering = 10;

        let parent = new PIXICmp.Container("PARENT");
        scene.app.stage.addChild(parent);

        let circle = new PIXICmp.Graphics("CIRCLE");
        circle.lineStyle(2, 0xFF00FF);
        circle.drawCircle(0, 0, wanderRadius);
        circle.endFill();
        parent.addChild(circle);

        let dot = new PIXICmp.Graphics("DOT");
        dot.beginFill(0xFFFFFF);
        dot.drawCircle(0, 0, 10);
        dot.endFill();
        parent.addChild(dot);

        let wanderPoint = new PIXICmp.Graphics("TRIANGLE");
        wanderPoint.beginFill(0xFF0000);
        wanderPoint.drawPolygon([-10, -15, 10, -15, 0, 15]);
        wanderPoint.endFill();
        parent.addChild(wanderPoint);
        parent.position.set(scene.app.screen.width / 2, scene.app.screen.height / 2);
        parent.addComponent(new WanderSteering(wanderDistance, wanderRadius, wanderJittering));

        // TODO: set visibility to true
        parent.visible = false;
    }
}