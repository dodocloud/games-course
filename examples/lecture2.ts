import * as PIXI from 'pixi.js'
import { PixiRunner } from '../ts/PixiRunner'
import '../libs/pixi-display/pixi-layers.js';

/**
 * Base class for all examples
 */
class Lecture2_Base {
    app: PIXI.Application;
    runner: PixiRunner;

    init(runner: PixiRunner, app: PIXI.Application) {
        this.app = app;
        this.runner = runner;
    }

    onAssetsLoaded() {

    }

    update(delta, absolute) {

    }
}

// ==================================== EXAMPLES ===========================================


/**
 * Example 1: Container object
 */
class Lecture2_Container extends Lecture2_Base {

    container: PIXI.Container;

    init(runner: PixiRunner, app: PIXI.Application) {
        super.init(runner, app);

        PIXI.loader
            .reset()    // necessary for hot reload
            .add('beetle.png')
            .load(() => this.onAssetsLoaded());
    }

    onAssetsLoaded() {
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);

        // ==TODO: create a new texture and set the frame to point at one of those sprites

        // ==TODO: create a 4x4 grid of sprites
        for (var i = 0; i < 16; i++) {
            // ==TODO add each sprite into the container
        }

        // ==TODO: set pivot for rotation

        // start pixi update loop
        this.runner.start();
    }

    update(delta, absolute) {
        this.container.rotation += 0.001 * delta;
    }
}

// =====================================================================================

/**
 * Example 2: React on mouse click
 */
class Lecture2_Click extends Lecture2_Base {

    sprite: PIXI.Sprite;
    rotationEnabled = true;

    init(runner: PixiRunner, app: PIXI.Application) {
        super.init(runner, app);

        PIXI.loader
            .reset()    // necessary for hot reload
            .add('creature.png')
            .load(() => this.onAssetsLoaded());
    }

    onAssetsLoaded() {
        // Scale mode for all textures, will retain pixelation
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        this.sprite = PIXI.Sprite.fromImage('creature.png');

        // Set the initial position
        this.sprite.anchor.set(0.5);
        this.sprite.x = this.app.screen.width / 2;
        this.sprite.y = this.app.screen.height / 2;

        // ==TODO: set interactivity and handle 'pointerdown' event that will invert rotationEnabled

        this.app.stage.addChild(this.sprite);
        this.runner.start();
    }

    update(delta, absolute) {
        if (this.rotationEnabled) {
            this.sprite.rotation += 0.001 * delta;
        }
    }
}

// =====================================================================================

/**
 * Example 3: React on Key event
 */
class Lecture2_KeyEvent extends Lecture2_Base {

    playerBox: PIXI.Graphics;
    boxSize = 100;

    init(runner: PixiRunner, app: PIXI.Application) {
        super.init(runner, app);

        this.playerBox = new PIXI.Graphics();
        this.playerBox.beginFill(0x3498db); // Blue color
        this.playerBox.drawRect(0, 0, this.boxSize, this.boxSize);
        this.playerBox.endFill();
        this.app.stage.addChild(this.playerBox);

        // Add the 'keydown' event listener to our document
        document.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    onKeyDown(key) {
        // codes:
        // up arrow -> 38
        // down arror -> 40
        // left arrow -> 37
        // right arrow -> 39

        // ==TODO: implement functionality
    }
}

// =====================================================================================

/**
 * Example 4: Particle container
 */
class Lecture2_Particles extends Lecture2_Base {

    sprites: PIXI.particles.ParticleContainer;
    totalSprites = 2000;

    init(runner: PixiRunner, app: PIXI.Application) {
        super.init(runner, app);

        PIXI.loader
            .reset()    // necessary for hot reload
            .add('beetle.png')
            .load(() => this.onAssetsLoaded());
    }

