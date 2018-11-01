import { CopterAnimator } from './CopterAnimator';
import { CopterComponent } from './CopterComponent';
import { ProjectileComponent } from './ProjectileComponent';
import { SoundComponent } from './SoundComponent';
import { ATTR_FACTORY, TAG_TOWER, TAG_TURRET, TAG_CANNON, TAG_GROUND, TEXTURE_TOWER, TEXTURE_TURRET, TEXTURE_CANNON, 
    TAG_SCORE, TAG_GAMEOVER, TAG_LIVES, TAG_PROJECTILE, TEXTURE_PROJECTILE, ATTR_DYNAMICS, TAG_PARATROOPER, 
    TEXTURE_PARATROOPER, STATE_FALLING, TAG_COPTER, TEXTURE_COPTER_LEFT, ATTR_MODEL, FLAG_PROJECTILE, FLAG_COLLIDABLE } from './constants';
import { ParatrooperModel } from './ParatrooperModel';
import { PIXICmp } from '../../ts/engine/PIXIObject';
import { DeathChecker } from './DeathChecker';
import { CopterSpawner } from './CopterSpawner';
import { CollisionManager } from './CollisionManager';
import { GameManager } from './GameManager';
import { ScoreComponent, LivesComponent } from './ScoreComponent';
import { CannonInputController } from './CannonController';
import PIXIObjectBuilder from '../../ts/engine/PIXIObjectBuilder';
import Dynamics from './Dynamics';
import Vec2 from '../../ts/utils/Vec2';
import { ParatrooperComponent } from './ParatrooperComponent';
import { KeyInputComponent } from '../../ts/components/KeyInputComponent';
import Scene from '../../ts/engine/Scene';
import DebugComponent from '../../ts/components/DebugComponent';

export default class ParatrooperFactory {

    initializeGame(rootObject: PIXICmp.ComponentObject, model: ParatrooperModel) {
        let scene = rootObject.getScene();

        rootObject.addComponent(new KeyInputComponent());

        // create all visible objects
        let tower = new PIXICmp.Sprite(TAG_TOWER, PIXI.Texture.fromImage(TEXTURE_TOWER));
        let turret = new PIXICmp.Sprite(TAG_TURRET, PIXI.Texture.fromImage(TEXTURE_TURRET));
        let cannon = new PIXICmp.Sprite(TAG_CANNON, PIXI.Texture.fromImage(TEXTURE_CANNON));

        let ground = new PIXICmp.Graphics(TAG_GROUND);
        ground.beginFill(0x00FFFF);
        ground.drawRect(0, 0, scene.app.screen.width, 5);
        ground.endFill();

        // add game model
        rootObject.addAttribute(ATTR_MODEL, model);

        // create labels
        // score
        let score = new PIXICmp.Text(TAG_SCORE);
        score.style = new PIXI.TextStyle({
            fill : "0xFFFFFF"
        })
        // game over label
        let text = "GAME OVER";
        let gameOver = new PIXICmp.Text(TAG_GAMEOVER, text);
        gameOver.style = new PIXI.TextStyle({
            fill : "0xFFFFFF"
        })
        gameOver.visible = false;

        // number of lives
        let lives = new PIXICmp.Text(TAG_LIVES);
        lives.style = new PIXI.TextStyle({
            fill : "0xFFFFFF"
        })

        // create scene graph
        rootObject.getPixiObj().addChild(tower);
        rootObject.getPixiObj().addChild(score);
        rootObject.getPixiObj().addChild(lives);
        rootObject.getPixiObj().addChild(gameOver);
        rootObject.getPixiObj().addChild(ground);
        rootObject.getPixiObj().addChild(turret);
        turret.getPixiObj().addChild(cannon);

        // add root components -> managers
        rootObject.addComponent(new GameManager());
        rootObject.addComponent(new DeathChecker());
        rootObject.addComponent(new SoundComponent());
        rootObject.addComponent(new CopterSpawner());
        rootObject.addComponent(new CollisionManager());

        rootObject.addComponent(new DebugComponent(document.getElementById("debugSect")));

        // add other components
        score.addComponent(new ScoreComponent());
        lives.addComponent(new LivesComponent());
        cannon.addComponent(new CannonInputController());

        // use builder to set positions of all children
        new PIXIObjectBuilder(scene).relativePos(1.0, 1.01).anchor(1, 1).build(score);
        new PIXIObjectBuilder(scene).relativePos(0, 1.01).anchor(0, 1).build(lives);
        new PIXIObjectBuilder(scene).relativePos(0.5, 0.5).anchor(0.5, 0.5).build(gameOver);
        new PIXIObjectBuilder(scene).relativePos(0.5, 0.92).anchor(0.5, 1).build(tower);
        new PIXIObjectBuilder(scene).relativePos(0.5, 0.8).anchor(0.5, 1).build(turret);
        new PIXIObjectBuilder(scene).relativePos(0.5, 0.75).anchor(0.5, 1).build(cannon);
        new PIXIObjectBuilder(scene).relativePos(0, 0.92).anchor(0, 1).build(ground);
    }

