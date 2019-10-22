import * as ECSA from '../../../libs/pixi-component';
import { CopterAnimator } from './copter-animator';
import { CopterComponent } from './copter-component';
import { ProjectileComponent } from './projectile-component';
import { soundComponent } from './sound-component';
import { Attributes, BFlags, Names, Assets, Messages, States } from './constants';
import { ParatrooperModel } from './paratrooper-model';
import { CopterSpawner } from './copter-spawner';
import { CollisionManager } from './collision-manager';
import { GameManager } from './game-manager';
import { CannonInputController } from './cannon-controller';
import { ParatrooperComponent } from './paratrooper-component';
import { CopterMovement } from './copter-movement';
import { DeathAnimation } from './death-animation';
import { CollisionResolver } from './collision-resolver';
import Dynamics from '../../utils/dynamics';

export default class ParatrooperFactory {

  // global scale for sprites, calculated in Paratrooper.ts
  static globalScale = 1;
  // width of the screen, depends on current aspect ratio
  // calculated in Paratrooper.ts
  static screenWidth = 1;

  initializeGame(rootObject: ECSA.GameObject, model: ParatrooperModel) {

    let scene = rootObject.scene;
    let builder = new ECSA.Builder(scene);

    // ============================================================================================================
    // special component that will wait for a death of a unit, executes a DeathAnimation
    // and removes it from the scene
    let deathChecker = new ECSA.GenericComponent('DeathChecker') // anonymous generic component
      .doOnMessage(Messages.UNIT_KILLED, (cmp, msg) => {    // wait for message MSG_UNIT_KILLED
        let contextObj = msg.data as ECSA.GameObject; // take the killed object from message payload
        contextObj.addComponent(new ECSA.ChainComponent() // add chaining component that will execute two closures
          .addComponentAndWait(new DeathAnimation()) // firstly, add directly DeathAnimation to the object and wait until it finishes
          .execute((cmp) => contextObj.remove())); // secondly, remove the object from the scene
      });
    // ============================================================================================================


    // add root components
    builder
      .withComponent(new ECSA.KeyInputComponent())
      .withComponent(new GameManager())
      .withComponent(soundComponent())
      .withComponent(new CopterSpawner())
      .withComponent(new CollisionManager())
      .withComponent(new CollisionResolver())
      .withComponent(deathChecker)
      .buildInto(rootObject);


    // create ground
    let ground = new ECSA.Graphics(Names.GROUND);
    ground.beginFill(0x00FFFF);
    ground.drawRect(0, 46, ParatrooperFactory.screenWidth, 0.2);
    ground.endFill();
    rootObject.pixiObj.addChild(ground);

    // create labels
    // bug - bitmaptext contains other elements to which global scale were not applied
    builder.relativePos(0.75, 0.93).scale(ParatrooperFactory.globalScale).anchor(1, 1)
      .withComponent(new ECSA.GenericComponent('ScoreComponent').doOnUpdate((cmp, delta, absolute) => {
        cmp.owner.asBitmapText().text = 'SCORE: ' + Math.floor(model.score);
      }))
      .asBitmapText(Names.SCORE, '', Assets.FONT, 20, 0xFFFFFF)
      .withParent(rootObject)
      .build();

    // game over label
    builder.relativePos(0.4, 0.5).scale(ParatrooperFactory.globalScale).anchor(0.5, 0.5)
      .asBitmapText(Names.GAMEOVER, 'GAME OVER', Assets.FONT, 20, 0xFFFFFF)
      .withParent(rootObject)
      .build<ECSA.BitmapText>().visible = false;

    // number of lives
    builder.relativePos(0.1, 0.93).scale(ParatrooperFactory.globalScale).anchor(0, 1)
      .withComponent(new ECSA.GenericComponent('LivesComponent').doOnUpdate((cmp, delta, absolute) => {
        cmp.owner.asBitmapText().text = 'LIVES: ' + Math.max(0, model.maxLandedUnits - model.landedUnits);
      }))
      .asBitmapText(Names.LIVES, '', Assets.FONT, 20, 0xFFFFFF)
      .withParent(rootObject)
      .build();

    // tower
    builder
      .relativePos(0.5, 0.92)
      .scale(ParatrooperFactory.globalScale)
      .anchor(0.5, 1)
      .asSprite(PIXI.Texture.from(Assets.TEX_TOWER), Names.TOWER)
      .withParent(rootObject)
      .build();

    // turret
    let turret = builder
      .relativePos(0.5, 0.8)
      .scale(ParatrooperFactory.globalScale)
      .anchor(0.5, 1)
      .withParent(rootObject)
      .asSprite(PIXI.Texture.from(Assets.TEX_TURRET), Names.TURRET)
      .build();

    // cannon
    builder
      .relativePos(0.5, 0.75)
      .anchor(0.5, 1)
      .withComponent(new CannonInputController())
      .withParent(turret)
      .asSprite(PIXI.Texture.from(Assets.TEX_CANNON), Names.CANNON)
      .build();
  }

