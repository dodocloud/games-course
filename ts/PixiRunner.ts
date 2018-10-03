import * as PIXI from 'pixi.js'

/**
 * Entry point to the PIXIJS
 */
class PixiRunner {
    app: PIXI.Application = null;
    lastTime = 0;
    gameTime = 0;
    ticker: PIXI.ticker.Ticker = null;
    loopFunc: (delta: Number, absolute: Number) => void = null;

    init(canvas: HTMLCanvasElement, loopFunc: (delta: Number, absolute: Number) => void, resolution: number = 1) {
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

        this.loop(performance.now());
    }

    private loop(time) {
        // update
        let dt = (time - this.lastTime) / 1000;
        this.lastTime = time;
        this.gameTime += dt;
        this.loopFunc(dt, this.gameTime);

        // draw
        this.ticker.update(this.gameTime);
        requestAnimationFrame((time) => this.loop(time));
    }
}

export default new PixiRunner();