import { DEFAULT_LIVES, DEFAULT_TRAFFIC_FREQUENCY, DEFAULT_MAX_SPEED } from './constants';
/**
 * Main game model
 */
export class DriverModel {

  cameraPosition: number;
  cameraSpeed: number;
  lives: number;
  score: number;
  immuneMode: boolean;
  currentMaxSpeed: number;
  trafficFrequency: number;

  constructor() {
    this.cameraPosition = 0; // position of the camera
    this.cameraSpeed = 0; // speed of the camera (by default the same as the speed of the car)
    this.lives = DEFAULT_LIVES; // current number of lives
    this.score = 0; // current score
    this.immuneMode = false; // indicator for immune mode (when the car collides with anything)
    this.currentMaxSpeed = DEFAULT_MAX_SPEED; // current max speed the car is able to achieve
    this.trafficFrequency = DEFAULT_TRAFFIC_FREQUENCY; // current traffic frequency [1, MAXIMUM_FREQUENCY]
  }
}