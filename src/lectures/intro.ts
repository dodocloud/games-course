import { resizeContainer, shuffle } from '../utils';


/**
 * Sprite as defined by its coordinates in spritesheet and size
 */
class Sprite {
  x: number;
  y: number;
  w: number;
  h: number;

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
}

/**
 * Sprite with its position on the map
 */
class SpriteObject {
  sprite: Sprite;
  position: number; // horizontal offset (1 is equal to the width of the screen)
}

/**
 * Sprite used for rendering
 */
class RenderSprite {
  x: number; // x-coordinate on screen
  y: number; // y-coordinate on screen
  maxY: number; // max renderable y-coordinate
  scale: number;
  opacity: number; // opacity used for furthest sprites so that they won't appear instantly
  sprite: Sprite;
}

/**
 * Segment used for rendering
 */
class RenderSegment {
  x1: number;
  y1: number;
  scale1: number; // scale of the bottom part
  x2: number;
  y2: number;
  scale2: number; // scale of the top part
  counter: number; // loop counter
}


/**
 * Fancy Windows 3.0-like progress window
 */
class ProgressWindow {
  progressLength = 50; // number of characters inside the progress bar
  progressBar: HTMLElement;
  container: HTMLElement;
  rest: HTMLElement;
  percentage: HTMLElement;
  currProgress = 0;

  init() {
    this.container = document.getElementById("progress") as HTMLElement;
    this.progressBar = document.getElementById("progress-bar") as HTMLElement;
    this.rest = document.getElementById("rest") as HTMLElement;
    this.percentage = document.getElementById("percentage") as HTMLElement;
    resizeContainer(this.container, 640, 480);
    window.addEventListener("resize", () => resizeContainer(this.container, 640, 480));
  }

  public animate(callback: Function) {
    this.currProgress+=0.75;
    let progressNum = Math.floor(this.currProgress / 2);
    this.progressBar.innerText = this.generateStr('█', progressNum);
    this.rest.innerHTML = this.generateStr('&nbsp;', 50 - progressNum);
    this.percentage.innerHTML = this.pad(Math.floor(this.currProgress), 2) + "%" + (Math.floor(this.currProgress) !== 100 ? "&nbsp;" : "");

    if (this.currProgress >= 100) {
      callback();
      return;
    }
    requestAnimationFrame(() => this.animate(callback));
  }

  private pad(num: number, size: number): string {
    let s = num + "";
    while (s.length < size) { s = "0" + s; }
    return s;
  }

  public show() {
    this.container.classList.remove("hide");
  }

  public hide() {
    this.container.classList.add("hide");
  }

  private generateStr(char: string, num: number): string {
    let output = "";
    for (let i = 0; i < num; i++) {
      output += char;
    }
    return output;
  }
}

class Intro {
  private intro: HTMLElement;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private spritesheet: HTMLImageElement = new Image();

  private sprites = {
    background: new Sprite(0, 510, 1024, 516),
    mountains: new Sprite(0, 327, 1024, 158),
    logo: new Sprite(514, 61, 500, 170),
    billboards: [
      new Sprite(0, 0, 123, 95),
      new Sprite(123, 0, 123, 95),
      new Sprite(246, 0, 123, 95),
      new Sprite(369, 0, 123, 95),
      new Sprite(0, 95, 123, 95),
      new Sprite(123, 95, 123, 95),
      new Sprite(246, 95, 123, 95),
      new Sprite(369, 95, 123, 95),
      new Sprite(0, 190, 123, 95),
      new Sprite(123, 190, 123, 95),
      new Sprite(246, 190, 123, 95),
      new Sprite(369, 190, 123, 95)],
  };

  // game configuration
  config = {
    billboardFrequency: 0.1, // likelyhood of one billboard appearing in one segment
    initAnimDuration: 500, // duration of initial animation (in number of cycles! not ms)
    glowAnimDuration: 200,
    roadParam: {
      segmentSize: 250, // size of one segment
      segmentsNum: 3, // number of segment (length = segmentSize*segmentsNum)
      roadWidth: 2.7, // width of the road, measured relatively to the width of the screen
    },
    cameraParam: {
      maxSpeed: 20,
      depthOfField: 50, // visible distance
      cameraElevation: 360,
      FOV: 80 // field of view
    },
    renderParam: {
      segmentRenderSize: 80,
      segmentsPerColor: 1,
      maxScale: 10, // scale for closest objects
    },
    resolution: {
      virtualWidth: 320 * 4,
      virtualHeight: 180 * 4
    },
    colors: {
      bgr: "#000",
      lines: "#36e2f8",
      gradient: [
        {x: 0, clr: "#00000000"},
        {x: 0.47, clr: "#0c141f20"},
        {x: 0.52, clr: "#d100b1"},
        {x: 0.53, clr: "#18CAE6"},
        {x: 0.9, clr: "#0C141F"},
      ]
    }
  };

