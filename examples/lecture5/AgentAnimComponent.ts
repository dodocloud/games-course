import { ATTR_AGENT_MODEL, AGENT_TYPE_BLUE, TEXTURE_AI } from './Constants';
import Component from '../../ts/engine/Component';
import { ATTR_DYNAMICS } from '../../ts/engine/Constants';
import Dynamics from '../../ts/utils/Dynamics';
import { AgentModel } from './AIModel';
import { PIXICmp } from '../../ts/engine/PIXIObject';

/**
 * Simple agent animation component that only switches between sprite sheet frames
 */
export class AgentAnimComponent extends Component {
    changeFrequency = 10;
    lastSwitchTime = 0;
    texture: PIXI.Texture;

    onInit() {
        this.texture = (<PIXICmp.Sprite>this.owner.getPixiObj()).texture;
        let model = this.owner.getAttribute<AgentModel>(ATTR_AGENT_MODEL);
        // no animation
        if (model.agentType == AGENT_TYPE_BLUE) {
            this.texture.frame = new PIXI.Rectangle(0, 0, 128, 128);
        } else {
            this.texture.frame = new PIXI.Rectangle(0, 128, 128, 128);
        }

    }

    onUpdate(delta: number, absolute: number) {
        let model = this.owner.getAttribute<AgentModel>(ATTR_AGENT_MODEL);
        let dynamics = this.owner.getAttribute<Dynamics>(ATTR_DYNAMICS);
        let velocity = dynamics.velocity;

        if (velocity.magnitude() < 1) {
            // no animation
            if (model.agentType == AGENT_TYPE_BLUE) {
                this.texture.frame = new PIXI.Rectangle(0, 0, 128, 128);
            } else {
                this.texture.frame = new PIXI.Rectangle(0, 128, 128, 128);
            }
        } else {
            if (this.checkTime(this.lastSwitchTime, absolute, this.changeFrequency)) {
                let currentFrameX = this.texture.frame.x / 128;
                currentFrameX = (currentFrameX + 1) % 4;
                if (currentFrameX == 0) {
                    currentFrameX = 1;
                }
                // switch animation
                if (model.agentType == AGENT_TYPE_BLUE) {
                    this.texture.frame = new PIXI.Rectangle(128 * currentFrameX, 0, 128, 128);
                } else {
                    this.texture.frame = new PIXI.Rectangle(128 * currentFrameX, 128, 128, 128);
                }
            }

        }
    }

    private checkTime(lastTime, time, frequency) {
        return (time - lastTime) > 1000 / frequency;
    }
}