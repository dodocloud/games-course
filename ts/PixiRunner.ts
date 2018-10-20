import * as PIXI from 'pixi.js'


/**
 * Entry point to the PIXIJS
 */
export class PixiRunner {
    app: PIXI.Application = null;
    lastTime = 0;
    gameTime = 0;
    ticker: PIXI.ticker.Ticker = null;
    loopFunc: (delta: Number, absolute: Number) => void = null;

    init(canvas: HTMLCanvasElement, initFunc: (app: PIXI.Application) => void, loopFunc: (delta: Number, absolute: Number) => void, resolution: number = 1) {
        this.app = new PIXI.Application({
            width: canvas.width/resolution,
            height: canvas.height/resolution,
            antialias: true,
            view: canvas,
            resolution: resolution // resolution/device pixel ratio
        });
    
        this.loopFunc = loopFunc;
        this.ticker = PIXI.ticker.shared;
        // stop the shared ticket and update it manually
        this.ticker.autoStart = false;
        this.ticker.stop();

        // call the init function
        initFunc(this.app);
    }

    start() {
        this.loop(0);
    }

    private loop(time) {
        
        let dt = (time - this.lastTime);
        this.lastTime = time;
        this.gameTime += dt;
        // update our own logic 
        this.loopFunc(dt, this.gameTime);
        // draw PIXI internal
        this.ticker.update(this.gameTime);
        requestAnimationFrame((time) => this.loop(time));
    }
}