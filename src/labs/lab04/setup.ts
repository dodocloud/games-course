import { initPixiWatcher } from '../../lectures/pixi-examples-setup';

import { ExampleVerlet } from './example-verlet';
import { ExampleGauss, ExampleUniform } from './example-distribution';
import { ExampleGaussSpread, ExampleUniformSpread } from './example-distribution-spread';
import { ExampleMatterAirFriction } from './example-matter-airfriction';
import { ExampleMatterBridge } from './example-matter-bridge';
import { ExampleMatterCar } from './example-matter-car';
import { ExampleMatterChains } from './example-matter-chains';
import { ExampleMatterFriction } from './example-matter-friction';
import { ExampleMatterMixedShapes } from './example-matter-mixed.shapes';
import { ExampleMatterNewtonCradle } from './example-matter-newton-cradle';
import { ExampleQuadTreeSmall, ExampleQuadTreeMedium, ExampleQuadTreeLarge, ExampleQuadTreeUltraLarge } from './example-quadtree';
import { ExampleDynamicBallistic60, ExampleDynamicBallistic20, ExampleDynamicBallistic5 } from './example-dynamics-ballistic';
import { ExampleDynamicCircle60, ExampleDynamicCircle20, ExampleDynamicCircle5 } from './example-dynamics-circle';
import { ExampleSteeringSeek } from './example-steering-seek';
import { ExampleSteeringPursuit } from './example-steering-pursuit';
import { ExampleSteeringEvade } from './example-steering-evade';
import { ExampleSteeringWander } from './example-steering-wander';
import { ExampleSteeringMultiple } from './example-steering-multiple';

import { ExampleDragonBones } from './example-dragonbones';
import { ExampleSpritePixi } from './example-sprite-pixi';
import { ExampleSpriteCustom } from './example-sprite-custom';

// will be referred via <canvas data-example>
initPixiWatcher(
  { name: 'ExampleVerlet', factory: (view: HTMLCanvasElement) => new ExampleVerlet(view) },
  { name: 'ExampleGauss', factory: (view: HTMLCanvasElement) => new ExampleGauss(view) },
  { name: 'ExampleUniform', factory: (view: HTMLCanvasElement) => new ExampleUniform(view) },
  { name: 'ExampleGaussSpread', factory: (view: HTMLCanvasElement) => new ExampleGaussSpread(view) },
  { name: 'ExampleUniformSpread', factory: (view: HTMLCanvasElement) => new ExampleUniformSpread(view) },
  { name: 'ExampleMatterAirFriction', factory: (view: HTMLCanvasElement) => new ExampleMatterAirFriction(view) },
  { name: 'ExampleMatterNewtonCradle', factory: (view: HTMLCanvasElement) => new ExampleMatterNewtonCradle(view) },
  { name: 'ExampleMatterBridge', factory: (view: HTMLCanvasElement) => new ExampleMatterBridge(view) },
  { name: 'ExampleMatterCar', factory: (view: HTMLCanvasElement) => new ExampleMatterCar(view) },
  { name: 'ExampleMatterChains', factory: (view: HTMLCanvasElement) => new ExampleMatterChains(view) },
  { name: 'ExampleMatterFriction', factory: (view: HTMLCanvasElement) => new ExampleMatterFriction(view) },
  { name: 'ExampleMatterMixedShapes', factory: (view: HTMLCanvasElement) => new ExampleMatterMixedShapes(view) },
  { name: 'ExampleQuadTreeSmall', factory: (view: HTMLCanvasElement) => new ExampleQuadTreeSmall(view) },
  { name: 'ExampleQuadTreeMedium', factory: (view: HTMLCanvasElement) => new ExampleQuadTreeMedium(view) },
  { name: 'ExampleQuadTreeLarge', factory: (view: HTMLCanvasElement) => new ExampleQuadTreeLarge(view) },
  { name: 'ExampleQuadTreeUltraLarge', factory: (view: HTMLCanvasElement) => new ExampleQuadTreeUltraLarge(view) },
  { name: 'ExampleDynamicBallistic60', factory: (view: HTMLCanvasElement) => new ExampleDynamicBallistic60(view) },
  { name: 'ExampleDynamicBallistic20', factory: (view: HTMLCanvasElement) => new ExampleDynamicBallistic20(view) },
  { name: 'ExampleDynamicBallistic5', factory: (view: HTMLCanvasElement) => new ExampleDynamicBallistic5(view) },
  { name: 'ExampleDynamicCircle60', factory: (view: HTMLCanvasElement) => new ExampleDynamicCircle60(view) },
  { name: 'ExampleDynamicCircle20', factory: (view: HTMLCanvasElement) => new ExampleDynamicCircle20(view) },
  { name: 'ExampleDynamicCircle5', factory: (view: HTMLCanvasElement) => new ExampleDynamicCircle5(view) },
  { name: 'ExampleSteeringSeek', factory: (view: HTMLCanvasElement) => new ExampleSteeringSeek(view) },
  { name: 'ExampleSteeringPursuit', factory: (view: HTMLCanvasElement) => new ExampleSteeringPursuit(view) },
  { name: 'ExampleSteeringEvade', factory: (view: HTMLCanvasElement) => new ExampleSteeringEvade(view) },
  { name: 'ExampleSteeringWander', factory: (view: HTMLCanvasElement) => new ExampleSteeringWander(view) },
  { name: 'ExampleSteeringMultiple', factory: (view: HTMLCanvasElement) => new ExampleSteeringMultiple(view) },
  { name: 'ExampleDragonBones', factory: (view: HTMLCanvasElement) => new ExampleDragonBones(view) },
  { name: 'ExampleSpritePixi', factory: (view: HTMLCanvasElement) => new ExampleSpritePixi(view) },
  { name: 'ExampleSpriteCustom', factory: (view: HTMLCanvasElement) => new ExampleSpriteCustom(view) },
);