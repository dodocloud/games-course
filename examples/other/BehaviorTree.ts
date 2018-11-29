import { RESULT_SUCCESS, BTSelectorCondition, BTreeComponent } from './../../ts/components/BehaviorTreeComponent';
import { RESULT_RUNNING, BTAction, InfiniteLoopDecorator, BTSelector, BTSequence } from '../../ts/components/BehaviorTreeComponent';
import { PixiRunner } from '../../ts/PixiRunner'
import { PIXICmp } from '../../ts/engine/PIXIObject';

/**
 * Action replacement for GO_LOAD state
 */
class GoLoadAction extends BTAction {
    update(delta: number, absolute: number): number {
        if (Math.random() > 0.3) {
            console.log("Go load -  running");
            return RESULT_RUNNING;
        } else {
            console.log("Go load -  finish");
            return RESULT_SUCCESS;
        }
    }
}

/**
 * Action replacement for GO_UNLOAD state
 */
class GoUnLoadAction extends BTAction {
    update(delta: number, absolute: number): number {
        if (Math.random() > 0.3) {
            console.log("Go unload -  running");
            return RESULT_RUNNING;
        } else {
            console.log("Go unload -  finish");
            return RESULT_SUCCESS;
        }
    }
}

/**
 * Action replacement for LOADING
 */
class LoadAction extends BTAction {
    firstRun = true;
    update(delta: number, absolute: number): number {
        if (this.firstRun) {
            this.firstRun = false;
            console.log("Load -  running");
            return RESULT_RUNNING;
        } else {
            console.log("Load -  finish");
            return RESULT_SUCCESS;
        }
    }

    reset(){
        this.firstRun = true;
    }
}

/**
 * Action replacement for UNLOADING
 */
class UnLoadAction extends BTAction {
    firstRun = true;
    update(delta: number, absolute: number): number {
        if (this.firstRun) {
            this.firstRun = false;
            console.log("Unload -  running");
            return RESULT_RUNNING;
        } else {
            console.log("Unload -  finish");
            return RESULT_SUCCESS;
        }
    }
    reset(){
        this.firstRun = true;
    }
}

class BehaviorTree {
    engine: PixiRunner;

    // Start a new game
    constructor() {
        this.engine = new PixiRunner();
        this.engine.init(document.getElementById("gameCanvas") as HTMLCanvasElement, 1);

        // random decision-maker
        let missingIron = () => {
            let result = Math.random() > 0.5;
            if(!result) console.log("Enough iron");
            else console.log("Missing iron");
            return result;
        }
        let missingOre = () => {
            let result = Math.random() > 0.5;
            if(!result) console.log("Enough ore");
            else console.log("Missing ore");
            return result;
        }

    
        // TODO create structure of the node and place it as a parameter to the BTreeComponent
        //let btreeNode = null;
        //this.engine.scene.addGlobalComponent(new BTreeComponent(btreeNode));
    }
}

new BehaviorTree();
