import Component from '../engine/Component';


export const RESULT_SUCCESS = 1;
export const RESULT_FAILURE = 2;
export const RESULT_RUNNING = 3;

/**
 * Abstract class for all BTNodes
 */
abstract class BTreeNode {
    result = RESULT_RUNNING;

    abstract update(delta: number, absolute: number): number;

    reset(recursively: boolean) {
        this.result = RESULT_RUNNING;
    }
}

/**
 * Abstract class for subtrees with one child
 */
abstract class BTreeOneNode extends BTreeNode {

    childNode: BTreeNode = null;

    child(childNode: BTreeNode): BTreeNode {
        this.childNode = childNode;
        return this;
    }

    reset(recursively = true) {
        super.reset(recursively);
        if (recursively) {
            this.childNode.reset(recursively);
        }
    }


    update(delta: number, absolute: number): number {
        if (this.result == RESULT_RUNNING) {
            let childRes = this.childNode.update(delta, absolute);
            // only return result -> will be processed in successors 
            return childRes;
        } else {
            return this.result;
        }
    }
}

/**
 * Abstract class for subtrees with a collection of children
 */
export abstract class BTreeMultiNode extends BTreeNode {
    children = new Array<BTreeNode>();
    currentChild: BTreeNode = null;
    currentChildIndex = -1;
    result = RESULT_RUNNING;

    child(childNode: BTreeNode): BTreeMultiNode {
        this.children.push(childNode);
        return this;
    }

    update(delta: number, absolute: number): number {
        if (this.result == RESULT_RUNNING) {
            if (this.currentChildIndex == -1) {
                // set the first child
                this.currentChildIndex = 0;
                this.currentChild = this.children[this.currentChildIndex];
            }

            let result = this.currentChild.update(delta, absolute);
            // only return result -> will be processed in successors 
            return result;
        } else {
            return this.result;
        }
    }

    reset(recursively = true) {
        super.reset(recursively);
        this.currentChild = null;
        this.currentChildIndex = -1;
        if (recursively) {
            for (let child of this.children) {
                child.reset(recursively);
            }
        }
    }

    protected gotoNext(): boolean {
        if (this.currentChildIndex < (this.children.length - 1)) {
            this.currentChildIndex++;
            this.currentChild = this.children[this.currentChildIndex];
            return true;
        } else {
            // nowhere to go to
            return false;
        }
    }
}

/**
 * Selector node - exits on first success 
 */
export class BTSelector extends BTreeMultiNode {

    update(delta: number, absolute: number): number {
        let result = super.update(delta, absolute);

        if (result == RESULT_SUCCESS) {
            this.result = RESULT_SUCCESS;
        } else if (result == RESULT_FAILURE) {
            if (this.gotoNext()) {
                this.update(delta, absolute);
            } else {
                // nowhere to go to
                this.result = RESULT_FAILURE;
            }
        }

        return this.result;
    }
}

/**
 * Sequence node - exits on first failure 
 */
export class BTSequence extends BTreeMultiNode {

    update(delta: number, absolute: number): number {
        let result = super.update(delta, absolute);

        if (result == RESULT_SUCCESS) {
            if (this.gotoNext()) {
                this.update(delta, absolute);
            } else {
                // nowhere to go to
                this.result = RESULT_SUCCESS;
            }
        } else if (result == RESULT_FAILURE) {
            this.result = RESULT_FAILURE;
        }

        return this.result;
    }
}

/**
 * Parallel node - exists on first success
 */
export class BTParallel extends BTreeMultiNode {
    update(delta: number, absolute: number): number {
        for (let child of this.children) {
            let result = child.update(delta, absolute);
            if (result == RESULT_SUCCESS) {
                this.result = RESULT_SUCCESS;
                break;
            }
        }
        return this.result;
    }
}

/**
 * Selector node with condition - two children for IF-ELSE clause
 */
export class BTSelectorCondition extends BTSelector {
    condition: () => boolean;
    childSuccessNode: BTreeNode = null;
    childFailureNode: BTreeNode = null;
    conditionChecked = false;
    resultNode: BTreeNode = null;

    constructor(condition: () => boolean) {
        super();
        this.condition = condition;
    }

    update(delta: number, absolute: number): number {
        if (this.result == RESULT_RUNNING) {
            if (!this.conditionChecked) {
                this.conditionChecked = true;
                if (this.condition()) {
                    this.resultNode = this.childSuccessNode;
                    if(this.resultNode == null){
                        this.result = RESULT_SUCCESS;
                        return this.result;
                    }
                } else {
                    this.resultNode = this.childFailureNode;
                    if(this.resultNode == null){
                        this.result = RESULT_FAILURE;
                        return this.result;
                    }
                }
            }

            this.result = this.resultNode.update(delta, absolute);
        
            return this.result;
        }
    }

    childSuccess(childNode: BTreeNode): BTSelectorCondition {
        this.childSuccessNode = childNode;
        return this;
    }

    childFailure(childNode: BTreeNode): BTSelectorCondition {
        this.childFailureNode = childNode;
        return this;
    }

    reset(recursive = true) {
        super.reset(recursive);
        this.resultNode = null;
        this.conditionChecked = false;

        if (recursive) {
            if(this.childSuccessNode != null) this.childSuccessNode.reset(recursive);
            if(this.childFailureNode != null) this.childFailureNode.reset(recursive);
        }
    }
}

/**
 * Decorator with only one child and one condition 
 */
export class BTDecorator extends BTreeOneNode {
    condition: () => boolean;
    conditionChecked = false;

    constructor(condition: () => boolean = null) {
        super();
        this.condition = condition;
    }


    update(delta: number, absolute: number): number {
        if (this.result == RESULT_RUNNING) {
            if (!this.conditionChecked && this.condition != null) {
                this.conditionChecked = true;
                if (!this.condition()) {
                    this.result = RESULT_FAILURE;
                }
            }
            if (this.result != RESULT_FAILURE) {
                this.result = this.childNode.update(delta, absolute);
            }

        }
        return this.result;
    }

    reset(recursive = true) {
        super.reset(recursive);
        this.conditionChecked = false;

        if (recursive) {
            this.childNode.reset(recursive);
        }
    }
}

/**
 * Decorator that will always return RUNNING state regardless of the state of inner nodes 
 */
export class InfiniteLoopDecorator extends BTDecorator {

    update(delta: number, absolute: number): number {
        let result = super.update(delta, absolute);

        if (result != RESULT_RUNNING) {
            this.reset(true);
        }
        return RESULT_RUNNING;
    }
}

/**
 * Abstract class for actions 
 */
export abstract class BTAction extends BTreeNode {

}

/**
 * Component wrapper for behavior tree
 */
export class BTreeComponent extends Component {
    root: BTreeNode;

    constructor(root: BTreeNode) {
        super();
        this.root = root;
    }

    onUpdate(delta: number, absolute: number) {
        if (this.root.update(delta, absolute) != RESULT_RUNNING) {
            this.finish();
        }
    }
}