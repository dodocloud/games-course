import { SpriteData, SpritesData } from './sprite-data';
/**
 * Sprite sheet wrapper
 */
export default class SpriteManager {

  private sprites: SpritesData;

  constructor(sprites: SpritesData) {
    this.sprites = sprites;
  }

  // gets width of the background sprite
  getBgrWidth(): number {
    return this.sprites.bgr_left[0].w;
  }

  // gets left background sprite
  getLeftBgr(index: number): SpriteData {
    return this.sprites.bgr_left[index];
  }

  // gets right background sprite
  getRightBgr(index: number): SpriteData {
    return this.sprites.bgr_right[index];
  }

  // gets road sprite
  getRoad(): SpriteData {
    return this.sprites.road;
  }

  // gets player's car sprite
  getCar(): SpriteData {
    return this.sprites.car;
  }

  // gets player's car sprite when it is destroyed
  getCarDestroyed(): SpriteData {
    return this.sprites.car_destroyed;
  }

  // gets life sprite
  getLife(): SpriteData {
    return this.sprites.life;
  }

  // gets border of the speedbar
  getBarCover(): SpriteData {
    return this.sprites.bar_cover;
  }

  // gets inner sprite of the speedbar
  getBarFill(): SpriteData {
    return this.sprites.bar_fill;
  }

  // gets obstacle by type and index
  getObstacle(type: string, index: number = 0): SpriteData {
    let counter = 0;

    for (let obstacle of this.sprites.obstacles) {
      if (obstacle.type === type && counter++ === index) {
        return obstacle;
      }
    }

    return null;
  }

  // gets coordinates of the center of given lane
  getCenterOfLane(laneIndex: number, canvasWidth: number): number {
    if (laneIndex === 0) {
      // the first line starts 10 pixels from the left
      return this.getCenterOfLane(1, canvasWidth) - (this.sprites.road.w - (2 * 10)) / 3;
    }

    if (laneIndex === 1) {
      return canvasWidth / 2;
    }

    if (laneIndex === 2) {
      return this.getCenterOfLane(1, canvasWidth) + (this.sprites.road.w - (2 * 10)) / 3;
    }
  }

}