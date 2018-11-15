import { Model } from './Model';
import { ATTR_MODEL, MSG_LEVEL_STARTED, MSG_ROUND_STARTED, MSG_GAME_OVER, MSG_LEVEL_COMPLETED, MSG_GAME_COMPLETED } from './Constants';
import Component from '../../ts/engine/Component';
import Msg from '../../ts/engine/Msg';
import { PIXICmp } from '../../ts/engine/PIXIObject';
import { GenericComponent } from '../../ts/components/GenericComponent';


export class StatusComponent extends GenericComponent {
    private model: Model;

    constructor() {
        // use GenericComponent to pile up all message handlers
        super(StatusComponent.name);
        this.doOnMessage(MSG_LEVEL_STARTED, (cmp, msg) => this.showText(`LEVEL ${this.model.currentLevel}`));
        this.doOnMessage(MSG_ROUND_STARTED, (cmp, msg) => this.showText(`ROUND ${this.model.currentRound}`));
        this.doOnMessage(MSG_GAME_OVER, (cmp, msg) => this.showText(`GAME OVER`));
        this.doOnMessage(MSG_LEVEL_COMPLETED, (cmp, msg) => this.showText(`LEVEL COMPLETED`));
        this.doOnMessage(MSG_GAME_COMPLETED, (cmp, msg) => this.showText(`!!YOU FINISHED THE GAME!!`));
    }

    onInit() {
        super.onInit();
        this.model = this.owner.getScene().getGlobalAttribute(ATTR_MODEL);
    }

    protected showText(text: string) {
        let textObj = <PIXICmp.Text>this.owner;
        textObj.text = text;
        textObj.visible = true;

        this.scene.invokeWithDelay(1000, () => {
            textObj.visible = false;
        });
    }
}