    createProjectile(canon: PIXICmp.ComponentObject, model: ParatrooperModel) {
        let projectile = new PIXICmp.Sprite(TAG_PROJECTILE, PIXI.Texture.fromImage(TEXTURE_PROJECTILE));
        projectile.setFlag(FLAG_PROJECTILE);

        let rootObject = canon.getScene().stage;
        rootObject.getPixiObj().addChild(projectile);

        let canonPixi = canon.getPixiObj();

        let rotation = canonPixi.rotation;
        let width = canonPixi.width;
        let height = canonPixi.height;
        let canonGlobalPos = canonPixi.toGlobal(new PIXI.Point(0,0));

        // we need the projectile to be at the same location as the cannon with current rotation
        new PIXIObjectBuilder(canon.getScene()).globalPos(canonGlobalPos.x + height * Math.sin(rotation),
            canonGlobalPos.y - height * Math.cos(rotation)).build(projectile);

        let velocityX = model.projectileVelocity * Math.cos(rotation - Math.PI / 2);
        let velocityY = model.projectileVelocity * Math.sin(rotation - Math.PI / 2);

        let dynamics = new Dynamics();
        dynamics.velocity = new Vec2(velocityX, velocityY);
        dynamics.acceleration = new Vec2(0, model.gravity); // add gravity

        projectile.addAttribute(ATTR_DYNAMICS, dynamics);
        projectile.addComponent(new ProjectileComponent());
    }

    createParatrooper(owner: PIXICmp.ComponentObject, model: ParatrooperModel) {
        let paratrooper = new PIXICmp.Sprite(TAG_PARATROOPER, PIXI.Texture.fromImage(TEXTURE_PARATROOPER));
        
        paratrooper.anchor.set(0.5, 1);

        paratrooper.setFlag(FLAG_COLLIDABLE);
        paratrooper.position = owner.getPixiObj().position;

        let dynamics = new Dynamics();
        dynamics.acceleration = new Vec2(0, model.gravity);
        paratrooper.addAttribute(ATTR_DYNAMICS, dynamics);

        let root = owner.getScene().stage;
        root.getPixiObj().addChild(paratrooper);
        paratrooper.setState(STATE_FALLING);
        paratrooper.addComponent(new ParatrooperComponent());
    }

    createCopter(owner: PIXICmp.ComponentObject, model: ParatrooperModel) {
        let copter = new PIXICmp.Sprite(TAG_COPTER, PIXI.Texture.fromImage(TEXTURE_COPTER_LEFT));
        copter.setFlag(FLAG_COLLIDABLE);
        let root = owner.getScene().stage;
        root.getPixiObj().addChild(copter);

        // 50% probability that the copter will be spawned on the left side
        let spawnLeft = Math.random() > 0.5;

        let posY = Math.random() * (model.copterSpawnMaxY - model.copterSpawnMinY) + model.copterSpawnMinY;
        let posX = spawnLeft ? -0.2 : 1.2;

        new PIXIObjectBuilder(owner.getScene()).relativePos(posX, posY).anchor(0.5, 0.5).build(copter);

        let velocity = (spawnLeft ? 1 : -1) * Math.random() * (model.copterMaxVelocity - model.copterMinVelocity) + model.copterMinVelocity;
        let dynamics = new Dynamics();
        dynamics.velocity = new Vec2(velocity, 0);

        copter.addAttribute(ATTR_DYNAMICS, dynamics);
        copter.addComponent(new CopterComponent());
        copter.addComponent(new CopterAnimator());
    }

    resetGame(scene: Scene) {
        scene.clearScene();
        let model = new ParatrooperModel();
        scene.addGlobalAttribute(ATTR_FACTORY, this);
        this.initializeGame(scene.stage, model);
    }
}