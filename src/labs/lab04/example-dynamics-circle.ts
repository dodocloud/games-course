import * as ECSA from '../../../libs/pixi-component';


enum IntegrationType {
  EULER_EXPLICIT,
  EULER_IMPROVED,
  EULER_IMPLICIT,
}

abstract class IntegrationCmp extends ECSA.Component {
  velocity: ECSA.Vector;
  acceleration: ECSA.Vector;
  position: ECSA.Vector;
  origin: ECSA.Vector;
  color: number;

  constructor(color: number, velocity: ECSA.Vector, origin: ECSA.Vector) {
    super();
    this.velocity = velocity;
    this.origin = origin;
    this.color = color;
  }

  onInit() {
    // init position
    this.position = new ECSA.Vector(this.owner.position.x, this.owner.position.y);
  }

  abstract updateDynamics(delta: number);

  onUpdate(delta: number, absolute: number) {
    // update acceleration
    this.acceleration = this.origin.subtract(this.position);
    this.updateDynamics(delta * 0.001); // scale time unit a bit
    this.owner.position.set(this.position.x, this.position.y);

    let gr = this.owner.asGraphics();
    gr.clear();
    gr.beginFill(this.color);
    gr.drawCircle(0, 0, 10);
    gr.lineStyle(1, this.color);
    gr.lineTo(this.velocity.x, this.velocity.y);
  }
}

class EulerExplicit extends IntegrationCmp {
  updateDynamics(deltaSec: number) {
    let previousVelocity = this.velocity.clone();
    this.velocity = this.velocity.add(this.acceleration.multiply(deltaSec));
    this.position = this.position.add(previousVelocity.multiply(deltaSec));
    console.log(this.velocity.x, this.velocity.y, this.position.x, this.position.y);
  }
}

class EulerImproved extends IntegrationCmp {
  updateDynamics(deltaSec: number) {
      let previousVelocity = this.velocity.clone();
      this.velocity = this.velocity.add(this.acceleration.multiply(deltaSec));
      this.position = this.position.add(previousVelocity.add(this.velocity).multiply(0.5*deltaSec));
  }
}

class EulerImplicit extends IntegrationCmp {
  updateDynamics(deltaSec: number) {
      this.velocity = this.velocity.add(this.acceleration.multiply(deltaSec));
      this.position = this.position.add(this.velocity.multiply(deltaSec));
  }
}


abstract class ExampleDynamicsBase {
  engine: ECSA.GameLoop;

  constructor(view: HTMLCanvasElement) {
    this.engine = new ECSA.GameLoop();
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);

    let center = new ECSA.Graphics();
    center.beginFill(0xFFFFFF);
    center.drawCircle(this.engine.scene.app.screen.width / 2, this.engine.scene.app.screen.height / 2, 50);
    center.endFill();

    center.lineStyle(2, 0x555555);
    center.arc(this.engine.scene.app.screen.width / 2, this.engine.scene.app.screen.height / 2, this.engine.scene.app.screen.height / 5, 0, 2 * Math.PI, false);
    center.arc(this.engine.scene.app.screen.width / 2, this.engine.scene.app.screen.height / 2, this.engine.scene.app.screen.height / 4, 0, 2 * Math.PI, false);
    center.arc(this.engine.scene.app.screen.width / 2, this.engine.scene.app.screen.height / 2, this.engine.scene.app.screen.height / 3, 0, 2 * Math.PI, false);
    center.arc(this.engine.scene.app.screen.width / 2, this.engine.scene.app.screen.height / 2, this.engine.scene.app.screen.height / 2, 0, 2 * Math.PI, false);

    this.engine.scene.stage.addChild(center);

    this.createProjectile(0xFF0000, this.particleUpdateFreq(), IntegrationType.EULER_EXPLICIT);
    this.createProjectile(0x00FF00, this.particleUpdateFreq(), IntegrationType.EULER_IMPROVED);
    this.createProjectile(0x00FFFF, this.particleUpdateFreq(), IntegrationType.EULER_IMPLICIT);
  }

  abstract particleUpdateFreq(): number;

  private createProjectile(color: number, frequency: number, type: IntegrationType) {
    // will start left from the center
    let velX = 0;
    let velY = this.engine.scene.app.screen.height * (0.5 - 1/3);
    let velocity = new ECSA.Vector(velX, velY);
    let origin = new ECSA.Vector(this.engine.scene.app.screen.width / 2, this.engine.scene.app.screen.height / 2);

    let projectile = new ECSA.Graphics();
    projectile.endFill();
    projectile.pivot.set(1, 1);

    let component: ECSA.Component;

    switch(type) {
      case IntegrationType.EULER_EXPLICIT: component = new EulerExplicit(color, velocity, origin);
      break;
      case IntegrationType.EULER_IMPLICIT: component = new EulerImplicit(color, velocity, origin);
      break;
      case IntegrationType.EULER_IMPROVED: component = new EulerImproved(color, velocity, origin);
      break;
    }

    component.frequency = frequency;

    new ECSA.Builder(this.engine.scene)
    .localPos(this.engine.scene.app.screen.width / 3, this.engine.scene.app.screen.height / 2)
    .withComponent(component)
    .withParent(this.engine.scene.stage)
    .buildInto(projectile);
  }
}

export class ExampleDynamicCircle60 extends ExampleDynamicsBase {
  particleUpdateFreq(): number {
    return 60;
  }
}

export class ExampleDynamicCircle20 extends ExampleDynamicsBase {
  particleUpdateFreq(): number {
    return 20;
  }
}

export class ExampleDynamicCircle5 extends ExampleDynamicsBase {
  particleUpdateFreq(): number {
    return 5;
  }
}