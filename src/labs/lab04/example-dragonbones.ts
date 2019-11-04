import * as ECSA from '../../../libs/pixi-component';
import { PixiFactory } from '../../../libs/dragonbones/pixi-factory';

const animations = [
  'dead', 'freeze', 'hit', 'normalAttack', 'run', 'skillAttack1', 'steady', 'stun', 'uniqueAttack', 'win'
];

export class ExampleDragonBones {
  engine: ECSA.GameLoop;

  constructor(view: HTMLCanvasElement) {
    this.engine = new ECSA.GameLoop({ transparent: true });
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);

    this.loadResources();
  }

  protected loadResources(): void {
    const binaryOptions = { loadType: PIXI.LoaderResource.LOAD_TYPE.XHR, xhrType: PIXI.LoaderResource.XHR_RESPONSE_TYPE.BUFFER };

    let resourcesToLoad = [
      './assets/lab04/dragonbones/Demon_ske.json',
      './assets/lab04/dragonbones/Demon_tex.json',
      './assets/lab04/dragonbones/Demon_tex.png',
    ];

    for (const resource of resourcesToLoad) {
      if (resource.indexOf('dbbin') > 0) { // we can also export it into a binary file
        this.engine.app.loader.add(resource, resource, binaryOptions as any);
      } else {
        this.engine.app.loader.add(resource, resource);
      }
    }

    this.engine.app.loader.once('complete', (loader: PIXI.loaders.Loader) => {
      const factory = PixiFactory.factory;
      factory.parseDragonBonesData(this.engine.app.loader.resources[resourcesToLoad[0]].data);
      factory.parseTextureAtlasData(this.engine.app.loader.resources[resourcesToLoad[1]].data,
        this.engine.app.loader.resources[resourcesToLoad[2]].texture);

      const armatureDisplay = factory.buildArmatureDisplay('Demon', 'Demon');
      armatureDisplay.position.set(this.engine.app.view.width / 2, this.engine.app.view.height / 2);
      armatureDisplay.pivot.set(0, -this.engine.app.view.height / 2);
      armatureDisplay.scale.set(this.engine.app.view.height / 700);

      let currentAnimationIndex = -1;
      this.engine.scene.addGlobalComponent(new ECSA.GenericComponent('animator')
        .doOnUpdate(() => {
          if(!armatureDisplay.animation.isPlaying) {
            currentAnimationIndex = (currentAnimationIndex + 1) % animations.length;
            armatureDisplay.animation.play(animations[currentAnimationIndex], 1);
          }
        })
      );

      this.engine.scene.stage.addChild(armatureDisplay);
    });
    this.engine.app.loader.load();
  }
}