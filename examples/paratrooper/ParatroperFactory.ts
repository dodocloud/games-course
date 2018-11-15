import { ATTR_DYNAMICS } from './../../ts/engine/Constants';
import { CopterAnimator } from './CopterAnimator';
import { CopterComponent } from './CopterComponent';
import { ProjectileComponent } from './ProjectileComponent';
import { SoundComponent } from './SoundComponent';
import {
    ATTR_FACTORY, TAG_TOWER, TAG_TURRET, TAG_CANNON, TAG_GROUND, TEXTURE_TOWER, TEXTURE_TURRET, TEXTURE_CANNON,
    TAG_SCORE, TAG_GAMEOVER, TAG_LIVES, TAG_PROJECTILE, TEXTURE_PROJECTILE, TAG_PARATROOPER, MSG_UNIT_KILLED,
    TEXTURE_PARATROOPER, STATE_FALLING, TAG_COPTER, TEXTURE_COPTER_LEFT, ATTR_MODEL, DATA_JSON, FLAG_PROJECTILE, FLAG_COLLIDABLE
} from './Constants';
import { ParatrooperModel } from './ParatrooperModel';
import { PIXICmp } from '../../ts/engine/PIXIObject';
import { CopterSpawner } from './CopterSpawner';
import { CollisionManager } from './CollisionManager';
import { GameManager } from './GameManager';
import { CannonInputController } from './CannonController';
import PIXIObjectBuilder from '../../ts/engine/PIXIObjectBuilder';
import Vec2 from '../../ts/utils/Vec2';
import { ParatrooperComponent } from './ParatrooperComponent';
import { KeyInputComponent } from '../../ts/components/KeyInputComponent';
import Scene from '../../ts/engine/Scene';
import DebugComponent from '../../ts/components/DebugComponent';
import { GenericComponent } from '../../ts/components/GenericComponent';
import Dynamics from '../../ts/utils/Dynamics';
import { CopterMovement } from './CopterMovement';
import ChainingComponent from '../../ts/components/ChainingComponent';
import { DeathAnimation } from './DeathAnimation';
import { CollisionResolver } from './CollisionResolver';

export default class ParatrooperFactory {

    // global scale for sprites, calculated in Paratrooper.ts
    static globalScale = 1;
    // width of the screen, depends on current aspect ratio
    // calculated in Paratrooper.ts
    static screenWidth = 1;

    initializeGame(rootObject: PIXICmp.ComponentObject, model: ParatrooperModel) {

        let scene = rootObject.getScene();
        let builder = new PIXIObjectBuilder(scene);

        // ============================================================================================================
        // special component that will wait for a death of a unit, executes a DeathAnimation
        // upon it and removes it from the scene
        let deathChecker = new GenericComponent("DeathChecker") // anonymous generic component
            .doOnMessage(MSG_UNIT_KILLED, (cmp, msg) => {    // wait for message MSG_UNIT_KILLED
                let contextObj = msg.data as PIXICmp.ComponentObject; // take the killed object from message payload
                contextObj.addComponent(new ChainingComponent() // add chaining component that will execute two closure
                    .addComponentAndWait(new DeathAnimation()) // firstly, add directly DeathAnimation to the object and wait until it finishes
                    .execute((cmp) => contextObj.remove())); // secondly, remove the object from the scene
            });
        // ============================================================================================================


        // add root components
        builder
            .withComponent(new KeyInputComponent())
            .withComponent(new GameManager())
            .withComponent(new SoundComponent())
            .withComponent(new CopterSpawner())
            .withComponent(new CollisionManager())
            .withComponent(new CollisionResolver())
            .withComponent(deathChecker)
            //.withComponent(new DebugComponent(document.getElementById("debugSect")))
            .build(rootObject);


        // create ground
        let ground = new PIXICmp.Graphics(TAG_GROUND);
        ground.beginFill(0x00FFFF);
        ground.drawRect(0, 46, ParatrooperFactory.screenWidth, 0.2);
        ground.endFill();
        rootObject.getPixiObj().addChild(ground);

        // create labels
        // score
        let score = new PIXICmp.Text(TAG_SCORE);
        score.style = new PIXI.TextStyle({
            fill: "0xFFFFFF"
        })
        builder.relativePos(1.0, 1.01).scale(ParatrooperFactory.globalScale).anchor(1, 1)
            .withComponent(new GenericComponent("ScoreComponent").doOnUpdate((cmp, delta, absolute) => {
                let score = "SCORE: " + model.score.toFixed(2);
                let text = <PIXI.Text>cmp.owner.getPixiObj();
                text.text = score;
            }))
            .build(score, rootObject);

        // game over label
        let text = "GAME OVER";
        let gameOver = new PIXICmp.Text(TAG_GAMEOVER, text);
        gameOver.style = new PIXI.TextStyle({
            fill: "0xFFFFFF"
        })
        gameOver.visible = false;
        builder.relativePos(0.5, 0.5).scale(ParatrooperFactory.globalScale).anchor(0.5, 0.5).build(gameOver, rootObject);

        // number of lives
        let lives = new PIXICmp.Text(TAG_LIVES);
        lives.style = new PIXI.TextStyle({
            fill: "0xFFFFFF"
        })
        builder.relativePos(0, 1.01).scale(ParatrooperFactory.globalScale).anchor(0, 1)
            .withComponent(new GenericComponent("LivesComponent").doOnUpdate((cmp, delta, absolute) => {
                let lives = "LIVES: " + Math.max(0, model.maxLandedUnits - model.landedUnits);
                let text = <PIXI.Text>cmp.owner.getPixiObj();
                text.text = lives;
            }))
            .build(lives, rootObject);

        // tower
        builder
            .relativePos(0.5, 0.92)
            .scale(ParatrooperFactory.globalScale)
            .anchor(0.5, 1)
            .build(new PIXICmp.Sprite(TAG_TOWER, PIXI.Texture.fromImage(TEXTURE_TOWER)), rootObject);

        // turret
        let turret = builder
            .relativePos(0.5, 0.8)
            .scale(ParatrooperFactory.globalScale)
            .anchor(0.5, 1)
            .build(new PIXICmp.Sprite(TAG_TURRET, PIXI.Texture.fromImage(TEXTURE_TURRET)), rootObject);

        // cannon
        builder
            .relativePos(0.5, 0.75)
            .anchor(0.5, 1)
            .withComponent(new CannonInputController())
            .build(new PIXICmp.Sprite(TAG_CANNON, PIXI.Texture.fromImage(TEXTURE_CANNON)), turret);
    }

