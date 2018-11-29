import { ATTR_AI_MODEL } from './Constants';
import { AIModel } from './AIModel';
import Component from '../../ts/engine/Component';
import { PIXICmp } from '../../ts/engine/PIXIObject';

/**
 * Component that displays an overall game state
 */
export class WarehouseStateComponent extends Component {
    model: AIModel;


    onInit(){
        this.model = this.scene.getGlobalAttribute(ATTR_AI_MODEL);
        let text =  (<PIXICmp.Text>this.owner.getPixiObj());
        text.style = new PIXI.TextStyle({
            fill : "0xFFFFFF",
            fontStyle : "bold",
            fontSize: "28pt"
        })
    }

    onUpdate(delta: number, absolute: number){
        let percentage = 0;

        if(this.model.warehouseModel.isBuilding){
            percentage =  (this.model.warehouseModel.currentBuildTime * 1.0) / this.model.warehouseModel.buildDelay * 100;
        }

        (<PIXICmp.Text>this.owner.getPixiObj()).text = "IRON: " + 
        this.model.warehouseModel.ironOre + " \nPETROL: " + this.model.warehouseModel.petrol 
        + "\nBUILDING: " + this.zeroPad(percentage.toFixed(0),3) + "\nAGENTS:" + this.model.agentsNum;
    }

    private zeroPad(num, places) {
        var zero = places - num.length + 1;
        return Array(+(zero > 0 && zero)).join("0") + num;
      }
}