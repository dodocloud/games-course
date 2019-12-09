import { initPixiWatcher } from '../../lectures/pixi-examples-setup';

import { ExampleShaderNoise } from './example-shader-noise';
import { ExampleShaderWave } from './example-shader-wave';
import { ExampleShaderMandelbrot } from './example-shader-mandelbrot';
import { ExampleNetworkBasicClient, ExampleNetworkBasicServer } from './example-network-basic';
import { ExampleNetworkAnimClient, ExampleNetworkAnimClientLagged, ExampleNetworkAnimServer, ExampleNetworkAnimPacketLossClient, ExampleNetworkAnimPacketLossLaggedClient, ExampleNetworkAnimPacketLossServer } from './example-network-anim';
import { ExampleTweenLinear, ExampleTweenEaseInOut, ExampleTweenSineIn } from './example-tween';
import { ExampleTweenLinear2, ExampleTweenQuadraticIn2, ExampleTweenExpo2 } from './example-tween2';
import { ExampleNetworkSteeringClient, ExampleNetworkSteeringServer } from './example-network-steering';
import { ExampleNetworkCommandsClient, ExampleNetworkCommandsServer } from './example-network-commands';
import { ExampleNetworkInteractiveClient, ExampleNetworkInteractiveServer } from './example-network-interactive';
import { ExampleShaderBasic } from './example-shader-basic';

// will be referred via <canvas data-example>
initPixiWatcher(
  { name: 'ExampleShaderBasic', factory: (view: HTMLCanvasElement) => new ExampleShaderBasic(view) },
  { name: 'ExampleShaderNoise', factory: (view: HTMLCanvasElement) => new ExampleShaderNoise(view) },
  { name: 'ExampleShaderWave', factory: (view: HTMLCanvasElement) => new ExampleShaderWave(view) },
  { name: 'ExampleShaderMandelbrot', factory: (view: HTMLCanvasElement) => new ExampleShaderMandelbrot(view) },
  { name: 'ExampleNetworkBasicClient', factory: (view: HTMLCanvasElement) => new ExampleNetworkBasicClient(view) },
  { name: 'ExampleNetworkBasicServer', factory: (view: HTMLCanvasElement) => new ExampleNetworkBasicServer(view) },
  { name: 'ExampleNetworkAnimClient', factory: (view: HTMLCanvasElement) => new ExampleNetworkAnimClient(view) },
  { name: 'ExampleNetworkAnimClientLagged', factory: (view: HTMLCanvasElement) => new ExampleNetworkAnimClientLagged(view) },
  { name: 'ExampleNetworkAnimServer', factory: (view: HTMLCanvasElement) => new ExampleNetworkAnimServer(view) },
  { name: 'ExampleNetworkAnimPacketLossClient', factory: (view: HTMLCanvasElement) => new ExampleNetworkAnimPacketLossClient(view) },
  { name: 'ExampleNetworkAnimPacketLossLaggedClient', factory: (view: HTMLCanvasElement) => new ExampleNetworkAnimPacketLossLaggedClient(view) },
  { name: 'ExampleNetworkAnimPacketLossServer', factory: (view: HTMLCanvasElement) => new ExampleNetworkAnimPacketLossServer(view) },
  { name: 'ExampleNetworkSteeringClient', factory: (view: HTMLCanvasElement) => new ExampleNetworkSteeringClient(view) },
  { name: 'ExampleNetworkSteeringServer', factory: (view: HTMLCanvasElement) => new ExampleNetworkSteeringServer(view) },
  { name: 'ExampleTweenLinear', factory: (view: HTMLCanvasElement) => new ExampleTweenLinear(view) },
  { name: 'ExampleTweenEaseInOut', factory: (view: HTMLCanvasElement) => new ExampleTweenEaseInOut(view) },
  { name: 'ExampleTweenSineIn', factory: (view: HTMLCanvasElement) => new ExampleTweenSineIn(view) },
  { name: 'ExampleTweenLinear2', factory: (view: HTMLCanvasElement) => new ExampleTweenLinear2(view) },
  { name: 'ExampleTweenQuadraticIn2', factory: (view: HTMLCanvasElement) => new ExampleTweenQuadraticIn2(view) },
  { name: 'ExampleTweenExpo2', factory: (view: HTMLCanvasElement) => new ExampleTweenExpo2(view) },
  { name: 'ExampleNetworkCommandsClient', factory: (view: HTMLCanvasElement) => new ExampleNetworkCommandsClient(view) },
  { name: 'ExampleNetworkCommandsServer', factory: (view: HTMLCanvasElement) => new ExampleNetworkCommandsServer(view) },
  { name: 'ExampleNetworkInteractiveClient', factory: (view: HTMLCanvasElement) => new ExampleNetworkInteractiveClient(view) },
  { name: 'ExampleNetworkInteractiveServer', factory: (view: HTMLCanvasElement) => new ExampleNetworkInteractiveServer(view) },
);