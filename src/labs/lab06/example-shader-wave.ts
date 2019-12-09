import * as ECSA from '../../../libs/pixi-component';

export class ExampleShaderWave {
  engine: ECSA.GameLoop;

  constructor(view: HTMLCanvasElement) {
    this.engine = new ECSA.GameLoop();
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);

  const geometry = new PIXI.Geometry().addAttribute('aVertexPosition', // the attribute name
    PIXI.Buffer.from([
      -1.0, -1.0,
      1.0, -1.0,
      -1.0, 1.0,
      -1.0, 1.0,
      1.0, -1.0,
      1.0, 1.0]), // x, y
    2) // the size of the attribute
    .addAttribute('aTexturePosition', // the attribute name
    PIXI.Buffer.from([
      -1.0, -1.0,
      1.0, -1.0,
      -1.0, 1.0,
      -1.0, 1.0,
      1.0, -1.0,
      1.0, 1.0]), // u, v
    2); // the size of the attribute

  const uniforms = {
      u_resolution: [this.engine.app.screen.width, this.engine.app.screen.height],
      u_time: 0,
  };

  let loader = this.engine.app.loader;
  loader
  .reset()
  .add('noise_vert', './assets/lab06/shaders/wave.vert')
  .add('noise_frag', './assets/lab06/shaders/wave.frag')
  .load(() => {
    let vertexShader = loader.resources['noise_vert'].data;
    let fragmentShader = loader.resources['noise_frag'].data;

    new ECSA.Builder(this.engine.scene)
      .asMesh('quad', geometry, PIXI.Shader.from(vertexShader, fragmentShader, uniforms))
      .withComponent(new ECSA.GenericComponent('updater').doOnUpdate((cmp, delta, absolute) => cmp.owner.asMesh().shader.uniforms.u_time += 0.1))
      .withParent(this.engine.scene.stage)
      .build();
  });
  }
}