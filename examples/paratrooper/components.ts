import Component from "../../ts/engine/Component";

export class CannonController extends Component {
    constructor(){
        super();
    }
    
    onUpdate(delta, absolute){
        this.owner.getPixiObj().rotation+=0.01;
    }
}