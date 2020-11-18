---
title: Matter JS
---

import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from '@site/src/css/docs.module.scss';

## JavaScript math functions
- `Math.pow(x, y)` - returns the value of x to the power of y
- `Math.sqrt(x)` - returns the square root of x
- `Math.ceil(x)` - returns the value of x rounded up to its nearest integer
- `Math.floor(x)` - returns the value of x rounded down to its nearest integer
- `Math.trunc(x)` - returns the integer portion of a number
- `~a` - inverts the bits of its operand
- `a << b` - shifts a in b bits to the left
- `a >> b` - shifts a in b bits to the right
- `a >>> b` - shifts a in b bits to the right, shifting in 0s from the left
- `Math.atan(x)` - returns the arctangent (in radians) of a number
- `Math.atan2(y, x)` - returns the angle in the plane (in radians) between the positive x-axis and the ray from (0, 0) to the point (x, y)
- `Math.random()` - generates a random number in range (0, 1)
- `min + Math.floor((max - min + 1) * Math.random())` - generates a random integer in range [min, max] exclusively
`Math.random() > (1 - probability)` - checks for an occurrence of an event at given probability
- **for each bitwise operations, the operators are converted into 32-bit integers**
- every bitwise operation converts numbers into integers (removing the fraction part)
- if we work with positive numbers, `~~v` is a common choice to get the integer part

|value/func|`trunc`|`floor`|`ceil`|`round`|`~~x`| x&#124;0 | `x << 0`| `x >> 0` |
|---|---|--|--|--|--|--|--|--|
|3.8|3|3|4|4|3|3|3|3|
|3.2|3|3|4|3|3|3|3|3|
|-3.2|-3|-4|-3|-3|-3|-3|-3|-3|
|-3.8|-3|-4|-3|-4|-3|-3|-3|-3|

- [Missile example](../examples/dynamics/missile)

## MatterJS
- [https://brm.io/matter-js/](https://brm.io/matter-js/)
- 2D physics engine
- features
  - rigid bodies, compound bodies, composite bodies, concave and convex hulls, restitution, momentum, friction, events, constraints, gravity, sleeping bodies, static bodies

### Architecture
- `Body` - static class that contains methods for creating and manipulating body models
- `IBodyDefinition` - a structure that keeps all attributes
- `ICompositeDefinition` - a structure that defines composite objects, consisting of bodies and constraints
- `Composite` - static class that contains methods for manipulating with composite objects
- `IPair` - contains attributes for a colliding pair of two bodies
- `IConstraintDefinition` - contains attributes for a constraint that connects bodies together in order to simulate interaction
- `Events`
  - `sleepStart`, `sleepEnd`, `beforeAdd`, `afterAdd`, `beforeRemove`, `afterRemove`, `afterUpdate`, `beforeRender`, `afterRender`, `beforeUpdate`, `collisionActive`, `collisionEnd`, `collisionStart`, `beforeTick`, `tick`, `afterTick`, `beforeRender`, `afterRender`, `mousedown`, `mousemove`, `mouseup`
- `Bodies` - static class with methods for creating new simple bodies
- `Composites` - static class with methods for creating complex objects
  - `car` - creates a composite with simple car setup of bodies and constraints
  - `chain` - chains all bodies in the given composite together using constraints
  - `mesh` - connects bodies in the composite with constraints in a grid pattern
  - `softBody` - creates a simple soft body
- `Bounds` - static methods for defining outer bounds of the scene

<div className={styles.figure}>
  <img className={styles.fill} src={useBaseUrl('img/docs/tutorials/06-matterjs/architecture.svg')} />
</div>

### Simple setup

```typescript
let engine = Matter.Engine.create();
let world = engine.world;
let render = Matter.Render.create({ 
    element: document.body,
    engine: engine });

Render.run(render);
 
// insert objects
Matter.World.add(world, Matter.Composites.car(150, 100, 150, 30, 30));
 
let runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);
// set camera
Matter.Render.lookAt(render, {
  min: { x: 0, y: 0 },
  max: { x: 800, y: 600 }
});
```

### MatterJS and PIXI
- MatterJS has its own renderer
- in order to connect MatterJS to Pixi, we need to create a copy of every MatterJS body and synchronize it
- there is a small library in `libs/pixi-matter` that connects MatterJS to `pixi-ecs`, by means of `MatterBind` class
- update can be handled either automatically by `MatterJS.Runner` or manually by invoking `Matter.Runner.tick` 
- examples of how to use it can be found in `examples/06-physics`
- PIXI objects synchronize their positions and rotations with their MatterJS counterparts. As such, you need to move with MatterJS objects in order to move with PIXI objects that are synchronized with them, **not the other way round!**
- keep in mind that `pixi-matter` is experimental and will require some additional work, if you wanna use it for your game

```typescript
// create binder
const binder = new PixiMatter.MatterBind();
binder.init(this.engine.scene, {
        mouseControl: true, // allows mouse control of MatterJS object
        renderConstraints: true, // will render constraints
        renderAngles: true, // will render angles (red horizontal half-lines if the angle is 0)

});

// add bodies
Matter.World.add(binder.mWorld, [
    Matter.Bodies.rectangle(200, 100, 60, 60, { frictionAir: 0.001 }),
]);}

// alternative (will return the sync object)
binder.addBody(Matter.Bodies.rectangle(200, 100, 60, 60, { frictionAir: 0.001 }));
```

- what if we want to use ECS components for our MatterJS example?
  - as stated above, `MatterBind` adds a new object into PIXI once either a body or a constraint has been added to the MatterJS world (by using `afterAdd` hook)
  - this object can be used as a regular PIXI-ECS object (it extends `ECS.Container`)
  - we have two options how to access synchronized objects
    - a) call `binder.findSyncObjectForBody(body)` - PIXI counterparts have specific names, following this pattern: `matter_body_<matterid>`
    - b) add your object to the world by calling `binder.addBody(body)` - this method will return the PIXI object that gets synchronized with the Matter object

<div className={styles.figure}>
  <img className={styles.fill} src={useBaseUrl('img/docs/tutorials/06-matterjs/lifecycle.svg')} />
</div>