import Msg from '../engine/Msg';
import Component from '../engine/Component';

/**
 * Builder for generic components
 */
export class GenericComponent extends Component {
    name: string;
    private onInitFunc: (cmp: Component) => void = null;
    private onMessageFuncs = new Map<string, (cmp: Component, msg: Msg) => void>();
    private onUpdateFunc: (cmp: Component, delta: number, absolute: number) => void = null;
    private onRemoveFunc: (cmp: Component) => void = null;
    private onFinishFunc: (cmp: Component) => void = null;

    /**
     * Creates a new generic component
     * @param name name that will be used instead of class name within the scene
     */
    constructor(name: string) {
        super();
        this.name = name;
    }

    /**
     * Registers a function that will be invoked for onInit()
     */
    doOnInit(func: (cmp: Component) => void): GenericComponent {
        this.onInitFunc = func;
        return this;
    }

    /**
     * Registers a function that will be invoked when a specific message arrives
     */
    doOnMessage(action: string, handler: (cmp: Component, msg: Msg) => void): GenericComponent {
        this.onMessageFuncs.set(action, handler);
        return this;
    }

    /**
     * Registers a function that will be invoked for onUpdate
     */
    doOnUpdate(func: (cmp: Component, delta: number, absolute: number) => void): GenericComponent {
        this.onUpdateFunc = func;
        return this;
    }

    /**
     * Registers a function that will be invoked for onRemove()
     */
    doOnRemove(func: (cmp: Component) => void): GenericComponent {
        this.onRemoveFunc = func;
        return this;
    }

    /**
     * Registers a function that will be invoked for onFinish()
     */
    doOnFinish(func: (cmp: Component) => void): GenericComponent {
        this.onFinishFunc = func;
        return this;
    }

    onInit() {
        if (this.onInitFunc != null) {
            this.onInitFunc(this);
        }

        // register all messages
        for (let [key, func] of this.onMessageFuncs) {
            this.subscribe(key);
        }
    }

    onMessage(msg: Msg) {
        if (this.onMessageFuncs.has(msg.action)) {
            this.onMessageFuncs.get(msg.action)(this, msg);
        }
    }

    onUpdate(delta: number, absolute: number) {
        if (this.onUpdateFunc != null) {
            this.onUpdateFunc(this, delta, absolute);
        }
    }

    onRemove() {
        if (this.onRemoveFunc != null) {
            this.onRemoveFunc(this);
        }
    }

    onFinish() {
        if (this.onFinishFunc != null) {
            this.onFinishFunc(this);
        }
    }
}