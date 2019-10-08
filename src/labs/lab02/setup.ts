import { initPixiWatcher } from '../../lectures/pixi-examples-setup';

// names of the classes must be unique!
import { ExampleSprite } from './example-sprite';
import { ExampleConfig1, ExampleConfig2, ExampleConfig3 } from './example-config';
import { ExampleSound } from './example-sound';
import { DisplaySprite, DisplayParticles, DisplayPrimitives, DisplayBitmapText, DisplayRegularText, DisplayButton, DisplayZIndex } from './example-display-entities';
import { ExampleStarfield } from './example-starfield';

// will be referred via <canvas data-example>
// TODO previous solution didn't work after minification
initPixiWatcher(
  { name: "ExampleSprite", factory: (view: HTMLCanvasElement) => new ExampleSprite(view)},
  { name:"ExampleConfig1", factory:  (view: HTMLCanvasElement) => new ExampleConfig1(view)},
  { name:"ExampleConfig2", factory:  (view: HTMLCanvasElement) => new ExampleConfig2(view)},
  { name:"ExampleConfig3",  factory: (view: HTMLCanvasElement) => new ExampleConfig3(view)},
  { name:"DisplaySprite", factory: (view: HTMLCanvasElement) => new DisplaySprite(view)},
  { name:"DisplayParticles", factory: (view: HTMLCanvasElement) => new DisplayParticles(view)},
  { name:"DisplayPrimitives", factory: (view: HTMLCanvasElement) => new DisplayPrimitives(view)},
  { name:"DisplayBitmapText", factory: (view: HTMLCanvasElement) => new DisplayBitmapText(view)},
  { name:"DisplayRegularText", factory: (view: HTMLCanvasElement) => new DisplayRegularText(view)},
  { name:"DisplayButton", factory: (view: HTMLCanvasElement) => new DisplayButton(view)},
  { name:"DisplayZIndex", factory: (view: HTMLCanvasElement) => new DisplayZIndex(view)},
  { name:"ExampleSound", factory: (view: HTMLCanvasElement) => new ExampleSound(view)},
  { name:"ExampleStarfield", factory: (view: HTMLCanvasElement) => new ExampleStarfield(view)});