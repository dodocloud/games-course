import { CameraComponent } from './../../ts/components/CameraComponent';
import { GenericComponent } from './../../ts/components/GenericComponent';


import Component from '../../ts/engine/Component';
import DebugComponent from '../../ts/components/DebugComponent';
import Scene from '../../ts/engine/Scene';
import { PixiRunner } from '../../ts/PixiRunner'
import { PIXICmp } from '../../ts/engine/PIXIObject';
import Msg from '../../ts/engine/Msg';
import ChainingComponent from '../../ts/components/ChainingComponent';
import { GenericComponent } from '../../ts/components/GenericComponent';


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

        let square2 = new PIXICmp.Graphics();
        square2.beginFill(0xFFCD03);
        square2.drawRect(0, 0, 50, 50);
        square2.endFill();
        square2.position.set(300, 300);
        square2.pivot.set(25, 25);


        this.engine.scene.addGlobalComponent(new DebugComponent(document.getElementById("debugSect")));
        this.engine.scene.stage.getPixiObj().addChild(square);

        //  square.addChild(square2);
        this.engine.scene.stage.getPixiObj().addChild(square2);


        square.addComponent(new ChainingComponent()
            .beginWhile(() => true)
            .waitTime(2000)
            .execute(() => {
                square.addComponent(new GenericComponent("RotateComponent")
                .doOnMessage("stop", (cmp, msg) => cmp.finish())
                .doOnUpdate((cmp, delta, absolute) => {
                    if(square.rotation >= 2*Math.PI){
                        square.rotation = 0;
                        cmp.finish();
                    }else{
                        square.rotation+= delta*0.01;
                    }
                })
                );
            })
            .endWhile()
        );
        
    }
}

new Chain();

