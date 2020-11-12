import * as ECS from '../../libs/pixi-ecs';

const SCENE_WIDTH = 16;

const TEXTURE_SCALE = SCENE_WIDTH / (100 * 16);

class PaddleController extends ECS.Component {
    moveLeft(units: number) {
        const bbox = this.owner.getBounds();
        if(bbox.left >= 0) {
            this.owner.position.x -= Math.min(units, bbox.left);
        }
    }

    moveRight(units: number) {
        const bbox = this.owner.getBounds();
        if(bbox.right <= SCENE_WIDTH) {
            this.owner.position.x += Math.min(units, SCENE_WIDTH - bbox.right);
        }
    }

    onUpdate(delta: number, absolute: number) {
        const keyInputCmp = this.scene.findGlobalComponentByName<ECS.KeyInputComponent>(ECS.KeyInputComponent.name);

        if(keyInputCmp.isKeyPressed(ECS.Keys.KEY_LEFT)) {
            this.moveLeft(delta * 0.01);
        }
        if(keyInputCmp.isKeyPressed(ECS.Keys.KEY_RIGHT)) {
            this.moveRight(delta * 0.01); 
        }
    }
}

class BlockBreaker {
    engine: ECS.Engine;

    constructor() {
        this.engine = new ECS.Engine();
        let canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

        this.engine.init(canvas, {
            width: canvas.width,
            height: canvas.height,
            resolution: canvas.width / SCENE_WIDTH
        });

        this.engine.app.loader 
            .reset()
            .add('spritesheet', './assets/game_blockbreaker/spritesheet.png')
            .load(() => this.load())
    }

    load() {
        const scene = this.engine.scene;
        let bricks = new ECS.Container('bricksLayer');
        scene.stage.addChild(bricks);
        scene.addGlobalComponent(new ECS.KeyInputComponent());
        
        for(let i= 0; i< SCENE_WIDTH; i ++) {
            for(let j = 0; j< 5; j++) {
                let sprite = new ECS.Sprite('', this.createTexture(100, 0, 100, 50));
                sprite.scale.set(TEXTURE_SCALE);
                sprite.position.x = i;
                sprite.position.y = j * 0.5;
                bricks.addChild(sprite);
            }
        }

        const sceneHeight = SCENE_WIDTH / (this.engine.app.view.width / this.engine.app.view.height);

        new ECS.Builder(this.engine.scene)
            .anchor(0.5)
            .localPos(SCENE_WIDTH / 2, sceneHeight - 1)
            .withName('paddle')
            .asSprite(this.createTexture(0, 125, 100, 25))
            .withParent(scene.stage)
            .withComponent(new PaddleController())
            .scale(TEXTURE_SCALE)
            .build();

    }

    private createTexture(offsetX: number, offsetY: number, width: number, height: number) {
        let texture = PIXI.Texture.from('spritesheet');
        texture = texture.clone();
        texture.frame = new PIXI.Rectangle(offsetX, offsetY, width, height);
        return texture;
    }
}

export default new BlockBreaker();