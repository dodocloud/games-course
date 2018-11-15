import Msg from '../engine/Msg';
import Component from '../engine/Component';
import { PIXICmp } from '../engine/PIXIObject';

const CMD_BEGIN_REPEAT = 1;
const CMD_END_REPEAT = 2;
const CMD_EXECUTE = 3;
const CMD_BEGIN_WHILE = 4;
const CMD_END_WHILE = 5;
const CMD_BEGIN_INTERVAL = 6;
const CMD_END_INTERVAL = 7;
const CMD_BEGIN_IF = 8;
const CMD_ELSE = 9;
const CMD_END_IF = 10;
const CMD_WAIT_TIME = 11;
const CMD_ADD_COMPONENT = 12;
const CMD_ADD_COMPONENT_AND_WAIT = 13;
const CMD_WAIT_FOR_FINISH = 14;
const CMD_WAIT_UNTIL = 15;
const CMD_WAIT_FRAMES = 16;
const CMD_WAIT_FOR_MESSAGE = 17;
const CMD_REMOVE_COMPONENT = 18;
const CMD_REMOVE_GAME_OBJECT_BY_TAG = 19;
const CMD_REMOVE_GAME_OBJECT = 20;
const CMD_REMOVE_PREVIOUS = 21;

// a function that doesn't return anything
interface Action<T> {
    (item: T): void;
}

// a function that has a return type
interface Func<T, TResult> {
    (item: T): TResult;
}


/**
 * Simple stack
 */
class Stack {
    topNode: ExNode = null;
    size = 0;

    constructor() {
        this.topNode = null;
        this.size = 0;
    }

    /**
     * Pushes a new node onto the stack
     */
    push(node: ExNode) {
        this.topNode = node;
        this.size += 1;
    }

    /**
     * Pops the current node from the stack
     */
    pop(): ExNode {
        let temp = this.topNode;
        this.topNode = this.topNode.previous;
        this.size -= 1;
        return temp;
    }

    /**
     * Returns the node on the top
     */
    top(): ExNode {
        return this.topNode;
    }
}

/**
 * Node for ChainingComponent, represents a command context
 */
class ExNode {
    // key taken from CMD_XXX constants
    key = 0;
    // custom parameters
    param1: any = null;
    param2: any = null;
    param3: any = null;
    // cached custom parameters
    param1A: any = null;
    param2A: any = null;
    param3A: any = null;
    cached: boolean = false;
    // link to previous and next node
    next: ExNode = null;
    previous: ExNode = null;

    constructor(key: number, param1: any = null, param2: any = null, param3: any = null) {
        this.key = key;
        this.param1 = param1;
        this.param2 = param2;
        this.param3 = param3;

        this.param1A = null;
        this.param2A = null;
        this.param3A = null;
    }

    /**
     * Caches params or their results (if a corresponding parameter is a function) into param<num>A variables
     */
    cacheParams() {
        if (!this.cached) {
            if (this.param1 != null) {
                this.param1A = typeof (this.param1) == "function" ? this.param1() : this.param1;
            }

            if (this.param2 != null) {
                this.param2A = typeof (this.param2) == "function" ? this.param2() : this.param2;
            }

            if (this.param3 != null) {
                this.param3A = typeof (this.param3) == "function" ? this.param3() : this.param3;
            }

            this.cached = true;
        }
    }

    /**
     * Gets result of param 1
     */
    getParam1() {
        if (!this.cached) {
            this.cacheParams();
        }
        return this.param1A;
    }

    setParam1(val) {
        this.param1A = val;
    }

    /**
     * Gets result of param 2
     */
    getParam2() {
        if (!this.cached) {
            this.cacheParams();
        }
        return this.param2A;
    }

    setParam2(val) {
        this.param2A = val;
    }

    /**
     * Gets result of param 3
     */
    getParam3() {
        if (!this.cached) {
            this.cacheParams();
        }
        return this.param3A;
    }

    setParam3(val) {
        this.param3A = val;
    }

    resetCache() {
        this.param1A = this.param2A = this.param3A = null;
        this.cached = false;
    }
}

/**
 * Component that executes a chain of commands during the update loop
 */
export default class ChainingComponent extends Component {
    // stack of current scope
    scopeStack = new Stack();
    // current node
    current: ExNode = null;
    // linked list
    head: ExNode = null;
    tail: ExNode = null;
    // help parameters used for processing one node
    helpParam: any = null;
    helpParam2: any = null;

    /**
     * Repeats the following part of the chain until endRepeat()
     * @param num number of repetitions, 0 for infinite loop; or function that returns that number
     */
    beginRepeat(param: number | Func<void, number>): ChainingComponent {
        this.enqueue(CMD_BEGIN_REPEAT, param, param == 0);
        return this;
    }