    createProjectile(canon: PIXICmp.ComponentObject, model: ParatrooperModel) {

        let rootObject = canon.getScene().stage;
        let canonPixi = canon.getPixiObj();
        let rotation = canonPixi.rotation;
        let height = canonPixi.getBounds().height;
        let canonGlobalPos = canonPixi.toGlobal(new PIXI.Point(0, 0));
        let velocityX = model.projectileVelocity * Math.cos(rotation - Math.PI / 2);
        let velocityY = model.projectileVelocity * Math.sin(rotation - Math.PI / 2);
        let dynamics = new Dynamics();
        dynamics.velocity = new Vec2(velocityX, velocityY);
        dynamics.aceleration = new Vec2(0, model.gravity); // add gravity

        // we need the projectile to be at the same location as the cannon with current rotation
        new PIXIObjectBuilder(canon.getScene())
            .globalPos(canonGlobalPos.x + height * Math.sin(rotation), canonGlobalPos.y - height * Math.cos(rotation))
            .scale(ParatrooperFactory.globalScale)
            .withFlag(FLAG_PROJECTILE)
            .withAttribute(ATTR_DYNAMICS, dynamics)
            .withComponent(new ProjectileComponent())
            .build(new PIXICmp.Sprite(TAG_PROJECTILE, PIXI.Texture.fromImage(TEXTURE_PROJECTILE)), rootObject);
    }

    createParatrooper(owner: PIXICmp.ComponentObject, model: ParatrooperModel) {
        let dynamics = new Dynamics();
        dynamics.aceleration = new Vec2(0, model.gravity);

        new PIXIObjectBuilder(owner.getScene())
            .scale(ParatrooperFactory.globalScale)
            .anchor(0.5, 1)
            .withFlag(FLAG_COLLIDABLE)
            .localPos(owner.getPixiObj().position.x, owner.getPixiObj().position.y)
            .withAttribute(ATTR_DYNAMICS, dynamics)
            .withComponent(new ParatrooperComponent())
            .withState(STATE_FALLING)
            .build(new PIXICmp.Sprite(TAG_PARATROOPER, PIXI.Texture.fromImage(TEXTURE_PARATROOPER)), owner.getScene().stage);
    }

    createCopter(owner: PIXICmp.ComponentObject, model: ParatrooperModel) {
        let root = owner.getScene().stage;

        // 50% probability that the copter will be spawned on the left side
        let spawnLeft = Math.random() > 0.5;
        let posY = Math.random() * (model.copterSpawnMaxY - model.copterSpawnMinY) + model.copterSpawnMinY;
        let posX = spawnLeft ? -0.2 : 1.2;
        let velocity = (spawnLeft ? 1 : -1) * Math.random() * (model.copterMaxVelocity - model.copterMinVelocity) + model.copterMinVelocity;
        let dynamics = new Dynamics();
        dynamics.velocity = new Vec2(velocity, 0);

        new PIXIObjectBuilder(owner.getScene())
            .withFlag(FLAG_COLLIDABLE)
            .withAttribute(ATTR_DYNAMICS, dynamics)
            .withComponent(new CopterComponent())
            .withComponent(new CopterMovement())
            .withComponent(new CopterAnimator())
            .relativePos(posX, posY)
            .anchor(0.5, 0.5)
            .scale(ParatrooperFactory.globalScale)
            .build(new PIXICmp.Sprite(TAG_COPTER, PIXI.Texture.fromImage(TEXTURE_COPTER_LEFT)), root);
    }

    resetGame(scene: Scene) {
        scene.clearScene();
        let model = new ParatrooperModel();
        model.loadModel(PIXI.loader.resources[DATA_JSON].data);
        scene.addGlobalAttribute(ATTR_FACTORY, this);
        scene.addGlobalAttribute(ATTR_MODEL, model);
        this.initializeGame(scene.stage, model);
    }
}