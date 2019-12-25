import BaseComponent from '../base-component';


// component that renders score
export default class ScoreDisplayComponent extends BaseComponent {


  onUpdate(delta: number, absolute: number) {
    let score = Math.floor(this.gameModel.score);
    this.owner.asText().text = (1e15 + score + '').slice(-4); // hack for leading zeros
  }
}