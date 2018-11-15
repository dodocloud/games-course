

import Component from '../../ts/engine/Component';
import DebugComponent from '../../ts/components/DebugComponent';
import Scene from '../../ts/engine/Scene';
import { PixiRunner } from '../../ts/PixiRunner'
import { PIXICmp } from '../../ts/engine/PIXIObject';
import Msg from '../../ts/engine/Msg';
import ChainingComponent from '../../ts/components/ChainingComponent';

class RotationAnim extends Component {
    from = 0;
    to = 0;

    constructor(from: number, to: number) {
        super();
        this.from = from;
        this.to = to;
    }

    onInit(){
        this.owner.getPixiObj().rotation = this.from;
    }

    onUpdate(delta: number, absolute: number){
        this.owner.getPixiObj().rotation += delta * 0.001;

        if((this.to > this.from && this.owner.getPixiObj().rotation > this.to) ||
        (this.to < this.from && this.owner.getPixiObj().rotation < this.to)) {
            this.owner.getPixiObj().rotation = this.to;
            this.finish();
        }
    }
}

class Chain {
    engine: PixiRunner;

    // Start a new game
    constructor() {
        this.engine = new PixiRunner();

        this.engine.init(document.getElementById("gameCanvas") as HTMLCanvasElement, 1);

        let square = new PIXICmp.Graphics();
        square.beginFill(0xFF0000);
        square.drawRect(0, 0, 100, 100);
        square.endFill();
        square.position.set(200, 200);
        square.pivot.set(50, 50);
        square.scale.set(3);

        let square2 = new PIXICmp.Graphics();
        square2.beginFill(0xFFCD03);
        square2.drawRect(0, 0, 50, 50);
        square2.endFill();
        square2.position.set(0, 0);
        square2.pivot.set(25, 25);

        this.engine.scene.stage.getPixiObj().addChild(square);
        square.addChild(square2);


        square.addComponent(new ChainingComponent()
        .addComponentAndWait(new RotationAnim(0, Math.PI/2))
        .execute(() => {
            console.log("Component finished");
        })
        .addComponentAndWait(new RotationAnim(1, 2))
    );
    }
}

new Chain();