    /**
     * Enclosing element for beginRepeat() command
     */
    endRepeat(): ChainingComponent {
        this.enqueue(CMD_END_REPEAT);
        return this;
    }

    /**
     * Executes a closure
     * @param {action} func function to execute 
     */
    execute(func: Action<ChainingComponent>): ChainingComponent {
        this.enqueue(CMD_EXECUTE, func);
        return this;
    }

    /**
     * Repeats the following part of the chain up to the endWhile() 
     * till the func() keeps returning true 
     * @param func function that returns either true or false
     */
    beginWhile(func: Func<void, boolean>): ChainingComponent {
        this.enqueue(CMD_BEGIN_WHILE, func);
        return this;
    }

    /**
     * Enclosing command for beginWhile()
     */
    endWhile(): ChainingComponent {
        this.enqueue(CMD_END_WHILE);
        return this;
    }

    /**
     * Starts an infinite loop that will repeat every num second  
     * @param num number of seconds to wait or function that returns that number
     */
    beginInterval(num: number | Func<void, number>): ChainingComponent {
        this.enqueue(CMD_BEGIN_INTERVAL, num);
        return this;
    }

    /**
     * Enclosing command for beginInterval()
     */
    endInterval(): ChainingComponent {
        this.enqueue(CMD_END_INTERVAL);
        return this;
    }

    /**
     * Checks an IF condition returned by 'func' and jumps to the next element,
     * behind the 'else' element or behind the 'endIf' element, if the condition is not met
     * @param func function that returns either true or false 
     */
    beginIf(func: Func<void, boolean>): ChainingComponent {
        this.enqueue(CMD_BEGIN_IF, func);
        return this;
    }

    /**
     * Defines a set of commands that are to be executed if the condition of the current
     * beginIf() command is not met
     */
    else(): ChainingComponent {
        this.enqueue(CMD_ELSE);
        return this;
    }

    /**
     * Enclosing command for beginIf()
     */
    endIf(): ChainingComponent {
        this.enqueue(CMD_END_IF);
        return this;
    }

    /**
     * Adds a new component to a given game object (or to an owner if not specified)
     * @param component component or function that returns a component
     * @param gameObj game object or function that returns a game object 
     */
    addComponent(component: Component | Func<void, Component>, gameObj: PIXICmp.ComponentObject | Func<void, PIXICmp.ComponentObject> = null): ChainingComponent {
        this.enqueue(CMD_ADD_COMPONENT, component, gameObj);
        return this;
    }

    /**
     * Adds a new component to a given game object (or to an owner if not specified) 
     * and waits until its finished
     * @param component component or function that returns a component 
     * @param gameObj game object or function that returns a game object 
     */
    addComponentAndWait(component: Component | Func<void, Component>, gameObj: PIXICmp.ComponentObject | Func<void, PIXICmp.ComponentObject> = null, removeWhenFinished: boolean = false): ChainingComponent {
        this.enqueue(CMD_ADD_COMPONENT_AND_WAIT, component, gameObj, removeWhenFinished);
        return this;
    }

    /**
     * Waits given amount of seconds
     * @param time number of seconds to wait; or function that returns this number 
     */
    waitTime(time: number | Func<void, number>): ChainingComponent {
        this.enqueue(CMD_WAIT_TIME, time);
        return this;
    }

    /**
     * Waits until given component isn't finished
     * @param component or function that returns this component 
     */
    waitForFinish(component: Component | Func<void, Component>): ChainingComponent {
        this.enqueue(CMD_WAIT_FOR_FINISH, component);
        return this;
    }

    /**
     * Waits until given function keeps returning true
     * @param func 
     */
    waitUntil(func: Func<void, boolean>): ChainingComponent {
        this.enqueue(CMD_WAIT_UNTIL, func);
        return this;
    }

    /**
     * Waits given number of iterations of update loop
     * @param num number of frames 
     */
    waitFrames(num: number): ChainingComponent {
        this.enqueue(CMD_WAIT_FRAMES, num);
        return this;
    }

    /**
     * Waits until a message with given key isn't sent
     * @param msg message key 
     */
    waitForMessage(msg: string): ChainingComponent {
        this.enqueue(CMD_WAIT_FOR_MESSAGE, msg);
        return this;
    }

    /**
     * Removes component from given game object (or the owner if null)
     * @param cmp name of the component or the component itself
     * @param gameObj 
     */
    removeComponent(cmp: string, gameObj: PIXICmp.ComponentObject = null): ChainingComponent {
        this.enqueue(CMD_REMOVE_COMPONENT, cmp, gameObj);
        return this;
    }

    /**
     * Removes a game object with given tag
     * @param tag 
     */
    removeGameObjectByTag(tag: string): ChainingComponent {
        this.enqueue(CMD_REMOVE_GAME_OBJECT_BY_TAG, tag);
        return this;
    }

