import * as PIXI from 'pixi.js'



class Raycaster {
    app: PIXI.Application = null;
    lastTime = 0;
    gameTime = 0;
    ticker: PIXI.ticker.Ticker = null;

    // track segments = [direction,length]
    // direction: 1=left, 0=straight, -1=right
    // lenght: int > 0
    segments = [
        [1, 1],
        [-1, 1],
        [0, 2],
        [1, 2],
        [-1, 2],
        [-1, 2],
        [0, 3],
        [1, 1],
        [-1, 1],
        [1, 1]
    ];

    mapLength = 0; // overall map length, calculated in setup()
    mapOffsets = []; // x-coord offsets for all segments

    segmentSize = 2000.0; // length of one path segment
    focalDist = 60.0; // focal distance of the camera

    gameSpeed = 0.1; // speed of the game
    markingsLength = 50; // length of road markings
    markingsWidth = 10;
    sideWaysLength = 50; // length of the sideways
    sideWaysOffset = 50; // offset from the borders fo the road
    
    // stones
    numOfStones = 20; // number of stones visible at once
    stonesDistance = 300; // distance between two stones
    stoneWidth = 20;
    stoneHeightFactor = 15; //times width tall
    stoneXOffset = 700; // road is 600 points 


    // size of the canvas screen
    screenWidth = 0;
    screenHeight = 0;

    graphics: PIXI.Graphics = null;
    cameraXOffset = 0; // current camera offset
    distanceTravelled = 0; // total distance travelled so far

    // Start a new game
    constructor() {
        let canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
        this.screenWidth = canvas.width;
        this.screenHeight = canvas.height;

        // init PIXIJs library
        this.app = new PIXI.Application({
            width: canvas.width,
            height: canvas.height,
            antialias: true,
            view: canvas,
            resolution: 1 // resolution/device pixel ratio
        });

        // precompute map
        this.setup();

        // setup PIXI loop
        this.graphics = new PIXI.Graphics();
        this.app.stage.addChild(this.graphics);
        this.ticker = PIXI.ticker.shared;
        // stop the shared ticket and update it manually
        this.ticker.autoStart = false;
        this.ticker.stop();

        this.loop(performance.now());

        // camera manipulation
        document.addEventListener("keydown", (evt) => {
            if (evt.keyCode == 37) {
                // steering left
                this.cameraXOffset -= 100;
            }
            if (evt.keyCode == 39) {
                // steering right
                this.cameraXOffset += 100;
            }
        });
    }

    private loop(time: number) {
        let dt = (time - this.lastTime);
        this.lastTime = time;
        this.gameTime += dt;
        // update PIXI
        this.ticker.update(this.gameTime);
        // render
        this.draw(dt);
        // start the loop again
        requestAnimationFrame((time) => this.loop(time));
    }

    /**
     * Precomputes map offsets
     */
    private setup() {
        let x = 0;
        let y = 0;
        // for each segment
        for (let i = 0; i < this.segments.length; i++) {
            let length = this.segments[i][1] * this.segmentSize;
            let direction = this.segments[i][0];
            let offsetX = 0;
            for (let j = 0; j < length; j++) {
                let t = j / length; // percentual position (used for easing)
                if (direction == -1) {
                    // right curve
                    offsetX = this.easeInOut(t) * length; // easeInOut will make the curve more 'curvy'
                } else if (direction == 1) {
                    // left curve
                    offsetX = -this.easeInOut(t) * length;
                }

                // store offset
                this.mapOffsets[y] = x + offsetX;
                y++;
            }
            x = x + offsetX;
        }

        this.mapLength = y;
    }


    private draw(delta: number) {
        // clear previous rendering
        this.graphics.clear();

        let horizonStart = Math.floor(this.screenHeight / 3);
        this.drawSky(horizonStart);

        // animated road
        for (let i = horizonStart; i < this.screenHeight; i++) {

            let dy = i; // current line 
            let rayDist = dy / ((horizonStart - dy) / this.focalDist); // relative distance of the nearest object (road)

            // switching between two colors
            let roadColor = Math.floor((rayDist + this.distanceTravelled) / horizonStart) % 2;
            let centerColor = Math.floor((rayDist + this.distanceTravelled) / this.markingsLength) % 2;

            // convert ray based on the focal distance
            let distToCamera = (1 / (rayDist + this.focalDist)) * this.focalDist;

            // draw the field
            this.drawField(roadColor, i);

            // x-position of the road on screen
            let roadPosX = Math.floor((this.screenWidth / (rayDist + this.focalDist)) * this.focalDist);

            // real distance = distance of the vehicle + distance between the object and the vehicle
            let realDistance = Math.floor(rayDist + this.distanceTravelled);
            let camTrackOffset = (this.cameraXOffset + this.getMapRow(realDistance)) * distToCamera;

            // draw the road row
            this.drawRoad(roadColor, i, roadPosX, camTrackOffset);


            // sideways and road markings
            let rightOffset = this.screenWidth - this.sideWaysOffset; // 50 pixels offset from the road borders
            let rightOffsetReal = (rightOffset / (rayDist + this.focalDist)) * this.focalDist;

            let leftOffset = rightOffset - this.sideWaysLength;
            let leftOffsetReal = (leftOffset / (rayDist + this.focalDist)) * this.focalDist;

            let markingsWidthReal = (this.markingsWidth / (rayDist + this.focalDist)) * this.focalDist;
            this.drawMarkings(centerColor, i, leftOffsetReal, rightOffsetReal, markingsWidthReal, realDistance, distToCamera);
        }


        // stones
        let startDistance =  (this.distanceTravelled % this.stonesDistance) + this.stonesDistance * this.numOfStones;

        for (let i = 0; i < this.numOfStones; i++) {
            let stoneWidth = (this.stoneWidth / (startDistance + this.focalDist)) * this.focalDist;
            let stoneHeight = stoneWidth * this.stoneHeightFactor;
            let stoneScreenX = (this.stoneXOffset / (startDistance + this.focalDist)) * this.focalDist;
            let stoneScreenY = horizonStart - (horizonStart * startDistance) / (this.focalDist + startDistance) + horizonStart;

            let cameraXStep = (1 / (startDistance + this.focalDist)) * this.focalDist;
            this.drawStones(stoneScreenX, stoneScreenY, stoneWidth, stoneHeight, startDistance, cameraXStep);

            startDistance -= this.stonesDistance; 
        }

        // update distance
        this.distanceTravelled -= Math.floor(delta * this.gameSpeed);
    }


