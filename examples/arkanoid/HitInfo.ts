import { PIXICmp } from '../../ts/engine/PIXIObject';

/**
 * Storage for hit object
 */
export class HitInfo {
    hitType: number; // type of hit object (see Constants.ts)
    hitObject: PIXICmp.ComponentObject; // object that was hit
}