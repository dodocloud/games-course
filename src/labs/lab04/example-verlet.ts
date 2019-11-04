import * as ECSA from '../../../libs/pixi-component';

class VerletParticle {
  pos: ECSA.Vector;
  lastPos: ECSA.Vector;

  constructor(pos: ECSA.Vector) {
    this.pos = pos;
    this.lastPos = pos;
  }

  draw(obj: ECSA.Graphics) {
    obj.lineStyle(0);
    obj.beginFill(0xd54747);
    obj.drawCircle(this.pos.x, this.pos.y, 4);
    obj.endFill();
  }
}

class Constraint {
  relax(stepCoef: number) {

  }

  draw(obj: ECSA.Graphics) {

  }
}

class PinConstraint extends Constraint {
  a: VerletParticle;
  pos: ECSA.Vector;

  constructor(a: VerletParticle, pos: ECSA.Vector) {
    super();
    this.a = a;
    this.pos = pos;
  }

  relax(stepCoeff: number) {
    // update position of the particle
    this.a.pos = this.pos;
  }

  draw(obj: ECSA.Graphics) {
    obj.beginFill(0xFFFFFF, 0.55);
    obj.drawCircle(this.pos.x, this.pos.y, 12);
    obj.endFill();
  }
}

class DistanceConstraint extends Constraint {
  a: VerletParticle;
  b: VerletParticle;
  stiffness: number;
  distance: number;

  constructor(a: VerletParticle, b: VerletParticle, stiffness: number, distance?: number) {
    super();
    this.a = a;
    this.b = b;
    this.stiffness = stiffness;
    if(distance) {
      this.distance = distance;
    } else {
      this.distance = a.pos.distance(b.pos);
    }
  }

  relax(stepCoeff: number) {
    let normal = this.a.pos.subtract(this.b.pos);
    let m = normal.magnitudeSquared();
    normal = normal.multiply(((this.distance * this.distance - m) / m) * this.stiffness * stepCoeff);
    // udpate both particles
    this.a.pos = this.a.pos.add(normal);
    this.b.pos = this.b.pos.subtract(normal);
  }

  draw(obj: ECSA.Graphics) {
    obj.lineStyle(1, 0xd54747);
    obj.moveTo(this.a.pos.x, this.a.pos.y);
    obj.lineTo(this.b.pos.x, this.b.pos.y);
    obj.endFill();
  }
}

class Composite {
  particles: VerletParticle[] = [];
  constraints: Constraint[] = [];

  pin(index: number, pos?: ECSA.Vector) {
    if(pos) {
      this.constraints.push(new PinConstraint(this.particles[index], pos));
      return this.constraints[this.constraints.length - 1];
    } else {
      return this.pin(index, this.particles[index].pos);
    }
  }
}

class Verlet {
  width: number;
  height: number;
  friction: number;
  gravity: ECSA.Vector;
  mouse: ECSA.Vector;

