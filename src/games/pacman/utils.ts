import { GRID_OFFSET_X, BLOCK_WIDTH, GRID_OFFSET_Y, BLOCK_HEIGHT } from './constants';
import { Vector } from '../../../libs/pixi-component';


export const mapToWorld = (x: number, y: number): Vector => {
  let fX = GRID_OFFSET_X + x * BLOCK_WIDTH;
  let fY = GRID_OFFSET_Y + y * BLOCK_HEIGHT;
  return new Vector(fX, fY);
};

export const getPacdotIdentifier = (position: Vector): string => {
  return `pacdot_${position.x}_${position.y}`;
};

export const getPelletIdentifier = (position: Vector): string => {
  return `pellet_${position.x}_${position.y}`;
};

export const getSpiderIdentifier = (id: number): string => {
  return `spider_${id}`;
};

export const getLifeIconIdentifier = (num: number): string => {
  return `life_${num}`;
};