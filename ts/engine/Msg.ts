import Component from './Component';
import GameObjectProxy from './GameObject';

// Message entity that keeps custom data, a source object and component
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
    gameObject: GameObjectProxy = null;
    /**
     * Data payload
     */
    data: any = null;

    constructor(action, component, gameObject, data = null) {
        this.action = action;
        this.component = component;
        this.gameObject = gameObject;
        this.data = data;
    }
}