  draggedEntity: VerletParticle;
  composite: Composite;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.friction = 0.99;
    this.gravity = new ECSA.Vector(0, 0.2);
    this.draggedEntity = null;
  }

  frame(step: number) {
    for(let particle of this.composite.particles) {
      // calculate velocity
      let velocity = (particle.pos.subtract(particle.lastPos)).multiply(this.friction);
      // save last good state
      particle.lastPos = particle.pos;
      // gravity
      particle.pos = particle.pos.add(this.gravity);
      // inertia
      particle.pos = particle.pos.add(velocity);
    }


    // The all magic is done here!
    // When the position is shifted by velocity, we need to iterate through all the constraints
    // and call the Relax function that will relax the element along given degree of freedom
    let stepCoeff = 1/step;
    for(let i =0; i<step; i++) {
      for(let constraint of this.composite.constraints) {
        // if you remove this line, all particles drop down along the gravity ECSA.Vector
        constraint.relax(stepCoeff);
      }
    }
  }

  nearestEntity(): VerletParticle {
    if(!this.mouse) {
      return null;
    }

    let selectionRadius = 40;
    let d2Nearest = 0;
    let entity: VerletParticle;
    for(let particle of this.composite.particles) {
      let distToMouse = particle.pos.squareDistance(this.mouse);
      if(distToMouse < (selectionRadius * selectionRadius) && (!entity || distToMouse < d2Nearest)) {
        entity = particle;
        d2Nearest = distToMouse;
      }
    }

    return entity;
  }

  draw(obj: ECSA.Graphics) {
    for(let constraint of this.composite.constraints) {
      constraint.draw(obj);
    }
    for(let particle of this.composite.particles) {
      particle.draw(obj);
    }

    let nearest = this.nearestEntity();
    if(nearest) {
      obj.beginFill(0xACB0FA);
      obj.drawCircle(nearest.pos.x, nearest.pos.y, 8);
      obj.endFill();
    }
  }

  mousePressed(x: number, y: number) {
    this.mouse = new ECSA.Vector(x, y);
    let nearest = this.nearestEntity();
    if(nearest) {
      this.draggedEntity = nearest;
    }
  }

  mouseMoved(x: number, y: number) {
    this.mouse = new ECSA.Vector(x, y);
    if(this.draggedEntity) {
      this.draggedEntity.pos = this.mouse;
    }
  }

  mouseReleased() {
    this.draggedEntity = null;
  }

}

class Cloth extends Verlet {
  constructor(origin: ECSA.Vector, width: number, height: number, segments: number, pinMod: number, stiffness: number) {
    super(width, height);

    this.composite = new Composite();

    let xStride = width / segments;
    let yStride = height / segments;

    for (let y = 0; y < segments; y++) {
      for (let x = 0; x < segments; x++) {
        // calculate absolute coords in pixels
        let px = origin.x + x*xStride - width / 2 + xStride / 2;
        let py = origin.y + y*yStride - height / 2 + yStride / 2;

        // add particle
        this.composite.particles.push(new VerletParticle(new ECSA.Vector(px, py)));

        if (x > 0) {
          // add distance constraint with the previous particle
          let particleA = this.composite.particles[y * segments + x];
          let particleB = this.composite.particles[y * segments + (x - 1)];
          this.composite.constraints.push(new DistanceConstraint(particleA, particleB, stiffness));
        }

        if (y > 0) {
          // add distance constraint with the upper particle
          let particleA = this.composite.particles[y*segments + x];
          let particleB = this.composite.particles[(y - 1)*segments + x];
          this.composite.constraints.push(new DistanceConstraint(particleA, particleB, stiffness));
        }
      }
    }

    // add pins
    for (let x = 0; x < segments; x++) {
      if (x % pinMod === 0) {
        this.composite.pin(x);
      }
    }

  }
}



export class ExampleVerlet {
  engine: ECSA.GameLoop;

  constructor(view: HTMLCanvasElement) {
    this.engine = new ECSA.GameLoop({
      transparent: true,
      antialias: false
    });
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);

    let width = this.engine.app.screen.width;
    let height = this.engine.app.screen.height;

    let cloth = new Cloth(new ECSA.Vector(width / 2, height / 2), width * 2 / 3, height * 2 / 3, 9, 4, 0.1);
    let obj = new ECSA.Graphics('');
    this.engine.app.stage.addChild(obj);



    obj.addComponent(new ECSA.GenericComponent('mm')
      .doOnUpdate((cmp, delta, absolute) => {
        cloth.frame(delta);
        cmp.owner.asGraphics().clear();
        cloth.draw(cmp.owner.asGraphics());
      })
      .doOnMessage(ECSA.PointerMessages.POINTER_DOWN, (cmp, msg) => { cloth.mousePressed(msg.data.mousePos.posX, msg.data.mousePos.posY); })
      .doOnMessage(ECSA.PointerMessages.POINTER_OVER, (cmp, msg) => { cloth.mouseMoved(msg.data.mousePos.posX, msg.data.mousePos.posY); })
      .doOnMessage(ECSA.PointerMessages.POINTER_RELEASE, (cmp, msg) => { cloth.mouseReleased(); })
    );

    obj.addComponent(new ECSA.PointerInputComponent(false, true, true, true));
  }
}