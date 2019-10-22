import * as PIXI from 'pixi.js';

const starAmount = 1000;
const fov = 20;

interface Star {
  sprite: PIXI.Sprite;
  x: number;
  y: number;
  z: number;
  opacity: number;
}

export class ExampleStarfield extends PIXI.Application {

  private starTexture: PIXI.Texture;
  private cameraZ = 0;
  private speed = 0;
  private warpSpeed = 0;
  private stars: Star[] = [];

  constructor(view: HTMLCanvasElement) {
    super({
      view,
      backgroundColor: 0x000000,
      antialias: true,
      width: view.clientWidth,
      height: view.clientHeight,
    });

    this.starTexture = PIXI.Texture.from('./assets/lab02/star.png');

    // Create stars
    for (let i = 0; i < starAmount; i++) {
      const star: Star =  {
        sprite: new PIXI.Sprite(this.starTexture),
        z: 0, x: 0, y: 0, opacity: 1,
      };
      star.sprite.scale.set(0.05);
      star.sprite.anchor.set(0.5);
      this.randomizeStar(star, true);
      this.stage.addChild(star.sprite);
      this.stars.push(star);
    }

    this.ticker.add(deltaTime => this.update(deltaTime));
  }

  randomizeStar(star: Star, initial: boolean) {
    star.z = initial ? Math.random() * 2000 : this.cameraZ + Math.random() * 1000 + 2000;

    // Calculate star positions with radial random coordinate so no star hits the camera.
    const deg = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50 + 1;
    star.x = Math.cos(deg) * distance;
    star.y = Math.sin(deg) * distance;
    star.opacity = 1;
  }

  update(deltaTime: number) {
    this.warpSpeed = Math.min(5, this.warpSpeed + deltaTime * 0.001);
    // Simple easing. This should be changed to proper easing function when used for real.
    this.speed += (this.warpSpeed - this.speed) / 20;
    this.cameraZ += deltaTime * 10 * (this.speed);

    for (let star of this.stars) {

      if (star.z < this.cameraZ) { // behind the camera
        this.randomizeStar(star, false);
      }

      // 3D to 2D projection
      const z = star.z - this.cameraZ;
      star.sprite.x = star.x * (fov / z) * this.screen.width + this.screen.width / 2;
      star.sprite.y = star.y * (fov / z) * this.screen.width + this.screen.height / 2;

      if(star.opacity > 0) {
        star.opacity = Math.max(0, star.opacity - 0.05 * deltaTime);
      }
      star.sprite.alpha = 1 - star.opacity;
    }
  }
}