    onAssetsLoaded() {

        this.sprites = new PIXI.particles.ParticleContainer(this.totalSprites, {
            scale: true,
            position: true,
            rotation: true,
            uvs: true,
            alpha: true
        });

        // ==TODO: create a new texture and set the frame to point at one of those sprites        
        
        for (var i = 0; i < this.totalSprites; i++) {
            // ==TODO: create a new sprite, set a random position and add it to the collection of sprites
        }

        this.app.stage.addChild(this.sprites);
        this.runner.start();
    }

    update(delta, absolute) {
        for (let i = 0; i < this.totalSprites; i++) {
            // change rotation
            this.sprites.getChildAt(i).rotation += 0.001 * delta;
        }
    }
}

// =====================================================================================

/**
 * Example 5: Change z-index on mouse click
 */
class Lecture2_ZIndex extends Lecture2_Base {

    sprite1: PIXI.Sprite;
    sprite2: PIXI.Sprite;

    init(runner: PixiRunner, app: PIXI.Application) {
        super.init(runner, app);

        PIXI.loader
            .reset()    // necessary for hot reload
            .add('creature.png')
            .load(() => this.onAssetsLoaded());
    }

    onAssetsLoaded() {
        this.sprite1 = PIXI.Sprite.fromImage('creature.png');
        this.sprite1.anchor.set(0.5);
        this.sprite1.x = this.app.screen.width / 2;
        this.sprite1.y = this.app.screen.height / 2;
        this.sprite1.tint = 0xFF7777;

        this.sprite2 = PIXI.Sprite.fromImage('creature.png');
        this.sprite2.anchor.set(0.5);
        this.sprite2.x = this.app.screen.width / 2 - 25;
        this.sprite2.y = this.app.screen.height / 2 - 25;
        this.sprite2.tint = 0x77FF77;

        // ==TODO: set interactive mode and handle pointerdown for both sprites, changing the zOrder attribute

        let stage = new PIXI.display.Stage();
        this.app.stage = stage;
        stage.group.enableSort = true;

        this.app.stage.addChild(this.sprite1);
        this.app.stage.addChild(this.sprite2);
        this.runner.start();
    }

    update(delta, absolute) {

    }
}

// =====================================================================================

/**
 * Example 6: Run animation from JSON fil
 */
class Lecture2_Wizard extends Lecture2_Base {

    init(runner: PixiRunner, app: PIXI.Application) {
        super.init(runner, app);

        // ==TODO: create anim.json and anim.png using TexturePacker, add it to the static folder 
        // and start the runtime again

        PIXI.loader
            .reset()    // necessary for hot reload
            .add('anim.json')
            .load(() => this.onAssetsLoaded());
    }

    onAssetsLoaded() {
        var frames = [];

        // ==TODO: push all frames into the array

        // create an AnimatedSprite
        var anim = new PIXI.extras.AnimatedSprite(frames);

        /*
        * ==TODO: set position, anchor, animation speed and play the animation
         * An AnimatedSprite inherits all the properties of a PIXI sprite
         * so you can change its position, its anchor, mask it, etc
         */


         this.app.stage.addChild(anim);

        // start the update loop
        this.runner.start();
    }
}

// =====================================================================================
// =====================================================================================
// =====================================================================================

/**
 * Class that runs PIXI 
 */
export default class Lecture2 {
    app: PIXI.Application;
    runner: PixiRunner;

    // TODO: assign appropriate example
    currentExample: Lecture2_Base = new Lecture2_Container();

    constructor() {
        this.runner = new PixiRunner();
        this.runner.init(<HTMLCanvasElement>document.getElementById('gameCanvas'),
            this.init.bind(this),
            this.update.bind(this), 1);
    }

    init(app: PIXI.Application) {
        this.app = app;
        this.currentExample.init(this.runner, app);
    }

    onAssetsLoaded() {
        this.currentExample.onAssetsLoaded();
    }

    update(delta, absolute) {
        this.currentExample.update(delta, absolute);
    }
}

new Lecture2();
