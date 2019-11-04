import { GameObject } from '../../../libs/pixi-component';

/**
 * Storage for hit object
 */
export class HitInfo {
  hitType: number; // type of hit object (see Constants.ts)
  hitObject: GameObject; // object that was hit
}