  createProjectile(canon: ECSA.GameObject, model: ParatrooperModel) {

    let rootObject = canon.scene.stage;
    let canonPixi = canon.pixiObj;
    let rotation = canonPixi.rotation;
    let height = canonPixi.getBounds().height;
    let canonGlobalPos = canonPixi.toGlobal(new PIXI.Point(0, 0));
    let velocityX = model.projectileVelocity * Math.cos(rotation - Math.PI / 2);
    let velocityY = model.projectileVelocity * Math.sin(rotation - Math.PI / 2);
    let dynamics = new Dynamics();
    dynamics.velocity = new ECSA.Vector(velocityX, velocityY);
    dynamics.aceleration = new ECSA.Vector(0, model.gravity); // add gravity

    // we need the projectile to be at the same location as the cannon with current rotation
    let obj = new ECSA.Builder(canon.scene)
      .globalPos(canonGlobalPos.x + height * Math.sin(rotation), canonGlobalPos.y - height * Math.cos(rotation))
      .scale(ParatrooperFactory.globalScale)
      .withFlag(BFlags.PROJECTILE)
      .withAttribute(Attributes.DYNAMICS, dynamics)
      .withComponent(new ProjectileComponent())
      .withParent(rootObject)
      .asSprite(PIXI.Texture.from(Assets.TEX_PROJECTILE), Names.PROJECTILE)
      .build();

    canon.scene.sendMessage(new ECSA.Message(Messages.PROJECTILE_FIRED, null, null));
    return obj;
  }

  createParatrooper(owner: ECSA.GameObject, model: ParatrooperModel) {
    let dynamics = new Dynamics();
    dynamics.aceleration = new ECSA.Vector(0, model.gravity);

    let obj = new ECSA.Builder(owner.scene)
      .scale(ParatrooperFactory.globalScale)
      .anchor(0.5, 1)
      .withFlag(BFlags.COLLIDABLE)
      .localPos(owner.pixiObj.position.x, owner.pixiObj.position.y)
      .withAttribute(Attributes.DYNAMICS, dynamics)
      .withComponent(new ParatrooperComponent())
      .withState(States.FALLING)
      .withParent(owner.scene.stage)
      .asSprite(PIXI.Texture.from(Assets.TEX_PARATROOPER), Names.PARATROOPER)
      .build();
    owner.scene.sendMessage(new ECSA.Message(Messages.PARATROOPER_CREATED, null, null));
    return obj;
  }

  createCopter(owner: ECSA.GameObject, model: ParatrooperModel) {
    let root = owner.scene.stage;

    // 50% probability that the copter will be spawned on the left side
    let spawnLeft = Math.random() > 0.5;
    let posY = Math.random() * (model.copterSpawnMaxY - model.copterSpawnMinY) + model.copterSpawnMinY;
    let posX = spawnLeft ? -0.2 : 1.2;
    let velocity = (spawnLeft ? 1 : -1) * Math.random() * (model.copterMaxVelocity - model.copterMinVelocity) + model.copterMinVelocity;
    let dynamics = new Dynamics();
    dynamics.velocity = new ECSA.Vector(velocity, 0);

    let obj = new ECSA.Builder(owner.scene)
      .withFlag(BFlags.COLLIDABLE)
      .withAttribute(Attributes.DYNAMICS, dynamics)
      .withComponent(new CopterComponent())
      .withComponent(new CopterMovement())
      .withComponent(new CopterAnimator())
      .relativePos(posX, posY)
      .anchor(0.5, 0.5)
      .scale(ParatrooperFactory.globalScale)
      .withParent(root)
      .asSprite(PIXI.Texture.from(Assets.TEX_COPTER_LEFT), Names.COPTER)
      .build();
    owner.scene.sendMessage(new ECSA.Message(Messages.COPTER_CREATED, null, null));
    return obj;
  }

  resetGame(scene: ECSA.Scene) {
    scene.clearScene();
    let model = new ParatrooperModel();
    model.loadModel(scene.app.loader.resources[Assets.DATA].data);
    scene.assignGlobalAttribute(Attributes.FACTORY, this);
    scene.assignGlobalAttribute(Attributes.MODEL, model);

    // a simple hack that displays intro animation
    let counter = 0;
    new ECSA.Builder(scene)
      .scale(ParatrooperFactory.globalScale)
      .relativePos(0.1)
      .asSprite(PIXI.Texture.from(Assets.TEX_LOGO))
      .withParent(scene.stage)
      .withComponent(new ECSA.GenericComponent('animator')
        .setFrequency(5).doOnUpdate((cmp, delta, absolute) => {
          cmp.owner.asSprite().texture.frame = new PIXI.Rectangle(0, 0, Math.min(436, (counter++)*39), 48);
          if(counter === 20) {
            cmp.owner.remove();
            // it is better to call initializeGame from within invokeWithDelay -> we can be sure that
            // the scene will be initialized AFTER it finishes the current update loop. This closure is executed
            scene.invokeWithDelay(0, () => this.initializeGame(scene.stage, model));
          }
        }))
      .build();

  }
}