
export interface SpriteData {
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
}

export interface SpritesData {
  road: SpriteData;
  bgr_left: SpriteData[];
  bgr_right: SpriteData[];
  car: SpriteData;
  car_destroyed: SpriteData;
  obstacles: SpriteData[];
  bar_cover: SpriteData;
  bar_fill: SpriteData;
  life: SpriteData;
}