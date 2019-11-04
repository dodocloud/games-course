import * as ECSA from '../../../libs/pixi-component';
import { Model } from './model';
import { Attributes, Messages } from './constants';

export class StatusComponent extends ECSA.GenericComponent {
  private model: Model;

  constructor() {
    // use GenericComponent to pile up all message handlers
    super(StatusComponent.name);
    this.doOnMessage(Messages.LEVEL_STARTED, (cmp, msg) => this.showText(`LEVEL ${this.model.currentLevel}`));
    this.doOnMessage(Messages.ROUND_STARTED, (cmp, msg) => this.showText(`ROUND ${this.model.currentRound}`));
    this.doOnMessage(Messages.GAME_OVER, (cmp, msg) => this.showText(`GAME OVER`));
    this.doOnMessage(Messages.LEVEL_COMPLETED, (cmp, msg) => this.showText(`LEVEL COMPLETED`));
    this.doOnMessage(Messages.GAME_COMPLETED, (cmp, msg) => this.showText(`!!YOU FINISHED THE GAME!!`));
  }

  onInit() {
    super.onInit();
    this.model = this.owner.scene.getGlobalAttribute(Attributes.MODEL);
  }

  protected showText(text: string) {
    let textObj = <ECSA.Text>this.owner;
    textObj.text = text;
    textObj.visible = true;

    this.scene.invokeWithDelay(1000, () => {
      textObj.visible = false;
    });
  }
}