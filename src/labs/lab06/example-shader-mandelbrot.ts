import * as ECSA from '../../../libs/pixi-component';


export class ExampleShaderMandelbrot {
  engine: ECSA.GameLoop;

  constructor(view: HTMLCanvasElement) {
    this.engine = new ECSA.GameLoop();
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);

  const geometry = new PIXI.Geometry().addAttribute('aVertexPosition', // the attribute name
    PIXI.Buffer.from([
      -1.0, -1.0,
      1.0, -1.0,
      -1.0, 1.0,
      1.0, 1.0]), // x, y
    2) // the size of the attribute
    .addAttribute('aTexturePosition', // the attribute name
    PIXI.Buffer.from([
      -2.0, -2.0,
      2.0, -2.0,
      -2.0, 2.0,
      2.0, 2.0]), // u, v
    2)
    .addIndex([0, 1, 3, 0, 3, 2] as any) // create index over attribute coordinates -> we have 2 triangles
    .interleave(); // interleave attributes into one buffer (better for performance)


  let loader = this.engine.app.loader;
  loader
  .reset()
  .add('mandelbrot_vert', './assets/lab06/shaders/mandelbrot.vert')
  .add('mandelbrot_frag', './assets/lab06/shaders/mandelbrot.frag')
  .add('palette', './assets/lab06/shaders/mandelbrot_palette.png')
  .load(() => {
    let vertexShader = loader.resources['mandelbrot_vert'].data;
    let fragmentShader = loader.resources['mandelbrot_frag'].data;

    const uniforms = {
      colorPalette: new PIXI.Texture(PIXI.BaseTexture.from('palette')),
      maxIteration: 64,
      projectionMatrix: PIXI.Matrix.IDENTITY,// mat3
    };

    new ECSA.Builder(this.engine.scene)
      .asMesh('quad', geometry, PIXI.Shader.from(vertexShader, fragmentShader, uniforms))
      .withComponent(new ECSA.GenericComponent('updater').doOnUpdate((cmp, delta, absolute) => cmp.owner.scale.set(cmp.owner.scale.x*1.01)))
      .withParent(this.engine.scene.stage)
      .build();
  });
  }
}