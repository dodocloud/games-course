import GameObjectProxy from './GameObjectProxy';
import Msg from './Msg';
import Component from './Component';
import * as PIXI from 'pixi.js'
import { MSG_OBJECT_ADDED, MSG_OBJECT_REMOVED, MSG_ANY } from './Constants';
import { PIXICmp } from './PIXIObject';


/**
 * Structure for pending invocation, contains a function and a time 
 * at which it should be invoked
 */
class Invocation {
    delay = 0;
    time = 0;
    action: () => void = null;
}

// Scene that keeps collection of all game
// objects and calls draw and update upon them
export default class Scene {
    app: PIXI.Application;

    // stage in PixiApp
    root: PIXICmp.ComponentObject = null;
    // collection of actions that should be invoked with a delay
    private pendingInvocations = new Array<Invocation>();

    // message action keys and all subscribers that listens to all these actions
    private subscribers = new Map<string, Map<number, Component>>();
    // component ids and list of all actions they listen to
    private subscribedMessages = new Map<number, Array<string>>();
    // collection of all game objects, mapped by their tag and then by their ids
    private gameObjectTags = new Map<string, Map<number, GameObjectProxy>>();
    // collection of all game objects, mapped by their ids
    private gameObjects = new Map<number, GameObjectProxy>();

    constructor(app: PIXI.Application) {
        this.app = app;
        this.clearScene();
    }

    /**
     * Adds a new function that will be invoked after a given amount of time
     * @param delay delay in seconds 
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
     * Adds a component to the stage
     */
    addGlobalComponent(cmp: Component) {
        this.root.addComponent(cmp);
    }

    /**
     * Removes a component from a stage
     */
    removeGlobalComponent(cmp: Component) {
        this.root.removeComponent(cmp);
    }

    /**
     * Inserts a global attribute
     */
    addGlobalAttribute(key: string, val: any) {
        this.root.addAttribute(key, val);
    }

    /**
     * Gets a global attribute by its id
     */
    getGlobalAttribute(key: string): any {
        return this.root.getAttribute(key);
    }

    /**
     * Removes a global attribute by its key 
     */
    removeGlobalAttribute(key: string): boolean {
        return this.root.removeAttribute(key);
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
                result.push(<PIXICmp.ComponentObject><any>proxyObject.gameObject);
            }
        }

        return result;
    }

    findAllObjectsByFlag(flag: number): Array<PIXICmp.ComponentObject> {
        let result = new Array<PIXICmp.ComponentObject>();
        for (let [key, gameObject] of this.gameObjects) {
            if (gameObject.hasFlag(flag)) {
                let cmpObject = <PIXICmp.ComponentObject><any>gameObject.gameObject;
                result.push(cmpObject);
            }
        }
        return result;
    }

    /**
     * Finds a first object with a given tag
     * @param {String} tag
     * @returns {GameObject} 
     */
    findFirstObjectByTag(tag): PIXICmp.ComponentObject {
        if (this.gameObjectTags.has(tag)) {
            for (let [key, proxyObject] of this.gameObjectTags.get(tag)) {
                return <PIXICmp.ComponentObject><any>proxyObject.gameObject;
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

    // clears the whole scene, all game objects, attributes and components
    clearScene() {
        if (this.gameObjects != null) {
            // call the finalization function
            for (let [key, gameObj] of this.gameObjects) {
                for (let [key, component] of gameObj.components) {
                    component.onFinish();
                    component.onRemove();
                }
            }
        }

        let newStage = new PIXICmp.Container();
        this.app.stage = newStage; // reassign the default stage with our custom one
        newStage.proxy.scene = this; // assign scene
        this.root = newStage;
        this._addGameObject(newStage.proxy);
        this.app.stage.removeChildren(); // clear the stage

        // message action keys and all subscribers that listens to all these actions
        this.subscribers = new Map<string, Map<number, Component>>();
        // component ids and list of all actions they listen to
        this.subscribedMessages = new Map<number, Array<string>>();
        // collection of all game objects, mapped by their tag and then by their ids
        this.gameObjectTags = new Map<string, Map<number, GameObjectProxy>>();
        // collection of all game objects, mapped by their ids
        this.gameObjects = new Map<number, GameObjectProxy>();

        // functions that should be invoked with certain delay
        this.pendingInvocations = new Array<Invocation>();
    }

    // executes the update cycle
    _update(delta, absolute) {
        // execute pending invocations
        var i = this.pendingInvocations.length;
        while (i--) {
            let invocation = this.pendingInvocations[i];
            invocation.time += delta;

            if (invocation.time >= invocation.delay) {
                // it's time to invoke this one
                invocation.action();
                this.pendingInvocations.splice(i, 1);
            }
        }

        // update root object and all other objects recursively
        this.root.proxy.update(delta, absolute);
    }


    // subscribes given component for messaging system
    _subscribeComponent(msgKey, component) {
        var subs = this.subscribers.get(msgKey);
        if (subs === undefined) {
            subs = new Map();
            this.subscribers.set(msgKey, subs);
        }

        subs.set(component.id, component);

        // save into the second collection as well
        if (!this.subscribedMessages.has(component.id)) {
            this.subscribedMessages.set(component.id, new Array());
        }
        this.subscribedMessages.get(component.id).push(msgKey);
    }

    // unsubscribes given component
    _unsubscribeComponent(msgKey, component) {
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

        // assign scene
        obj.scene = this;

        // notify
        this.sendMessage(new Msg(MSG_OBJECT_ADDED, null, obj));
    }

    // immediately removes given game object
    _removeGameObject(obj) {
        this.gameObjectTags.get(obj.tag).delete(obj.id);
        this.gameObjects.delete(obj.id);

        // notify
        this.sendMessage(new Msg(MSG_OBJECT_REMOVED, null, obj));
    }

    // clears up everything that has something to do with given component
    _removeComponentSubscribing(component) {
        this.subscribedMessages.delete(component.id);

        if (this.subscribedMessages.has(component.id)) {
            let allMsgKeys = this.subscribedMessages.get(component.id);
            for (let msgKey of allMsgKeys) {
                this.subscribers.get(msgKey).delete(component.id);
            }
        }
    }
}