import  * as ECSA from '../../../../libs/pixi-component';
import PacmanFactory from '../pacman-factory';
import { Attributes, GameState } from '../constants';
import BaseComponent from './base-component';
import SpriteAnimator from './sprite-animator';
import SpriteData from '../sprite-data';
import { checkTime } from '../../../utils/functions';


export default class SpiderSpawner extends BaseComponent {

  private lastSpawn: number = 0;
  private spawnFrequency: number;
  private maxSpawnFrequency: number;
  private isSpawning = false;

  // number of spawns per minute
  constructor(spawnFrequency: number) {
    super();
    this.spawnFrequency = spawnFrequency;
    this.maxSpawnFrequency = spawnFrequency;
  }

  onInit() {
    super.onInit();
    this.lastSpawn = 0;
    this.factory = this.owner.scene.getGlobalAttribute(Attributes.FACTORY);
  }


  onUpdate(delta: number, absolute: number) {
    if(this.lastSpawn === 0) {
      this.lastSpawn = absolute;
    }

    if(checkTime(this.lastSpawn, absolute, this.spawnFrequency/60)) {
      if(!this.isSpawning && (this.model.state === GameState.DEFAULT || this.model.state === GameState.RUSH_MODE)) {
        this.isSpawning = true;
        this.lastSpawn = absolute;
        this.spawnFrequency = this.maxSpawnFrequency / 2 + Math.random() * this.maxSpawnFrequency / 2;

        let spriteData = this.owner.getAttribute<SpriteData>(Attributes.SPRITE_DATA);

        // spawn a spider
        this.owner.addComponent(new ECSA.ChainComponent()
        .addComponentAndWait(new SpriteAnimator(spriteData, spriteData.frames * (500 / this.model.gameSpeed), false, false)) // open gate
        .execute(() => this.factory.spawnSpider(this.scene, this.model)) // spawn spider
        .waitTime(2000) // TODO wait until those two blocks are occupied
        .addComponentAndWait(new SpriteAnimator(spriteData, spriteData.frames * (500 / this.model.gameSpeed), false, true)) // close the gate
        .execute(() => this.isSpawning = false)
        );
      }
    }
  }
}