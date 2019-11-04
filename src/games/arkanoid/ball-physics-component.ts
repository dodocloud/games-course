import * as ECSA from '../../../libs/pixi-component';
import { Names, Attributes, Messages, HitTypes, SCENE_HEIGHT } from './constants';
import { HitInfo } from './hitinfo';
import Dynamics from '../../utils/dynamics';

/**
 * Component that resolves collision with the ball on physical level
 * Handles impact angle and reflection angle of the ball and emits
 * messages for further processing
 */
export class BallPhysicsComponent extends ECSA.Component {
  private leftPanel: ECSA.Sprite;
  private rightPanel: ECSA.Sprite;
  private topPanel: ECSA.Sprite;
  private paddle: ECSA.Sprite;
  private bricks: ECSA.Container;
  private dynamics: Dynamics;

  onInit() {
    // load all objects via scene manager
    this.leftPanel = <ECSA.Sprite>this.scene.findObjectByName(Names.LEFT_PANEL);
    this.rightPanel = <ECSA.Sprite>this.scene.findObjectByName(Names.RIGHT_PANEL);
    this.topPanel = <ECSA.Sprite>this.scene.findObjectByName(Names.TOP_PANEL);
    this.paddle = <ECSA.Sprite>this.scene.findObjectByName(Names.PADDLE);
    this.bricks = <ECSA.Container>this.scene.findObjectByName(Names.BRICKS);
    this.dynamics = this.owner.getAttribute(Attributes.DYNAMICS);
  }

  onUpdate(delta: number, absolute: number) {
    if (this.dynamics.velocity.magnitudeSquared() < 0.5) {
      // almost zero velocity -> nothing to check
      return;
    }

    // check collisions
    let hitInfo = new HitInfo();
    let hit = this.checkPanelCollision(hitInfo) || this.checkPaddleCollision(hitInfo) || this.checkBrickCollision(hitInfo);

    if (hit) {
      this.sendMessage(Messages.OBJECT_HIT, hitInfo);
    }

    // check the bottom as well
    if (this.owner.pixiObj.position.y >= (SCENE_HEIGHT + 1)) { // scene is scaled to be 25 units of height
      this.sendMessage(Messages.BALL_OUTSIDE_AREA);
    }
  }

  /**
   * Checks collision with panels
   */
  protected checkPanelCollision(hitInfo: HitInfo): boolean {
    let ballBB = this.owner.pixiObj.getBounds();
    let leftPanelBB = this.leftPanel.pixiObj.getBounds();
    let rightPanelBB = this.rightPanel.pixiObj.getBounds();
    let topPanelBB = this.topPanel.pixiObj.getBounds();

    if (this.testIntersection(ballBB, topPanelBB) && this.dynamics.velocity.y < 0) {
      // collision with the top panel
      this.dynamics.velocity = new ECSA.Vector(this.dynamics.velocity.x, this.dynamics.velocity.y * -1);
      hitInfo.hitType = HitTypes.BORDER_TOP;
      return true;
    }

    if (this.testIntersection(ballBB, leftPanelBB) && this.dynamics.velocity.x < 0) {
      // collision with the left panel
      this.dynamics.velocity = new ECSA.Vector(this.dynamics.velocity.x * -1, this.dynamics.velocity.y);
      hitInfo.hitType = HitTypes.BORDER_LEFT;
      return true;
    }

    if (this.testIntersection(ballBB, rightPanelBB) && this.dynamics.velocity.x > 0) {
      // collision with the right panel
      this.dynamics.velocity = new ECSA.Vector(this.dynamics.velocity.x * -1, this.dynamics.velocity.y);
      hitInfo.hitType = HitTypes.BORDER_RIGHT;
      return true;
    }

    return false;
  }

  /**
   * Checks collision with paddle
   */
  protected checkPaddleCollision(hitInfo: HitInfo): boolean {
    let paddleBB = this.paddle.pixiObj.getBounds();
    let ballBB = this.owner.pixiObj.getBounds();

    if (this.testIntersection(ballBB, paddleBB) && this.dynamics.velocity.y > 0) {
      // velocity of the paddle isn't taken into account
      let maxDistanceFromCenter = paddleBB.width / 2;
      if (maxDistanceFromCenter !== 0) {
        let distFromCenter = ballBB.left + ballBB.width / 2 - (paddleBB.left + paddleBB.width / 2);
        let percDist = distFromCenter / maxDistanceFromCenter;

        let angle = Math.PI / 4 * percDist; // 45° max
        let length = this.dynamics.velocity.magnitude();

        this.dynamics.velocity = new ECSA.Vector(length * Math.sin(angle), -length * Math.cos(angle));
        hitInfo.hitType = HitTypes.PADDLE;
        return true;
      }
    }

    return false;
  }

  /**
   * Checks collision with bricks
   */
  protected checkBrickCollision(hitInfo: HitInfo): boolean {
    let ballBB = this.owner.pixiObj.getBounds();
    let velocity = this.dynamics.velocity;

    // this can be optimized via geometric hashing
    for (let i = 0; i < this.bricks.children.length; i++) {
      let brick = this.bricks.children[i];
      let brickBB = brick.getBounds();
      if (this.testIntersection(brickBB, ballBB)) {
        // intersection with a brick -> we need to change the velocity of the ball
        let horiz = this.testHorizIntersection(brickBB, ballBB);
        let vert = this.testVertIntersection(brickBB, ballBB);

        if (horiz > vert) {
          // invert the velocity if the ball is moving toward the brick
          if ((brickBB.bottom > ballBB.top && brickBB.top < ballBB.top && velocity.y < 0)
            || (brickBB.top < ballBB.bottom && brickBB.bottom > ballBB.bottom && velocity.y > 0)) {
            this.dynamics.velocity = new ECSA.Vector(this.dynamics.velocity.x, this.dynamics.velocity.y * -1);
          }
        } else {
          // invert the velocity if the ball is moving toward the brick
          if ((brickBB.right > ballBB.left && brickBB.left < ballBB.left && velocity.x < 0)
            || (brickBB.left < ballBB.right && brickBB.right > ballBB.right && velocity.x > 0)) {
            this.dynamics.velocity = new ECSA.Vector(this.dynamics.velocity.x * -1, this.dynamics.velocity.y);
          }
        }

        let brickCmp = <ECSA.GameObject><any>brick;
        hitInfo.hitObject = brickCmp;
        hitInfo.hitType = HitTypes.BRICK;
        return true;
      }
    }
    return false;
  }

  /**
   * Checks horizontal intersection
   */
  private testHorizIntersection(boundsA: PIXI.Rectangle, boundsB: PIXI.Rectangle): number {
    return Math.min(boundsA.right, boundsB.right) - Math.max(boundsA.left, boundsB.left);
  }

  /**
   * Checks vertical intersection
   */
  private testVertIntersection(boundsA: PIXI.Rectangle, boundsB: PIXI.Rectangle): number {
    return Math.min(boundsA.bottom, boundsB.bottom) - Math.max(boundsA.top, boundsB.top);
  }

  /**
   * Checks intersection of two rectangles via AABB theorem
   */
  private testIntersection(boundsA: PIXI.Rectangle, boundsB: PIXI.Rectangle): boolean {
    let intersectionX = this.testHorizIntersection(boundsA, boundsB);
    let intersectionY = this.testVertIntersection(boundsA, boundsB);

    if (intersectionX > 0 && intersectionY > 0) {
      return true;
    }
    return false;
  }
}