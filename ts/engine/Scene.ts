import GameObjectProxy from './GameObjectProxy';
import Msg from './Msg';
import Component from './Component';
import * as PIXI from 'pixi.js'
import { MSG_OBJECT_ADDED, MSG_OBJECT_REMOVED, MSG_ANY } from './Constants';
import { PIXICmp } from './PIXIObject';


/**
 * Class for action that is to be executed with certain delay
 */
class Invocation {
    delay = 0; // time of invocation 
    time = 0; // time of creation
    action: () => void = null; // action to execute
}

/**
 * Scene that keeps collection of all game objects and component listeners
 */
export default class Scene {
    app: PIXI.Application;

    // PIXI stage object 
    stage: PIXICmp.ComponentObject = null;
    // collection of actions that should be invoked with a delay
    private pendingInvocations: Array<any>;
    // message action keys and all subscribers that listens to all these actions
    private subscribers: Map<string, Map<number, Component>>;
    // component ids and list of all actions they are listening to
    private subscribedMessages: Map<number, Array<string>>;
    // collection of all game objects, mapped by their tag and then by their ids (for faster search)
    private gameObjectTags: Map<string, Map<number, GameObjectProxy>>;
    // collection of all game objects, mapped by their ids
    private gameObjects: Map<number, GameObjectProxy>;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.clearScene();
    }

    /**
     * Adds a new function that will be invoked after a given amount of time
     * @param delay delay in miliseconds 
     * @param aaction function pointer with no arguments
     */
    invokeWithDelay(delay: number, action: () => void) {
        this.pendingInvocations.push({
            delay: delay,
            time: 0,
            action: action
        });
    }

    /**
     * Adds a component to the stage object
     */
    addGlobalComponent(cmp: Component) {
        this.stage.addComponent(cmp);
    }

    /**
    * Tries to find a global component by its class
    */
    findGlobalComponentByClass(className: string): Component {
        return this.stage.findComponentByClass(className);
    }

    /**
     * Removes a component from a stage object
     */
    removeGlobalComponent(cmp: Component) {
        this.stage.removeComponent(cmp);
    }

    /**
     * Inserts a global attribute
     */
    addGlobalAttribute(key: string, val: any) {
        this.stage.addAttribute(key, val);
    }

    /**
     * Gets a global attribute by its id
     */
    getGlobalAttribute<T>(key: string): T {
        return this.stage.getAttribute<T>(key);
    }

    /**
     * Removes a global attribute by its key 
     */
    removeGlobalAttribute(key: string): boolean {
        return this.stage.removeAttribute(key);
    }

    /**
     * Finds all game objects by their tag
     */
    findAllObjectsByTag(tag: string): Array<PIXICmp.ComponentObject> {
        let result = new Array<PIXICmp.ComponentObject>();
        if (this.gameObjectTags.has(tag)) {
            let gameObjects = this.gameObjectTags.get(tag);
            for (let [key, proxyObject] of gameObjects) {
                // cast to ComponentObject
                result.push(<PIXICmp.ComponentObject><any>proxyObject.pixiObj);
            }
        }

        return result;
    }

    /**
     * Finds all game objects that have set given flag
     */
    findAllObjectsByFlag(flag: number): Array<PIXICmp.ComponentObject> {
        let result = new Array<PIXICmp.ComponentObject>();
        // no optimization here
        for (let [key, gameObject] of this.gameObjects) {
            if (gameObject.hasFlag(flag)) {
                let cmpObject = <PIXICmp.ComponentObject><any>gameObject.pixiObj;
                result.push(cmpObject);
            }
        }
        return result;
    }

    /**
     * Finds a first object with a given tag
     */
    findFirstObjectByTag(tag: string): PIXICmp.ComponentObject {
        if (this.gameObjectTags.has(tag)) {
            for (let [key, proxyObject] of this.gameObjectTags.get(tag)) {
                return <PIXICmp.ComponentObject><any>proxyObject.pixiObj;
            }
        }
        return null;
    }

    /**
     * Sends message to all subscribers
     */
    sendMessage(msg: Msg) {
        if (this.subscribers.has(msg.action)) {
            // get all subscribed components
            let subscribedComponents = this.subscribers.get(msg.action);
            for (let [key, component] of subscribedComponents) {
                // send message
                component.onMessage(msg);
            }
        }

        // check global subscribers
        if (this.subscribers.has(MSG_ANY)) {
            let globalSubs = this.subscribers.get(MSG_ANY);
            for (let [key, component] of globalSubs) {
                component.onMessage(msg);
            }
        }
    }

    /**
     * Removes all objects from scene
     */
    clearScene() {
        if (this.gameObjects != null) {
            // call the finalization function of all components
            for (let [key, gameObj] of this.gameObjects) {
                for (let [key, component] of gameObj.components) {
                    component.onFinish();
                    component.onRemove();
                }
            }
        }

        // reinitialize everything
        this.subscribers = new Map<string, Map<number, Component>>();
        this.subscribedMessages = new Map<number, Array<string>>();
        this.gameObjectTags = new Map<string, Map<number, GameObjectProxy>>();
        this.gameObjects = new Map<number, GameObjectProxy>();
        this.pendingInvocations = new Array<Invocation>();

        let newStage = new PIXICmp.Container();
        this.app.stage = newStage; // reassign the default stage with our custom one (we need objects from PIXICmp namespace only)
        newStage.proxy.scene = this; // assign a scene
        this.stage = newStage;
        this._addGameObject(newStage.proxy);
        this.app.stage.removeChildren(); // clear the stage

    }

    // executes the update cycle
    _update(delta: number, absolute: number) {
        // execute pending invocations
        var i = this.pendingInvocations.length;
        while (i--) {
            let invocation = this.pendingInvocations[i];
            invocation.time += delta;

            if (invocation.time >= invocation.delay) {
                // call the function and remove it from the collection
                this.pendingInvocations.splice(i, 1);
                invocation.action();
            }
        }

        // update root object and all other objects recursively
        this.stage.proxy.update(delta, absolute);
    }


    // subscribes given component for messaging system
    _subscribeComponent(msgKey: string, component: Component) {
        var subs = this.subscribers.get(msgKey);
        if (subs === undefined) {
            subs = new Map();
            this.subscribers.set(msgKey, subs);
        }

        if (subs.has(component.id)) {
            // this component has been already subscribed!
            return;
        }

        subs.set(component.id, component);

        // save into the second collection as well
        if (!this.subscribedMessages.has(component.id)) {
            this.subscribedMessages.set(component.id, new Array());
        }
        this.subscribedMessages.get(component.id).push(msgKey);
    }

    // unsubscribes given component
    _unsubscribeComponent(msgKey: string, component: Component) {
        var subs = this.subscribers.get(msgKey);
        if (subs !== undefined) {
            subs.delete(component.id);
        }

        this.subscribedMessages.delete(component.id);
    }

    _addGameObject(obj: GameObjectProxy) {
        // fill all collections
        if (!this.gameObjectTags.has(obj.tag)) {
            this.gameObjectTags.set(obj.tag, new Map());
        }

        this.gameObjectTags.get(obj.tag).set(obj.id, obj);
        this.gameObjects.set(obj.id, obj);

        // assign scene to all components (must be done for the case when components were added beforehand
        for (let [key, component] of obj.components) {
            component.scene = this;
        }

        // assign scene
        obj.scene = this;
        // notify listeners
        this.sendMessage(new Msg(MSG_OBJECT_ADDED, null, <PIXICmp.ComponentObject><any>obj.pixiObj));
    }

    // immediately removes given game object
    _removeGameObject(obj: GameObjectProxy) {
        this.gameObjectTags.get(obj.tag).delete(obj.id);
        this.gameObjects.delete(obj.id);
        // notify listeners
        this.sendMessage(new Msg(MSG_OBJECT_REMOVED, null, <PIXICmp.ComponentObject><any>obj.pixiObj));
    }

    // clears up everything that has something to do with given component
    _removeComponentSubscription(component: Component) {
        this.subscribedMessages.delete(component.id);

        if (this.subscribedMessages.has(component.id)) {
            let allMsgKeys = this.subscribedMessages.get(component.id);
            for (let msgKey of allMsgKeys) {
                this.subscribers.get(msgKey).delete(component.id);
            }
        }
    }
}