  // current position on the map
  private currentPos: number;
  // current speed
  private currentSpeed: number;
  // horizontal position, used for scrolling
  private currentHorPos: number;

  private progressWindow = new ProgressWindow();
  // generated road
  private road: Array<SpriteObject[]>;


  init() {
    // configure canvas
    this.intro = document.getElementById("intro") as HTMLElement;
    this.canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d');
    // set fix size and set scale
    this.canvas.height = this.config.resolution.virtualHeight;
    this.canvas.width = this.config.resolution.virtualWidth;
    resizeContainer(this.intro, this.config.resolution.virtualWidth, this.config.resolution.virtualHeight);
    window.addEventListener("resize", () => resizeContainer(this.intro, this.config.resolution.virtualWidth, this.config.resolution.virtualHeight));

    this.progressWindow.init();
    this.progressWindow.show();
    this.spritesheet.src = "./static/intro/intro.png";

    this.spritesheet.onload = () => {
      this.progressWindow.animate(() => {
      this.progressWindow.hide();
      this.show();
      this.resetGame();
      this.gameLoop();
      });
    };
  }

  public show() {
    this.intro.classList.remove("hide");
  }

  public hide() {
    this.intro.classList.add("hide");
  }

  private resetGame() {
    this.currentPos = this.config.renderParam.segmentRenderSize * 5;
    this.currentSpeed = 0;
    this.currentHorPos = 0;
    this.road = [];
    this.generateRoad();
  }

  /**
   * Randomly generates road
   */
  private generateRoad() {
    const segmentsNum = this.config.roadParam.segmentsNum;
    const segmentSize = this.config.roadParam.segmentSize;
    let lastBillboardCounter = 0;

    for (let i = 0; i < segmentsNum; i++) {
      let spriteScale = this.config.resolution.virtualWidth / 320 * this.config.renderParam.maxScale;
      let randomBillboards = shuffle(this.sprites.billboards) as Sprite[];
      let spriteCounter = 0;

      for (let j = 0; j < segmentSize; j++) {
        let sprites: SpriteObject[] = [];
        lastBillboardCounter++;
        if(Math.random() < this.config.billboardFrequency && lastBillboardCounter > 20) {
          lastBillboardCounter = 0;
          let randSprite = randomBillboards[spriteCounter++ % randomBillboards.length];
          let spriteWidth = randSprite.w / this.config.resolution.virtualWidth; // relative size
          let position = this.config.roadParam.roadWidth / 2 + spriteScale * spriteWidth / 2 + 5;
          let leftSide = Math.random() > 0.5;
          if (leftSide) {
            position *= -1;
          }

          sprites.push({
            sprite: randSprite,
            position: position
          });
        }

        // create road segment
        this.road.push(sprites);
      }
    }
  }

  private gameLoop() {
    this.initAnimation();
    this.renderGameFrame();
    requestAnimationFrame(() => this.gameLoop());
  }

  backgroundAlpha = 0.5;
  mountainsAlpha = 0.5;
  logoAlpha = 0.5;
  spritesAlpha = 0.5;
  linesAlpha = 0.5;
  gradientAlpha = 0.5;
  logoScale = 10;

  private initCounter = 0;

  // Initial animation via opacity
  private initAnimation() {
    if(this.initCounter > this.config.initAnimDuration) {
      return; // anim finished
    }

    if(this.initCounter++ === this.config.initAnimDuration) {
      // anim finished, update all attributes
      this.backgroundAlpha = this.mountainsAlpha = this.logoAlpha = this.spritesAlpha = this.linesAlpha = this.gradientAlpha = 1;
    }

    let animPortionDur = this.config.initAnimDuration / 6;

    // just change all alphas one by one
    this.mountainsAlpha = Math.max(0, Math.min(1, (this.initCounter - 0 * animPortionDur) / animPortionDur));
    this.backgroundAlpha = Math.max(0, Math.min(1, (this.initCounter - 1 * animPortionDur) / animPortionDur));
    this.logoAlpha = Math.max(0, Math.min(1, (this.initCounter - 2 * animPortionDur) / animPortionDur));
    this.logoScale = Math.min(20, Math.max(1, 20 - 20 * (this.initCounter - 2 * animPortionDur) / animPortionDur));
    this.linesAlpha = Math.max(0, Math.min(1, (this.initCounter - 3 * animPortionDur) / animPortionDur));
    this.gradientAlpha = Math.max(0, Math.min(1, (this.initCounter - 4 * animPortionDur) / animPortionDur));
    this.spritesAlpha = Math.max(0, Math.min(1, (this.initCounter - 5 * animPortionDur) / animPortionDur));
  }

