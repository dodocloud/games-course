import { DynamicsComponent } from './../../ts/components/DynamicsComponent';
import { LifeDisplayComponent } from './LifeDisplayComponent';
import { BallPhysicsComponent } from './BallPhysicsComponent';
import { GameComponent } from './GameComponent';
import { ATTR_FACTORY, TEXTURE_ARKANOID, TAG_TITLE, TAG_SHIP, TAG_BRICKS, TAG_LEFT_PANEL, TAG_RIGHT_PANEL, 
    TAG_TOP_PANEL, TAG_PADDLE, TAG_BALL, TAG_LIFE, TAG_STATUS, ATTR_MODEL } from './Constants';
import Scene from '../../ts/engine/Scene';
import { Model, SpriteInfo } from './Model';
import Component from '../../ts/engine/Component';
import { SoundComponent } from './SoundComponent';
import { BrickCollisionResolver } from './BrickCollisionResolver';
import PIXIObjectBuilder from '../../ts/engine/PIXIObjectBuilder';
import { IntroComponent } from './IntroComponent';
import Dynamics from '../../ts/utils/Dynamics';
import { ATTR_DYNAMICS } from './../../ts/engine/Constants';
import { PaddleInputController } from './PaddleComponent';
import { StatusComponent } from './StatusComponent';
import { PIXICmp } from '../../ts/engine/PIXIObject';
import DebugComponent from '../../ts/components/DebugComponent';
import { KeyInputComponent } from '../../ts/components/KeyInputComponent';
import { LifeLostWatcher } from './LifeLostWatcher';

export class Factory {

    static globalScale = 1;

    initializeLevel(scene: Scene, model: Model) {
        // scale the scene
        if (model.currentLevel == 0) {
            this.addIntro(scene, model);
        } else {
            model.initLevel();

            this.addPanels(scene, model);
            this.addBricks(scene, model);
            this.addPaddle(scene, model);
            this.addLives(scene, model);
            this.addStatus(scene, model);

            scene.addGlobalComponent(new SoundComponent());
            scene.addGlobalComponent(new BrickCollisionResolver());
            scene.addGlobalComponent(new GameComponent());
            scene.addGlobalComponent(new LifeLostWatcher());
        }
    }

    addIntro(scene: Scene, model: Model) {
        let builder = new PIXIObjectBuilder(scene);

        // stage components
        builder
        .withComponent(new SoundComponent())
        .withComponent(new IntroComponent())
        .build(scene.stage)

        // title
        builder
        .relativePos(0.5, 0.25)
        .anchor(0.5)
        .scale(Factory.globalScale)
        .build(new PIXICmp.Sprite(TAG_TITLE, this.createTexture(model.getSpriteInfo(TAG_TITLE))), scene.stage);

        // ship
       builder
            .relativePos(0.5, 0.75)
            .anchor(0.5, 0.5)
            .scale(Factory.globalScale)
            .build(new PIXICmp.Sprite(TAG_SHIP, this.createTexture(model.getSpriteInfo(TAG_SHIP))), scene.stage);
    }

    addBricks(scene: Scene, model: Model) {
        let bricks = new PIXICmp.Container(TAG_BRICKS);
        scene.stage.getPixiObj().addChild(bricks);

        for (let [key, val] of model.bricks) {
            let spriteIndex = val.type - 1; // 0 is for empty space
            let sprite = new PIXICmp.Sprite("", this.createTexture(model.getSpriteInfo(TAG_BRICKS), spriteIndex));
            sprite.scale.set(Factory.globalScale);

            // 1 unit is height of a brick. Thus, the width is 2 units
            sprite.position.x = val.position.x * 2 + 1;
            sprite.position.y = val.position.y + 1;
            bricks.addChild(sprite);

            // connect sprite with brick object
            model.brickSprites.set(sprite.getId(), val);
            sprite.scale.set(Factory.globalScale);
        }
    }

    addPanels(scene: Scene, model: Model) {
        let builder = new PIXIObjectBuilder(scene);
        builder.scale(Factory.globalScale).build(new PIXICmp.Sprite(TAG_LEFT_PANEL, this.createTexture(model.getSpriteInfo(TAG_LEFT_PANEL))), scene.stage);
        builder.scale(Factory.globalScale).localPos(23,0).build(new PIXICmp.Sprite(TAG_RIGHT_PANEL, this.createTexture(model.getSpriteInfo(TAG_RIGHT_PANEL))), scene.stage);
        builder.scale(Factory.globalScale).build(new PIXICmp.Sprite(TAG_TOP_PANEL, this.createTexture(model.getSpriteInfo(TAG_TOP_PANEL))), scene.stage);
    }

    addPaddle(scene: Scene, model: Model) {
        let builder = new PIXIObjectBuilder(scene);

        // paddle
        builder
        .scale(Factory.globalScale)
        .localPos(10, 23)
        .withComponent(new PaddleInputController())
        .build(new PIXICmp.Sprite(TAG_PADDLE, this.createTexture(model.getSpriteInfo(TAG_PADDLE))), scene.stage);

        // ball
        builder
        .scale(Factory.globalScale)
        .localPos(10 + model.ballOffset, 22.4)
        .withComponent(new DynamicsComponent())
        .withComponent(new BallPhysicsComponent())
        .build(new PIXICmp.Sprite(TAG_BALL, this.createTexture(model.getSpriteInfo(TAG_BALL))), scene.stage);
    }

    addLives(scene: Scene, model: Model) {
        // for each life, create a small icon
        for (let i = 1; i <= model.currentLives; i++) {
            let sprite = new PIXICmp.Sprite(TAG_LIFE + "_" + i, this.createTexture(model.getSpriteInfo(TAG_LIFE)));
            scene.stage.getPixiObj().addChild(sprite);
            sprite.scale.set(Factory.globalScale, Factory.globalScale);
            
            // place them to the bottom left
            sprite.position.x = 1 + 2 * (i - 1);
            sprite.position.y = 24;
        }

        scene.stage.addComponent(new LifeDisplayComponent());
    }

    addStatus(scene: Scene, model: Model) {
        let status = new PIXICmp.Text(TAG_STATUS);
        status.style = new PIXI.TextStyle({
            fontFamily: "Comfont",
            fill: "0xFFFFFF"
        });

        new PIXIObjectBuilder(scene)
        .scale(Factory.globalScale)
        .localPos(8, 15)
        .withComponent(new StatusComponent())
        .build(status, scene.stage);
    }

    resetGame(scene: Scene, model: Model) {
        scene.clearScene();
        scene.addGlobalAttribute(ATTR_FACTORY, this);
        scene.addGlobalAttribute(ATTR_MODEL, model);
        scene.addGlobalComponent(new KeyInputComponent());
        //scene.addGlobalComponent(new DebugComponent(document.getElementById("debugSect")));
        this.initializeLevel(scene, model);
    }

    // loads texture from SpriteInfo entity
    private createTexture(spriteInfo: SpriteInfo, index: number = 0): PIXI.Texture {
        let texture = PIXI.Texture.fromImage(TEXTURE_ARKANOID);
        texture = texture.clone();
        texture.frame = new PIXI.Rectangle(spriteInfo.offsetX + spriteInfo.width * index, spriteInfo.offsetY, spriteInfo.width, spriteInfo.height);
        return texture;
    }
}