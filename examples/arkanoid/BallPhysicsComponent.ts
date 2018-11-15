import {
    TAG_LEFT_PANEL, TAG_RIGHT_PANEL, TAG_TOP_PANEL, TAG_PADDLE, TAG_BRICKS, ATTR_MODEL, MSG_OBJECT_HIT,
    MSG_BALL_OUTSIDE_AREA, HIT_TYPE_BORDER_LEFT, HIT_TYPE_BORDER_RIGHT, HIT_TYPE_BORDER_TOP, HIT_TYPE_PADDLE, HIT_TYPE_BRICK, SCENE_HEIGHT
} from './Constants';
import { PIXICmp } from '../../ts/engine/PIXIObject';
import Component from '../../ts/engine/Component';
import { HitInfo } from './HitInfo';
import Dynamics from '../../ts/utils/Dynamics';
import { ATTR_DYNAMICS } from './../../ts/engine/Constants';

/**
 * Component that resolves collision with the ball on physical level
 * Handles impact angle and reflection angle of the ball and emits 
 * messages for further processing
 */
export class BallPhysicsComponent extends Component {
    private leftPanel: PIXICmp.Sprite;
    private rightPanel: PIXICmp.Sprite;
    private topPanel: PIXICmp.Sprite;
    private paddle: PIXICmp.Sprite;
    private bricks: PIXICmp.Container;
    private dynamics: Dynamics;

    onInit() {
        // load all objects via scene manager
        this.leftPanel = <PIXICmp.Sprite>this.scene.findFirstObjectByTag(TAG_LEFT_PANEL);
        this.rightPanel = <PIXICmp.Sprite>this.scene.findFirstObjectByTag(TAG_RIGHT_PANEL);
        this.topPanel = <PIXICmp.Sprite>this.scene.findFirstObjectByTag(TAG_TOP_PANEL);
        this.paddle = <PIXICmp.Sprite>this.scene.findFirstObjectByTag(TAG_PADDLE);
        this.bricks = <PIXICmp.Container>this.scene.findFirstObjectByTag(TAG_BRICKS);
        this.dynamics = this.owner.getAttribute(ATTR_DYNAMICS);
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
            this.sendMessage(MSG_OBJECT_HIT, hitInfo);
        }

        // check the bottom as well
        if (this.owner.getPixiObj().position.y >= (SCENE_HEIGHT + 1)) { // scene is scaled to be 25 units of height
            this.sendMessage(MSG_BALL_OUTSIDE_AREA);
        }
    }

    /**
     * Checks collision with panels
     */
    protected checkPanelCollision(hitInfo: HitInfo): boolean {
        let ballBB = this.owner.getPixiObj().getBounds();
        let leftPanelBB = this.leftPanel.getPixiObj().getBounds();
        let rightPanelBB = this.rightPanel.getPixiObj().getBounds();
        let topPanelBB = this.topPanel.getPixiObj().getBounds();

        if (this.testIntersection(ballBB, topPanelBB) && this.dynamics.velocity.y < 0) {
            // collision with the top panel
            this.dynamics.velocity.y *= -1;
            hitInfo.hitType = HIT_TYPE_BORDER_TOP;
            return true;
        }

        if (this.testIntersection(ballBB, leftPanelBB) && this.dynamics.velocity.x < 0) {
            // collision with the left panel
            this.dynamics.velocity.x *= -1;
            hitInfo.hitType = HIT_TYPE_BORDER_LEFT;
            return true;
        }

        if (this.testIntersection(ballBB, rightPanelBB) && this.dynamics.velocity.x > 0) {
            // collision with the right panel
            this.dynamics.velocity.x *= -1;
            hitInfo.hitType = HIT_TYPE_BORDER_RIGHT;
            return true;
        }

        return false;
    }

    /**
     * Checks collision with paddle
     */
    protected checkPaddleCollision(hitInfo: HitInfo): boolean {
        let paddleBB = this.paddle.getPixiObj().getBounds();
        let ballBB = this.owner.getPixiObj().getBounds();

        if (this.testIntersection(ballBB, paddleBB) && this.dynamics.velocity.y > 0) {
            // velocity of the paddle isn't taken into account
            let maxDistanceFromCenter = paddleBB.width / 2;
            if (maxDistanceFromCenter != 0) {
                let distFromCenter = ballBB.left + ballBB.width / 2 - (paddleBB.left + paddleBB.width / 2);
                let percDist = distFromCenter / maxDistanceFromCenter;

                let angle = Math.PI / 4 * percDist; // 45° max
                let length = this.dynamics.velocity.magnitude();

                this.dynamics.velocity.x = length * Math.sin(angle);
                this.dynamics.velocity.y = -length * Math.cos(angle);
                hitInfo.hitType = HIT_TYPE_PADDLE;
                return true;
            }
        }

        return false;
    }

    /**
     * Checks collision with bricks
     */
    protected checkBrickCollision(hitInfo: HitInfo): boolean {
        let ballBB = this.owner.getPixiObj().getBounds();
        let velocity = this.dynamics.velocity;

        // this can be optimized via geometric hashing 
        for (let i = 0; i < this.bricks.children.length; i++) {
            let brick = this.bricks.children[i];
            let brickBB = brick.getBounds();
            if (this.testIntersection(brickBB, ballBB)) {
                let horiz = this.testHorizIntersection(brickBB, ballBB);
                let vert = this.testVertIntersection(brickBB, ballBB);

                if (horiz > vert) {
                    // invert the velocity if the ball is moving towards the brick
                    if ((brickBB.bottom > ballBB.top && brickBB.top < ballBB.top && velocity.y < 0)
                        || (brickBB.top < ballBB.bottom && brickBB.bottom > ballBB.bottom && velocity.y > 0)) {
                        velocity.y *= -1;
                    }
                }
                else {
                    // invert the velocity if the ball is moving towards the brick
                    if ((brickBB.right > ballBB.left && brickBB.left < ballBB.left && velocity.x < 0)
                        || (brickBB.left < ballBB.right && brickBB.right > ballBB.right && velocity.x > 0)) {
                        velocity.x *= -1;
                    }
                }

                let brickCmp = <PIXICmp.ComponentObject><any>brick;
                hitInfo.hitObject = brickCmp;
                hitInfo.hitType = HIT_TYPE_BRICK;
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