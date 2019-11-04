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
  color: number;

  constructor(color: number, velocity: ECSA.Vector, acceleration: ECSA.Vector) {
    super();
    this.color = color;
    this.velocity = velocity;
    this.acceleration = acceleration;
  }

  onInit() {
    // init position
    this.position = new ECSA.Vector(this.owner.position.x, this.owner.position.y);
  }

  abstract updateDynamics(delta: number);

  onUpdate(delta: number, absolute: number) {
      this.updateDynamics(delta * 0.003); // scale time unit a bit
      this.owner.position.set(this.position.x, this.position.y);

      let gr = this.owner.asGraphics();
      gr.clear();
      gr.beginFill(this.color);
      gr.drawCircle(0, 0, 10);
      gr.lineStyle(1, this.color);
      gr.lineTo(this.velocity.x, this.velocity.y);

      // check borders
      if (this.owner.position.y >= this.scene.app.screen.height) {
          this.owner.remove();
      }
  }
}

class EulerExplicit extends IntegrationCmp {
  updateDynamics(deltaSec: number) {
    let previousVelocity = this.velocity.clone();
    this.velocity = this.velocity.add(this.acceleration.multiply(deltaSec));
    this.position = this.position.add(previousVelocity.multiply(deltaSec));
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


class EmitterComponent extends ECSA.Component {

  particleFreq: number;

  constructor(frequency: number) {
    super();
    this.frequency = 0.5;
    this.particleFreq = frequency;
  }

  onUpdate(delta: number, absolute: number) {
    // first projectile won't be visible (there is a strange bug in PIXI)
    this.createProjectile(0xFFFFFF, 0.0, IntegrationType.EULER_EXPLICIT);
    this.createProjectile(0xFF0000, 1.0, IntegrationType.EULER_EXPLICIT);
    this.createProjectile(0x00FF00, 1.0, IntegrationType.EULER_IMPROVED);
    this.createProjectile(0x00FFFF, 1.0, IntegrationType.EULER_IMPLICIT);
  }

  private createProjectile(color: number, alpha: number, type: IntegrationType) {
    // magic velocity
    let velX = Math.sqrt(this.scene.app.screen.width) * Math.cos(this.owner.rotation)*4;
    let velY = Math.sqrt(this.scene.app.screen.width) * Math.sin(this.owner.rotation)*4;
    let velocity = new ECSA.Vector(velX, velY);
    let acceleration = new ECSA.Vector(0, 0.75 * Math.sqrt(this.scene.app.screen.height));

    let projectile = new ECSA.Graphics();
    projectile.pivot.set(1, 1);
    projectile.alpha = alpha;

    let component: ECSA.Component;

    switch(type) {
      case IntegrationType.EULER_EXPLICIT: component = new EulerExplicit(color, velocity, acceleration);
      break;
      case IntegrationType.EULER_IMPLICIT: component = new EulerImplicit(color, velocity, acceleration);
      break;
      case IntegrationType.EULER_IMPROVED: component = new EulerImproved(color, velocity, acceleration);
      break;
    }

    component.frequency = this.particleFreq;

    new ECSA.Builder(this.scene)
    .localPos(this.owner.position.x, this.owner.position.y)
    .withComponent(component)
    .withParent(this.scene.stage)
    .buildInto(projectile);
  }
}

abstract class ExampleDynamicsBase {
  engine: ECSA.GameLoop;

  constructor(view: HTMLCanvasElement) {
    this.engine = new ECSA.GameLoop();
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);


    let emitter = new ECSA.Graphics('emitter');
    emitter.beginFill(0xFF0000);
    emitter.drawPolygon([0, 0, 40, 0, 40, 20, 0, 20, 0, 0]);
    emitter.endFill();
    emitter.pivot.set(emitter.width / 2, emitter.height / 2);
    emitter.position.set(this.engine.scene.app.screen.width * 0.03, this.engine.scene.app.screen.height * 0.9);
    emitter.rotation = -Math.PI / 3;
    emitter.addComponent(new EmitterComponent(this.particleUpdateFreq()));
    this.engine.scene.stage.addChild(emitter);
  }

  abstract particleUpdateFreq(): number;
}

export class ExampleDynamicBallistic60 extends ExampleDynamicsBase {
  particleUpdateFreq(): number {
    return 60;
  }
}

export class ExampleDynamicBallistic20 extends ExampleDynamicsBase {
  particleUpdateFreq(): number {
    return 20;
  }
}

export class ExampleDynamicBallistic5 extends ExampleDynamicsBase {
  particleUpdateFreq(): number {
    return 5;
  }
}