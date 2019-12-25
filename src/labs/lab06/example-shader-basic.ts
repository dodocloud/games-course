import * as ECSA from '../../../libs/pixi-component';


export class ExampleShaderBasic {
  engine: ECSA.GameLoop;

  constructor(view: HTMLCanvasElement) {
    this.engine = new ECSA.GameLoop({ transparent: true });
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);

  const geometry = new PIXI.Geometry().addAttribute('aVertexPosition', // the attribute name
  PIXI.Buffer.from([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]), 2) // vertex position, 2 coordinates for each
  .addAttribute('aTexturePosition', // the attribute name
  PIXI.Buffer.from([ 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0]), 2) // u,v coordinates
  .addIndex([0, 1, 3, 0, 3, 2] as any) // create index over attribute coordinates -> we have 2 triangles
  .interleave(); // interleave attributes into one buffer (better for performance)

  let loader = this.engine.app.loader;
  loader
  .reset()
  .add('noise_vert', './assets/lab06/shaders/basic.vert')
  .add('noise_frag', './assets/lab06/shaders/basic.frag')
  .add('texture', './assets/lab01/crash.png')
  .load(() => {
    const uniforms = {
      texture: new PIXI.Texture(PIXI.BaseTexture.from('texture')),
    };

    let vertexShader = loader.resources['noise_vert'].data;
    let fragmentShader = loader.resources['noise_frag'].data;

    new ECSA.Builder(this.engine.scene)
      .asMesh('quad', geometry, PIXI.Shader.from(vertexShader, fragmentShader, uniforms))
      .scale(0.5, 1)
      .withParent(this.engine.scene.stage)
      .build<ECSA.Mesh>();
  });
  }
}