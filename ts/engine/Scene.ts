import GameObjectProxy from './GameObject';
import Msg from './Msg';
import Component from './Component';
import * as PIXI from 'pixi.js'
import {MSG_OBJECT_ADDED, MSG_OBJECT_REMOVED, MSG_ALL,
    STATE_DRAWABLE, STATE_INACTIVE, STATE_LISTENING, STATE_UPDATABLE} from './Constants';
   
import {PIXICmp} from './PIXIObject';


type updateEventFunc = (param1: number, param2: number) => void;

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
    canvas: HTMLCanvasElement;
    canvasCtx: CanvasRenderingContext2D;
    pixiApp: PIXI.Application;

    root: GameObjectProxy = null;
    
    private pendingInvocations = new Array<Invocation>();
    // message action keys and all subscribers that listens to all these actions
    private subscribers = new Map<string, Map<number, Component>>();
    // component ids and list of all actions they listen to
    private subscribedMessages = new Map<number, Array<string>>();
    // collection of all game objects, mapped by their tag and then by their ids
    private gameObjectTags = new Map<string, Map<number, GameObjectProxy>>();
    // collection of all game objects, mapped by their ids
    private gameObjects = new Map<number, GameObjectProxy>();

    constructor(canvas: HTMLCanvasElement, pixiApp: PIXI.Application) {
        this.canvas = canvas;
        this.pixiApp = pixiApp;
        this.canvasCtx = canvas.getContext('2d');
        this.clearScene();
    }

    /**
     * Adds a new function that will be invoked after given amount of time
     * @param {number} delay delay in seconds 
     * @param {action} action () => {} a function pointer with no arguments
     */
    addPendingInvocation(delay, action) {
        this.pendingInvocations.push({
            delay: delay,
            time: 0,
            action: action
        });
    }

    addGlobalComponent(cmp) {
        this.root.addComponent(cmp);
    }

    removeGlobalComponent(cmp) {
        this.root.removeComponent(cmp);
    }

    // adds a new global attribute
    addGlobalAttribute(key, val) {
        this.root.addAttribute(key, val);
    }

    // gets a global attribute by its key
    getGlobalAttribute(key) {
        return this.root.getAttribute(key);
    }

    // removes a global attribute by its key
    removeGlobalAttribute(key) {
        this.root.removeAttribute(key);
    }

    /**
     * Finds all game objects by their tag
     * @param {String} tag tag of the object
     * @returns {Array<GameObject>} 
     */
    findAllObjectsByTag(tag: string) {
        let result = new Array();
        if (this.gameObjectTags.has(tag)) {
            let gameObjects = this.gameObjectTags.get(tag);
            for (let [key, gameObject] of gameObjects) {
                result.push(gameObject);
            }
        }

        return result;
    }

    /**
     * Finds a first object with a given tag
     * @param {String} tag
     * @returns {GameObject} 
     */
    findFirstObjectByTag(tag) {
        if (this.gameObjectTags.has(tag)) {
            for (let [key, gameObject] of this.gameObjectTags.get(tag)) {
                return gameObject; // return the first one
            }
        }
        return null;
    }

    // clears the whole scene, all game objects, attributes and components
    clearScene() {
        if (this.gameObjects != null) {
            // call the finalization function
            for (let [key, gameObj] of this.gameObjects) {
                for (let component of gameObj.components) {
                    component.finalize();
                }
            }
        }

        let newStage = new PIXICmp.Container();
        this.pixiApp.stage = newStage;
        newStage.proxy.scene = this; // this will be passed to all children
        this.root = newStage.proxy;
        this.addGameObject(newStage.proxy);
        this.pixiApp.stage.removeChildren();


        // message action keys and all subscribers that listens to all these actions
        this.subscribers = new Map<string, Map<number, Component>>();
        // component ids and list of all actions they listen to
        this.subscribedMessages = new Map<number, Array<string>>();
        // collection of all game objects, mapped by their tag and then by their ids
        this.gameObjectTags = new Map<string, Map<number, GameObjectProxy>>();
        // collection of all game objects, mapped by their ids
        this.gameObjects = new Map<number, GameObjectProxy>();

        // functions that should be invoked with some delay
        this.pendingInvocations = new Array<Invocation>();
    }

    // executes the update cycle
    update(delta, absolute) {
        // execute pending invocations
        var i = this.pendingInvocations.length;
        while (i--) {
            let invocation = this.pendingInvocations[i];
            invocation.time += delta;

            if (invocation.time >= invocation.delay) {
                invocation.action();
                this.pendingInvocations.splice(i, 1);
            }
        }

        this.root.update(delta, absolute);
    }

    /**
     * Finds a first object with a given tag
     */
    sendmsg(action: string, data: any = null) {
        this.sendmsgEntity(new Msg(action, null, null, data));
    }

    // sends message to all subscribers
    sendmsgEntity(msg: Msg) {
        if (this.subscribers.has(msg.action)) {
            // get all subscribed components
            let subscribedComponents = this.subscribers.get(msg.action);
            for (let [key, component] of subscribedComponents) {
                // send message
                component.onmessage(msg);
            }
        }
        if (this.subscribers.has(MSG_ALL)) {
            let globalSubs = this.subscribers.get(MSG_ALL);
            for (let [key, component] of globalSubs) {
                component.onmessage(msg);
            }
        }
    }

    // subscribes given component for messaging system
    subscribeComponent(msgKey, component) {
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

    unsubscribeComponent(msgKey, component) {
        var subs = this.subscribers.get(msgKey);
        if (subs !== undefined) {
            subs.delete(component.id);
        }

        this.subscribedMessages.delete(component.id);
    }

    addGameObject(obj : GameObjectProxy) {
        // fill all collections
        if (!this.gameObjectTags.has(obj.tag)) {
            this.gameObjectTags.set(obj.tag, new Map());
        }

        this.gameObjectTags.get(obj.tag).set(obj.id, obj);
        this.gameObjects.set(obj.id, obj);
        obj.scene = this;

        // notify subscribers that a new object has been added to the scene
        this.sendmsgEntity(new Msg(MSG_OBJECT_ADDED, null, obj));
    }

    // immediately removes a given game object
    removeGameObject(obj) {
        this.gameObjectTags.get(obj.tag).delete(obj.id);
        this.gameObjects.delete(obj.id);

        // send message that the game object has been removed
        this.sendmsgEntity(new Msg(MSG_OBJECT_REMOVED, null, obj));
    }


    removeComponent(component) {
        this.subscribedMessages.delete(component.id);

        if (this.subscribedMessages.has(component.id)) {
            let allMsgKeys = this.subscribedMessages.get(component.id);
            for (let msgKey of allMsgKeys) {
                this.subscribers.get(msgKey).delete(component.id);
            }
        }
    }
}