    private drawSky(horizonStart: number) {
        for (let i = 0; i < horizonStart; i++) {
            this.graphics.lineStyle(1, this.rgb2hex(135 + i / horizonStart * 100, 206, 255 - i / horizonStart * 255));
            this.graphics.moveTo(0, i);
            this.graphics.lineTo(this.screenWidth, i);
        }
    }

    private drawField(roadColor: number, i: number) {
        if (roadColor == 0) {
            this.graphics.lineStyle(1, this.rgb2hex(255, 165, 0));
        } else {
            this.graphics.lineStyle(1, this.rgb2hex(50, 205, 50));
        }

        this.graphics.moveTo(0, i);
        this.graphics.lineTo(this.screenWidth, i);
    }

    private drawRoad(roadColor: number, i: number, roadPosX: number, camTrackOffset: number) {
        if (roadColor == 0) {
            this.graphics.lineStyle(1, this.rgb2hex(0, 0, 0));
        } else {
            this.graphics.lineStyle(1, this.rgb2hex(50, 50, 50));
        }

        this.graphics.moveTo(this.screenWidth/2 - roadPosX + camTrackOffset, i);
        this.graphics.lineTo(this.screenWidth/2 + roadPosX + camTrackOffset, i);
    }

    private drawMarkings(centerColor: number, i: number, leftOffsetReal: number, rightOffsetReal, markingsWidthReal: number, realDistance: number, distToCamera: number){
        
        let colorOffset = Math.floor(i/(this.screenHeight*2/3));
        
        this.graphics.lineStyle(1, this.rgb2hex(colorOffset * 255 - 100, colorOffset - 100, colorOffset - 100)); // gradient

        this.graphics.moveTo(this.screenWidth/2 - rightOffsetReal + (this.cameraXOffset + this.getMapRow(realDistance)) * distToCamera, i);
        this.graphics.lineTo(this.screenWidth/2 - leftOffsetReal + (this.cameraXOffset + this.getMapRow(realDistance)) * distToCamera, i);

        this.graphics.moveTo(this.screenWidth/2 + rightOffsetReal + (this.cameraXOffset + this.getMapRow(realDistance)) * distToCamera, i);
        this.graphics.lineTo(this.screenWidth/2 + leftOffsetReal + (this.cameraXOffset + this.getMapRow(realDistance)) * distToCamera, i);

        if (centerColor == 0) {
            this.graphics.moveTo(this.screenWidth/2 - markingsWidthReal + (this.cameraXOffset + this.getMapRow(realDistance)) * distToCamera, i); 
            this.graphics.lineTo(this.screenWidth/2 + markingsWidthReal + (this.cameraXOffset + this.getMapRow(realDistance)) * distToCamera, i);
        }
    }

    private drawStones(stoneRealPosX: number, stoneRealPosY: number, stoneRealWidth: number, stoneRealHeight: number, startDistance: number, cameraXStep: number) {

        this.graphics.lineStyle(1, this.rgb2hex(100, 50, 50));
        this.graphics.beginFill(this.rgb2hex(100, 50, 50))

        this.graphics.drawRect(this.screenWidth/2 - stoneRealPosX - stoneRealWidth - (this.cameraXOffset + this.getMapRow(startDistance - this.distanceTravelled)) * cameraXStep, stoneRealPosY - stoneRealHeight, stoneRealWidth, stoneRealHeight);
        this.graphics.drawRect(this.screenWidth/2 + stoneRealPosX - (this.cameraXOffset + this.getMapRow(startDistance - this.distanceTravelled)) * cameraXStep, stoneRealPosY - stoneRealHeight, stoneRealWidth, stoneRealHeight);
        this.graphics.endFill();
    }

    /**
     * Quadratic easing function
     */
    private easeInOut(t: number): number {
        return t < 0.5 ? 2.0 * t * t : -1.0 + (4.0 - 2.0 * t) * t
    }

    /**
     * Returns a row on a map based on distance
     */
    private getMapRow(dst: number): number {
        return this.mapOffsets[Math.abs(dst) % this.mapLength]; // when reaching the end, start at the beginning
    }

    private rgb2hex(red, green, blue): number {
        return red * 65536 + green * 256 + blue;
    }
}

new Raycaster();
