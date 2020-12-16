import { PixiHelloWorld } from './01-helloworld/pixi';
import { ThreeHelloWorld } from './01-helloworld/threejs';
import { Button } from './02-pixi-intro/button';
import { Loop } from './02-pixi-intro/loop';
import { Particles } from './02-pixi-intro/particles';
import { Primitives } from './02-pixi-intro/primitives';
import { Sound } from './02-pixi-intro/sound';
import { Text } from './02-pixi-intro/text';
import { BitmapText } from './02-pixi-intro/bitmap-text';
import { Animation as PIXIAnimation } from './02-pixi-intro/animation';
import { Scene } from './02-three-intro/scene';
import { Sprites } from './02-three-intro/sprites';
import { Animation as ECSAnimation } from './03-components/animation';
import { Squares } from './03-components/squares';
import { Graphics } from './03-components/graphics';
import { DistributionNormal, DistributionUniform } from './04-space/distribution';
import { Pathfinding } from './04-space/pathfinding';
import { PerlinNoiseView as PerlinNoise } from './04-space/perlin-noise';
import { QuadTreeView as QuadTree } from './04-space/quadtree';
import { Missile } from './05-dynamics/missile';
import { Rotation } from './05-dynamics/rotation';
import { SteeringCombined } from './05-dynamics/steering-combined'; 
import { SteeringSeek } from './05-dynamics/steering-seek'; 
import { SteeringEvade } from './05-dynamics/steering-evade'; 
import { SteeringPursuit } from './05-dynamics/steering-pursuit'; 
import { SteeringWander } from './05-dynamics/steering-wander'; 
import { MatterAirFriction } from './06-physics/matter-airfriction'; 
import { MatterFriction } from './06-physics/matter-friction'; 
import { MatterBridge } from './06-physics/matter-bridge'; 
import { MatterCar } from './06-physics/matter-car'; 
import { MatterChains } from './06-physics/matter-chains'; 
import { MatterCradle } from './06-physics/matter-cradle'; 
import { MatterMixedShapes } from './06-physics/matter-mixed-shapes'; 
import { ClothView as Cloth } from './06-physics/cloth'; 
import { MatterBinding } from './06-physics/matter-binding';

import { Raycaster } from './07-graphics/raycaster';
import { ShaderBasic } from './07-graphics/shader-basic';
import { ShaderNoise } from './07-graphics/shader-noise';
import { ShaderWave } from './07-graphics/shader-wave';
import { TweenRotation } from './07-graphics/tween-rotation';
import { TweenTranslation } from './07-graphics/tween-translation';
import { VisionCone } from './07-graphics/vision-cone';
import { Mandelbrot } from './07-graphics/mandelbrot';

import { Bots } from './08-ai/bots';

import { PixiHitTest } from './others/pixi-hittest';
import { Dialog } from './others/dialog/dialog';

(window as any).APH = {
    PixiHelloWorld,
    ThreeHelloWorld,
    Button,
    Loop,
    Particles,
    Primitives,
    Sound,
    Text,
    BitmapText,
    Scene,
    Sprites,
    Squares,
    Graphics,
    PIXIAnimation,
    ECSAnimation,
    DistributionNormal,
    DistributionUniform,
    Pathfinding,
    PerlinNoise,
    QuadTree,
    Missile,
    Rotation,
    SteeringCombined,
    SteeringSeek,
    SteeringEvade,
    SteeringPursuit,
    SteeringWander,
    MatterAirFriction,
    MatterFriction,
    MatterBridge,
    MatterCar,
    MatterChains,
    MatterCradle,
    MatterMixedShapes,
    MatterBinding,
    Cloth,
    Raycaster,
    ShaderBasic,
    ShaderNoise,
    ShaderWave,
    TweenRotation,
    TweenTranslation,
    VisionCone,
    Mandelbrot,
    Bots,
    PixiHitTest,
    Dialog,
};