  private renderGameFrame() {
    this.currentSpeed = this.config.cameraParam.maxSpeed;
    this.currentPos += this.currentSpeed; // update pos
    const virtualWidth = this.config.resolution.virtualWidth;
    const virtualHeight = this.config.resolution.virtualHeight;

    const segmentRenderSize = this.config.renderParam.segmentRenderSize;
    // position on the road
    const roadPosition = Math.floor(this.currentPos / segmentRenderSize);
    const totalLength = this.config.roadParam.segmentsNum * this.config.roadParam.segmentSize;

    // data for current rendered segment, render also 5 segments that are behind the camera
    let currSegmentIndex = (roadPosition - 5) % totalLength;
    let currSegmentPosition = (roadPosition - 5) * segmentRenderSize - this.currentPos;

    // elevation of the camera has to be bigger than reversed segment position, otherwise it won't render anything
    // this is actually a very dirty fix
    while (currSegmentPosition < -this.config.cameraParam.cameraElevation) {
      currSegmentPosition += this.config.cameraParam.cameraElevation;
    }

    let currentSegment = this.road[currSegmentIndex];

    // height projected in last iteration
    let lastProjectedElevation = Number.POSITIVE_INFINITY;
    // counter for alternating colors
    let colorCounter = roadPosition % (2 * this.config.renderParam.segmentsPerColor);

    const cameraElevation = this.config.cameraParam.cameraElevation;
    const sprites: RenderSprite[] = [];
    const segments: RenderSegment[] = [];

    // for sprites, render 2x further distance
    for (let i = 0; i < this.config.cameraParam.depthOfField * 2; i++) {
      // get next segment
      const nextSegmentIndex = (currSegmentIndex + 1) % totalLength;
      const nextSegment = this.road[nextSegmentIndex];

      // calculate projected elevations --> raycasting magic
      const startProjectedElevation = Math.floor((cameraElevation) * cameraElevation
        / (cameraElevation + currSegmentPosition));

      const startScaling = (this.config.cameraParam.FOV / 2) / (cameraElevation + currSegmentPosition);

      const endProjectedElevation = Math.floor((cameraElevation) * cameraElevation
        / (cameraElevation + currSegmentPosition + segmentRenderSize));
      const endScaling = (this.config.cameraParam.FOV / 2) / (cameraElevation + currSegmentPosition + segmentRenderSize);

      const currentElevation = Math.min(lastProjectedElevation, startProjectedElevation);

      // push segments into buffer; render only segments within the depth of field
      if (i < this.config.cameraParam.depthOfField && currentElevation > endProjectedElevation) {
        segments.push({
          x1: - this.currentHorPos * startScaling,
          y1: virtualHeight / 2 + currentElevation,
          scale1: startScaling,
          x2: - this.currentHorPos * endScaling,
          y2: virtualHeight / 2 + endProjectedElevation,
          scale2: endScaling,
          counter: colorCounter,
        });
      }

      // push sprites into buffer
      for (let sprite of currentSegment) {
        let baseScale = virtualWidth / 320 * this.config.renderParam.maxScale;
        // opacity for furthest sprites
        let opacity = (i < this.config.cameraParam.depthOfField) ? 1 : (1 - (i - this.config.cameraParam.depthOfField) / (this.config.cameraParam.depthOfField));
        sprites.push({
          y: virtualHeight / 2 + startProjectedElevation,
          x: virtualWidth / 2 + (sprite.position * virtualWidth - sprite.sprite.w / 2 * baseScale) * startScaling
            - this.currentHorPos * startScaling,
          maxY: virtualHeight / 2 + lastProjectedElevation,
          scale: baseScale * startScaling,
          sprite: sprite.sprite,
          opacity: opacity
        });
      }

      // update attributes
      lastProjectedElevation = currentElevation;
      currSegmentIndex = nextSegmentIndex;
      currentSegment = nextSegment;
      currSegmentPosition += segmentRenderSize;
      colorCounter = (colorCounter + 1) % (2 * this.config.renderParam.segmentsPerColor);
    }

    this.drawScene(segments, sprites);
  }