    /**
     * Removes given game object
     * @param obj 
     */
    removeGameObject(obj: PIXICmp.ComponentObject): ChainingComponent {
        this.enqueue(CMD_REMOVE_GAME_OBJECT, obj);
        return this;
    }

    /**
     * Removes previous node from the chain
     */
    removePrevious(): ChainingComponent {
        this.enqueue(CMD_REMOVE_PREVIOUS);
        return this;
    }

    onMessage(msg: Msg) {
        this.helpParam2 = msg.action;
    }

    onUpdate(delta: number, absolute: number) {
        if (this.current == null) {
            // take next item
            this.current = this.dequeue();
        }

        if (this.current == null) {
            // no more items -> finish
            this.finish();
            return;
        }

        switch (this.current.key) {
            case CMD_BEGIN_REPEAT:
                // push context and go to the next item
                this.current.cacheParams();
                this.scopeStack.push(this.current);
                this.gotoNextImmediately(delta, absolute);
                break;
            case CMD_END_REPEAT:
                // pop context and jump
                let temp = this.scopeStack.pop();

                temp.setParam1(temp.getParam1() - 1); // decrement number of repetitions
                if (temp.getParam2() == true || // infinite loop
                    temp.getParam1() > 0) {
                    // jump to the beginning
                    this.current = temp;
                    this.onUpdate(delta, absolute);
                } else {
                    // reset values to their original state
                    temp.resetCache();
                    this.gotoNextImmediately(delta, absolute);
                }
                break;
            case CMD_EXECUTE:
                // execute a function and go to the next item
                this.current.param1(this);
                this.gotoNextImmediately(delta, absolute);
                break;
            case CMD_BEGIN_WHILE:
                // push context and go to the next item
                this.scopeStack.push(this.current);
                this.gotoNextImmediately(delta, absolute);
                break;
            case CMD_END_WHILE:
                // pop contex and check condition
                let temp2 = this.scopeStack.pop();
                if (temp2.param1()) { // check condition inside while()
                    // condition is true -> jump to the beginning
                    this.current = temp2;
                    this.onUpdate(delta, absolute);
                } else {
                    // condition is false -> go to the next item
                    this.gotoNextImmediately(delta, absolute);
                }
                break;
            case CMD_BEGIN_INTERVAL:
                if (!this.current.cached) {
                    this.current.cacheParams();
                }
                if (this.helpParam == null) {
                    // save the time into a variable and wait to the next update cycle
                    this.helpParam = absolute;
                } else if ((absolute - this.helpParam) >= this.current.getParam1()) {
                    // push context and go to the next ite
                    this.helpParam = null;
                    this.current.resetCache();
                    this.scopeStack.push(this.current);
                    this.gotoNextImmediately(delta, absolute);
                }
                break;
            case CMD_END_INTERVAL:
                // pop context and jump to the beginning
                this.current = this.scopeStack.pop();
                this.onUpdate(delta, absolute);
                break;
            case CMD_BEGIN_IF:
                if (this.current.param1()) {
                    // condition met -> go to then ext item 
                    this.gotoNextImmediately(delta, absolute);
                    break;
                }

                // condition not met -> we need to jump to the next ELSE or END-IF node
                let deepCounter = 1;
                while (true) {
                    // search for the next node we might jump into
                    this.current = this.dequeue();
                    if (this.current.key == CMD_BEGIN_IF) {
                        deepCounter++;
                    }
                    if (this.current.key == CMD_END_IF) {
                        deepCounter--;
                    }
                    // we need to find the next ELSE of END of the current scope
                    // thus, we have to skip all inner IF-ELSE branches
                    if ((deepCounter == 1 && this.current.key == CMD_ELSE) ||
                        deepCounter == 0 && this.current.key == CMD_END_IF) {
                        this.gotoNext();
                        break;
                    }
                }
                this.onUpdate(delta, absolute);
                break;
            case CMD_ELSE:
                // jump to the first END_IF block of the current branch
                let deepCounter2 = 1;
                while (true) {
                    this.current = this.dequeue();
                    if (this.current.key == CMD_BEGIN_IF) {
                        deepCounter2++;
                    }
                    if (this.current.key == CMD_END_IF) {
                        deepCounter2--;
                    }
                    if (deepCounter2 == 0 && this.current.key == CMD_END_IF) {
                        this.gotoNext();
                        break;
                    }
                }
                this.onUpdate(delta, absolute);
                break;
            case CMD_END_IF:
                // nothing to do here, just go to the next item
                this.gotoNextImmediately(delta, absolute);
                break;
            case CMD_WAIT_TIME:
                this.current.cacheParams();

                if (this.helpParam == null) {
                    // save the current time to a variable
                    this.helpParam = absolute;
                }

                if ((absolute - this.helpParam) > this.current.getParam1()) {
                    // it is time to go to the next item
                    this.helpParam = null;
                    this.current.resetCache();
                    this.gotoNextImmediately(delta, absolute);
                }
                break;
            case CMD_ADD_COMPONENT:
                // pop the object and its component, do the zamazingo thingy and go to the next item
                let gameObj = this.current.getParam2() != null ? this.current.getParam2() : this.owner;
                gameObj.addComponent(this.current.getParam1());
                this.gotoNextImmediately(delta, absolute);
                break;
            case CMD_ADD_COMPONENT_AND_WAIT:
                if (!this.current.cached) {
                    // add only once
                    this.current.cacheParams();
                    let gameObj = this.current.param2A != null ? this.current.param2A : this.owner;
                    gameObj.addComponent(this.current.param1A);
                }
                // wait for finish
                if (!this.current.getParam1().isRunning()) {
                    if (this.current.getParam3() == true) {
                        let gameObj = this.current.param2A != null ? this.current.param2A : this.owner;
                        // remove when finished
                        gameObj.removeComponentByClass(this.current.getParam1());
                    }

                    this.helpParam = null;
                    this.current.resetCache();
                    this.gotoNextImmediately(delta, absolute);
                }
                break;
            case CMD_WAIT_FOR_FINISH:
                // wait until isFinished is true
                if (!this.current.cached) {
                    this.current.cacheParams();
                }
                if (!this.current.getParam1().isRunning()) {
                    this.current.resetCache();
                    this.gotoNextImmediately(delta, absolute);
                }
                break;
            case CMD_WAIT_UNTIL:
                if (!this.current.param1()) {
                    this.gotoNextImmediately(delta, absolute);
                }
                break;
            case CMD_WAIT_FRAMES:
                // wait given number of update cycles
                if (this.helpParam == null) {
                    this.helpParam = 0;
                }

                if (++this.helpParam > this.current.param1) {
                    this.helpParam = null;
                    this.gotoNextImmediately(delta, absolute);
                }
                break;
            case CMD_WAIT_FOR_MESSAGE:
                // helpParam indicates that this component has already subscribed the message
                if (this.helpParam == true) {
                    if (this.helpParam2 == this.current.param1) {
                        // got message -> unsubscribe and proceed
                        this.unsubscribe(this.current.param1);
                        this.helpParam = this.helpParam2 = null;
                        this.gotoNextImmediately(delta, absolute);
                    }
                } else {
                    // just subscribe and wait
                    this.helpParam = true;
                    this.helpParam2 = null;
                    this.subscribe(this.current.param1);
                }
                break;
            case CMD_REMOVE_COMPONENT:
                // pop the object, the name of the component, remove it and go to the next item
                let gameObj2 = this.current.param2 != null ? this.current.param2 : this.owner;
                gameObj2.removeComponentByClass(this.current.param1);
                this.gotoNextImmediately(delta, absolute);
                break;
            case CMD_REMOVE_GAME_OBJECT_BY_TAG:
                let obj = this.scene.findFirstObjectByTag(this.current.param1);
                if (obj != null) {
                    obj.remove();
                }
                this.gotoNextImmediately(delta, absolute);
                break;
            case CMD_REMOVE_GAME_OBJECT:
                this.current.param1.remove();
                this.gotoNextImmediately(delta, absolute);
                break;
            case CMD_REMOVE_PREVIOUS:
                // remove previous node of this chaining component
                if (this.current.previous != null) {
                    if (this.current.previous.previous != null) {
                        this.current.previous.previous.next = this.current;
                    }
                    this.current.previous = this.current.previous.previous;
                }
                this.gotoNextImmediately(delta, absolute);
                break;
        }
    }

    protected enqueue(key: number, param1: any = null, param2: any = null, param3: any = null) {
        var node = new ExNode(key, param1, param2, param3);

        if (this.current != null && this.current != this.head) {
            // already running -> append to the current node
            let temp = this.current.next;
            this.current.next = node;
            node.next = temp;
            node.previous = this.current;
            temp.previous = node;
        } else {
            // not yet running -> append to the tail
            if (this.head == null) {
                this.head = this.tail = node;
            } else {
                this.tail.next = node;
                node.previous = this.tail;
                this.tail = node;
            }

            if (this.current == null) {
                this.current = this.head;
            }
        }
    }

    // dequeues a next node
    protected dequeue(): ExNode {
        if (this.current == null || this.current.next == null) {
            return null;
        } else {
            this.current = this.current.next;
        }
        return this.current;
    }

    // goes to the next node
    protected gotoNext() {
        this.current = this.current.next;
    }

    // goes to the next node and re-executes the update loop
    protected gotoNextImmediately(delta: number, absolute: number) {
        this.current = this.current.next;
        this.onUpdate(delta, absolute);
    }
}