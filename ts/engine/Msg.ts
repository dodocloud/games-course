import Component from './Component';
import { PIXICmp } from './PIXIObject';

/**
 * Message that stores type of action, a relevant component, a relevant game object and custom data if needed
 */
export default class Msg {

    /**
    * Action type identifier
    */
    action: string = null;

    /**
    * Component that sent this message
    */
    component: Component = null;

    /**
    * GameObject attached to this message
    */
    gameObject: PIXICmp.ComponentObject = null;
    
    /**
     * Data payload
     */
    data: any = null;

    constructor(action: string, component: Component, gameObject: PIXICmp.ComponentObject, data = null) {
        this.action = action;
        this.component = component;
        this.gameObject = gameObject;
        this.data = data;
    }
}