  private drawScene(segments: RenderSegment[], sprites: RenderSprite[]) {
    const virtualWidth = this.config.resolution.virtualWidth;
    const virtualHeight = this.config.resolution.virtualHeight;

    // Clean screen
    this.context.fillStyle = this.config.colors.bgr;
    this.context.fillRect(0, 0, virtualWidth, virtualHeight);
    this.drawBackground();

    // Create gradient
    let grd = this.context.createLinearGradient(0, 0, 0, virtualHeight);
    for(let gradient of this.config.colors.gradient) {
      grd.addColorStop(gradient.x, gradient.clr);
    }

    // Fill with gradient
    this.context.fillStyle = grd;
    this.context.globalAlpha = this.gradientAlpha;
    this.context.fillRect(0, 0, virtualWidth, virtualHeight);

    this.context.globalAlpha = this.linesAlpha;
    // draw vertical lines
    for (let segment of segments) {
      if (segment.counter % this.config.renderParam.segmentsPerColor === 0) {
        this.context.fillStyle = this.config.colors.lines;
        this.context.fillRect(0, segment.y2, this.config.resolution.virtualWidth, segment.y2 / this.config.resolution.virtualHeight);
      }
    }

    // draw horizontal lines
    let firstSeg = segments[0];
    let lastSeg = segments[segments.length - 1];
    let vertScale = this.config.renderParam.segmentRenderSize;
    let vertLinesNum = 200 / vertScale * 20;
    for (let k = 0; k < vertLinesNum; k++) {
      this.drawTrapezoid(firstSeg.y1, firstSeg.scale1, firstSeg.x1, lastSeg.y2, lastSeg.scale2, lastSeg.x2,
        -20 + k / (vertLinesNum) * 40, -20 + k / (vertLinesNum) * 40 + 0.05, this.config.colors.lines);
    }

    this.context.globalAlpha = 1;

    // draw all sprites, starting from the furthest one
    for (let i = sprites.length - 1; i >= 0; i--) {
      this.drawSprite(sprites[i]);
    }
  }

  glowAnim = 0; // moutain glow animation counter

  private drawBackground() {
    let duration = this.config.glowAnimDuration;
    let halfduration = duration/2;
    this.glowAnim = (this.glowAnim + 1) % duration;
    this.context.globalAlpha = this.backgroundAlpha;
    this.drawImage(this.sprites.background, 0, -this.config.resolution.virtualHeight / 2.8, this.config.resolution.virtualWidth / this.sprites.background.w);
    this.context.globalAlpha = (this.glowAnim > halfduration ? (duration - this.glowAnim) / halfduration : this.glowAnim / halfduration) * this.mountainsAlpha;
    this.drawImage(this.sprites.mountains, 0, this.config.resolution.virtualHeight / 3.76, this.config.resolution.virtualWidth / this.sprites.background.w);
    this.context.globalAlpha = this.logoAlpha;
    let scale = this.config.resolution.virtualWidth / this.sprites.logo.w / 2 * this.logoScale;
    this.drawImage(this.sprites.logo, this.config.resolution.virtualWidth / 2 - this.sprites.logo.w / 2 * scale, this.config.resolution.virtualHeight / 2.1 - this.sprites.logo.h / 2 * scale, scale);

    this.context.globalAlpha = 1;
  }

  private drawImage(image: Sprite, x: number, y: number, scale: number) {
    this.context.drawImage(this.spritesheet, image.x, image.y, image.w, image.h, x, y, scale * image.w, scale * image.h);
  }

  private drawSprite(sprite: RenderSprite) {
    // calculate raster position
    const rasterY = sprite.y - sprite.sprite.h * sprite.scale;
    let finalHeight = 0;
    if (sprite.maxY < sprite.y) {
      // sprite is behind a hill
      finalHeight = Math.min(sprite.sprite.h * (sprite.maxY - rasterY) / (sprite.sprite.h * sprite.scale), sprite.sprite.h);
    } else {
      finalHeight = sprite.sprite.h;
    }

    if (finalHeight > 0) {
      this.context.globalAlpha = sprite.opacity * this.spritesAlpha;
      this.context.drawImage(this.spritesheet, sprite.sprite.x, sprite.sprite.y, sprite.sprite.w, finalHeight, sprite.x, rasterY,
        sprite.scale * sprite.sprite.w, sprite.scale * finalHeight);
      this.context.globalAlpha = 1;
    }
  }


  private drawTrapezoid(y1: number, scale1: number, x1: number, y2: number, scale2: number, x2: number, offsetLeft: number, offsetRight: number, color: string) {
    const virtualWidth = this.config.resolution.virtualWidth;
    this.context.fillStyle = color;
    this.context.beginPath();
    this.context.moveTo(virtualWidth / 2 + offsetLeft * virtualWidth * scale1 + x1, y1);
    this.context.lineTo(virtualWidth / 2 + offsetLeft * virtualWidth * scale2 + x2, y2);
    this.context.lineTo(virtualWidth / 2 + offsetRight * virtualWidth * scale2 + x2, y2);
    this.context.lineTo(virtualWidth / 2 + offsetRight * virtualWidth * scale1 + x1, y1);
    this.context.fill();
  }
}

new Intro().init();
