import Component from './Component';
import GameObjectProxy from './GameObjectProxy';
import Scene from './Scene';

/**
 * Namespace for all PIXI objects that are to be 
 * integrated with the component architecture
 */
export namespace PIXICmp {

    /**
     * PIXI object attached to the component architecture
     */
    export interface ComponentObject {
        /**
         * Link to proxy object, <<<shouldn't be used from within any custom component>>>
         */
        proxy: GameObjectProxy;
        /**
         * Returns wrapped pixi object
         */
        getPixiObj(): PIXI.Container;
        /**
         * Returns tag of this object
         */
        getTag(): string;
        /**
         * Adds a new component
         */
        addComponent(component: Component);
        /**
         * Removes an existing component
         */
        removeComponent(component: Component);
        /**
         * Removes component by given class name
         */
        removeComponentByClass(name: string): boolean;
        /**
         * Tries to find a component by its class
         */
        findComponentByClass(name: string): Component;
        /**
         * Adds a new generic attribute
         */
        addAttribute(key: string, val: any);
        /**
         * Returns an attribute by its key
         */
        getAttribute<T>(key: string): T;
        /**
         * Removes an existing attribute
         * Returns true if the attribute was successfully removed
         */
        removeAttribute(key: string): boolean;
        /**
        * Sets flag at given index
        */
        setFlag(flag: number);
        /**
         * Resets flag at given index
         */
        resetFlag(flag: number);
        /**
         * Returns true, if there is a flag set at given index
         */
        hasFlag(flag: number): boolean;
        /**
         * Inverts a flag at given index
         */
        invertFlag(flag: number);
        /**
         * Gets state of this object
         */
        getState(): number;
        /**
         * Sets state of this object
         */
        setState(state: number);
        /**
         * Removes itself from its parent
         */
        remove();
        /**
         * Gets link to a scene
         */
        getScene(): Scene;

    }

    /**
     * Wrapper for PIXI.Graphics
     */
    export class Graphics extends PIXI.Graphics implements ComponentObject {
        proxy: GameObjectProxy;

        constructor(tag: string = "") {
            super();
            this.proxy = new GameObjectProxy(tag, this);
        }

        // overrides pixijs function
        addChild<T extends PIXI.DisplayObject>(
            child: T,
            ...additionalChildren: PIXI.DisplayObject[]
        ): T {
            let newChild = super.addChild(child, ...additionalChildren);
            let cmbObj = <ComponentObject><any>newChild;
            this.proxy.onChildAdded(cmbObj.proxy);

            for (let additional of additionalChildren) {
                cmbObj = <ComponentObject><any>additional;
                this.proxy.onChildAdded(cmbObj.proxy);
            }

            return newChild;
        }

        // overrides pixijs function
        addChildAt<T extends PIXI.DisplayObject>(child: T, index: number): T {
            let newChild = super.addChildAt(child, index);
            let cmbObj = <ComponentObject><any>newChild;
            this.proxy.onChildAdded(cmbObj.proxy);
            return newChild;
        }

        // overrides pixijs function
        removeChild(child: PIXI.DisplayObject): PIXI.DisplayObject {
            let removed = super.removeChild(child);
            let cmpObj = <ComponentObject><any>removed;
            this.proxy.onChildRemoved(cmpObj.proxy);
            return removed;
        }

        // overrides pixijs function
        removeChildAt(index: number): PIXI.DisplayObject {
            let removed = super.removeChildAt(index);
            let cmpObj = <ComponentObject><any>removed;
            this.proxy.onChildRemoved(cmpObj.proxy);
            return removed;
        }

        // overrides pixijs function
        removeChildren(beginIndex?: number, endIndex?: number): PIXI.DisplayObject[] {
            let removed = super.removeChildren(beginIndex, endIndex);
            for (let removedObj of removed) {
                let cmpObj = <ComponentObject><any>removedObj;
                this.proxy.onChildRemoved(cmpObj.proxy);
            }
            return removed;
        }

        getTag(): string {
            return this.proxy.tag;
        }

        addComponent(component: Component) {
            this.proxy.addComponent(component);
        }
        removeComponent(component: Component) {
            this.proxy.removeComponent(component);
        }
        removeComponentByClass(name: string): boolean {
            return this.proxy.removeComponentByClass(name);
        }
        findComponentByClass(name: string): Component {
            return this.proxy.findComponentByClass(name);
        }
        addAttribute(key: string, val: any) {
            this.proxy.addAttribute(key, val);
        }
        getAttribute<T>(key: string): T {
            return this.proxy.getAttribute<T>(key);
        }
        removeAttribute(key: string): boolean {
            return this.proxy.removeAttribute(key);
        }
        setFlag(flag: number) {
            this.proxy.setFlag(flag);
        }
        resetFlag(flag: number) {
            this.proxy.resetFlag(flag);
        }
        hasFlag(flag: number): boolean {
            return this.proxy.hasFlag(flag);
        }
        invertFlag(flag: number) {
            this.proxy.invertFlag(flag);
        }
        getState(): number {
            return this.proxy.getState();
        }
        setState(state: number) {
            this.proxy.setState(state);
        }
        getPixiObj(): PIXI.Container {
            return this.proxy.pixiObj;
        }
        remove() {
            this.parent.removeChild(this);
        }
        getScene(): Scene {
            return this.proxy.scene;
        }
    }

    /**
     * Wrapper for PIXI.Container
     */
    export class Container extends PIXI.Container implements ComponentObject {
        proxy: GameObjectProxy;

        constructor(tag: string = "") {
            super();
            this.proxy = new GameObjectProxy(tag, this);
        }

        // overrides pixijs function
        addChild<T extends PIXI.DisplayObject>(
            child: T,
            ...additionalChildren: PIXI.DisplayObject[]
        ): T {
            let newChild = super.addChild(child, ...additionalChildren);
            let cmbObj = <ComponentObject><any>newChild;
            this.proxy.onChildAdded(cmbObj.proxy);

            for (let additional of additionalChildren) {
                cmbObj = <ComponentObject><any>additional;
                this.proxy.onChildAdded(cmbObj.proxy);
            }

            return newChild;
        }

        // overrides pixijs function
        addChildAt<T extends PIXI.DisplayObject>(child: T, index: number): T {
            let newChild = super.addChildAt(child, index);
            let cmbObj = <ComponentObject><any>newChild;
            this.proxy.onChildAdded(cmbObj.proxy);
            return newChild;
        }

        // overrides pixijs function
        removeChild(child: PIXI.DisplayObject): PIXI.DisplayObject {
            let removed = super.removeChild(child);
            let cmpObj = <ComponentObject><any>removed;
            this.proxy.onChildRemoved(cmpObj.proxy);
            return removed;
        }

        // overrides pixijs function
        removeChildAt(index: number): PIXI.DisplayObject {
            let removed = super.removeChildAt(index);
            let cmpObj = <ComponentObject><any>removed;
            this.proxy.onChildRemoved(cmpObj.proxy);
            return removed;
        }

        // overrides pixijs function
        removeChildren(beginIndex?: number, endIndex?: number): PIXI.DisplayObject[] {
            let removed = super.removeChildren(beginIndex, endIndex);
            for (let removedObj of removed) {
                let cmpObj = <ComponentObject><any>removedObj;
                this.proxy.onChildRemoved(cmpObj.proxy);
            }
            return removed;
        }

        getTag(): string {
            return this.proxy.tag;
        }

        addComponent(component: Component) {
            this.proxy.addComponent(component);
        }
        removeComponent(component: Component) {
            this.proxy.removeComponent(component);
        }
        removeComponentByClass(name: string): boolean {
            return this.proxy.removeComponentByClass(name);
        }
        findComponentByClass(name: string): Component {
            return this.proxy.findComponentByClass(name);
        }
        addAttribute(key: string, val: any) {
            this.proxy.addAttribute(key, val);
        }
        getAttribute<T>(key: string): T {
            return this.proxy.getAttribute<T>(key);
        }
        removeAttribute(key: string): boolean {
            return this.proxy.removeAttribute(key);
        }
        setFlag(flag: number) {
            this.proxy.setFlag(flag);
        }
        resetFlag(flag: number) {
            this.proxy.resetFlag(flag);
        }
        hasFlag(flag: number): boolean {
            return this.proxy.hasFlag(flag);
        }
        invertFlag(flag: number) {
            this.proxy.invertFlag(flag);
        }
        getState(): number {
            return this.proxy.getState();
        }
        setState(state: number) {
            this.proxy.setState(state);
        }
        getPixiObj(): PIXI.Container {
            return this.proxy.pixiObj;
        }
        remove() {
            this.parent.removeChild(this);
        }
        getScene(): Scene {
            return this.proxy.scene;
        }
    }

    /**
     * Wrapper for PIXI.Sprite
     */
    export class Sprite extends PIXI.Sprite implements ComponentObject {
        proxy: GameObjectProxy;

        constructor(tag: string = "", texture?: PIXI.Texture) {
            super(texture);
            this.proxy = new GameObjectProxy(tag, this);
        }

        // overrides pixijs function
        addChild<T extends PIXI.DisplayObject>(
            child: T,
            ...additionalChildren: PIXI.DisplayObject[]
        ): T {
            let newChild = super.addChild(child, ...additionalChildren);
            let cmbObj = <ComponentObject><any>newChild;
            this.proxy.onChildAdded(cmbObj.proxy);

            for (let additional of additionalChildren) {
                cmbObj = <ComponentObject><any>additional;
                this.proxy.onChildAdded(cmbObj.proxy);
            }

            return newChild;
        }

        // overrides pixijs function
        addChildAt<T extends PIXI.DisplayObject>(child: T, index: number): T {
            let newChild = super.addChildAt(child, index);
            let cmbObj = <ComponentObject><any>newChild;
            this.proxy.onChildAdded(cmbObj.proxy);
            return newChild;
        }

        // overrides pixijs function
        removeChild(child: PIXI.DisplayObject): PIXI.DisplayObject {
            let removed = super.removeChild(child);
            let cmpObj = <ComponentObject><any>removed;
            this.proxy.onChildRemoved(cmpObj.proxy);
            return removed;
        }

        // overrides pixijs function
        removeChildAt(index: number): PIXI.DisplayObject {
            let removed = super.removeChildAt(index);
            let cmpObj = <ComponentObject><any>removed;
            this.proxy.onChildRemoved(cmpObj.proxy);
            return removed;
        }

        // overrides pixijs function
        removeChildren(beginIndex?: number, endIndex?: number): PIXI.DisplayObject[] {
            let removed = super.removeChildren(beginIndex, endIndex);
            for (let removedObj of removed) {
                let cmpObj = <ComponentObject><any>removedObj;
                this.proxy.onChildRemoved(cmpObj.proxy);
            }
            return removed;
        }

        getTag(): string {
            return this.proxy.tag;
        }

        addComponent(component: Component) {
            this.proxy.addComponent(component);
        }
        removeComponent(component: Component) {
            this.proxy.removeComponent(component);
        }
        removeComponentByClass(name: string): boolean {
            return this.proxy.removeComponentByClass(name);
        }
        findComponentByClass(name: string): Component {
            return this.proxy.findComponentByClass(name);
        }
        addAttribute(key: string, val: any) {
            this.proxy.addAttribute(key, val);
        }
        getAttribute<T>(key: string): T {
            return this.proxy.getAttribute<T>(key);
        }
        removeAttribute(key: string): boolean {
            return this.proxy.removeAttribute(key);
        }
        setFlag(flag: number) {
            this.proxy.setFlag(flag);
        }
        resetFlag(flag: number) {
            this.proxy.resetFlag(flag);
        }
        hasFlag(flag: number): boolean {
            return this.proxy.hasFlag(flag);
        }
        invertFlag(flag: number) {
            this.proxy.invertFlag(flag);
        }
        getState(): number {
            return this.proxy.getState();
        }
        setState(state: number) {
            this.proxy.setState(state);
        }
        getPixiObj(): PIXI.Container {
            return this.proxy.pixiObj;
        }
        remove() {
            this.parent.removeChild(this);
        }
        getScene(): Scene {
            return this.proxy.scene;
        }
    }

    /**
     * Wrapper for PIXI.ParticleContainer
     */
    export class ParticleContainer extends PIXI.particles.ParticleContainer implements ComponentObject {
        proxy: GameObjectProxy;

        constructor(tag: string = "") {
            super();
            this.proxy = new GameObjectProxy(tag, this);
        }

        // overrides pixijs function
        addChild<T extends PIXI.DisplayObject>(
            child: T,
            ...additionalChildren: PIXI.DisplayObject[]
        ): T {
            let newChild = super.addChild(child, ...additionalChildren);
            let cmbObj = <ComponentObject><any>newChild;
            this.proxy.onChildAdded(cmbObj.proxy);

            for (let additional of additionalChildren) {
                cmbObj = <ComponentObject><any>additional;
                this.proxy.onChildAdded(cmbObj.proxy);
            }

            return newChild;
        }

        // overrides pixijs function
        addChildAt<T extends PIXI.DisplayObject>(child: T, index: number): T {
            let newChild = super.addChildAt(child, index);
            let cmbObj = <ComponentObject><any>newChild;
            this.proxy.onChildAdded(cmbObj.proxy);
            return newChild;
        }

        // overrides pixijs function
        removeChild(child: PIXI.DisplayObject): PIXI.DisplayObject {
            let removed = super.removeChild(child);
            let cmpObj = <ComponentObject><any>removed;
            this.proxy.onChildRemoved(cmpObj.proxy);
            return removed;
        }

        // overrides pixijs function
        removeChildAt(index: number): PIXI.DisplayObject {
            let removed = super.removeChildAt(index);
            let cmpObj = <ComponentObject><any>removed;
            this.proxy.onChildRemoved(cmpObj.proxy);
            return removed;
        }

        // overrides pixijs function
        removeChildren(beginIndex?: number, endIndex?: number): PIXI.DisplayObject[] {
            let removed = super.removeChildren(beginIndex, endIndex);
            for (let removedObj of removed) {
                let cmpObj = <ComponentObject><any>removedObj;
                this.proxy.onChildRemoved(cmpObj.proxy);
            }
            return removed;
        }

        getTag(): string {
            return this.proxy.tag;
        }

        addComponent(component: Component) {
            this.proxy.addComponent(component);
        }
        removeComponent(component: Component) {
            this.proxy.removeComponent(component);
        }
        removeComponentByClass(name: string): boolean {
            return this.proxy.removeComponentByClass(name);
        }
        findComponentByClass(name: string): Component {
            return this.proxy.findComponentByClass(name);
        }
        addAttribute(key: string, val: any) {
            this.proxy.addAttribute(key, val);
        }
        getAttribute<T>(key: string): T {
            return this.proxy.getAttribute<T>(key);
        }
        removeAttribute(key: string): boolean {
            return this.proxy.removeAttribute(key);
        }
        setFlag(flag: number) {
            this.proxy.setFlag(flag);
        }
        resetFlag(flag: number) {
            this.proxy.resetFlag(flag);
        }
        hasFlag(flag: number): boolean {
            return this.proxy.hasFlag(flag);
        }
        invertFlag(flag: number) {
            this.proxy.invertFlag(flag);
        }
        getState(): number {
            return this.proxy.getState();
        }
        setState(state: number) {
            this.proxy.setState(state);
        }
        getPixiObj(): PIXI.Container {
            return this.proxy.pixiObj;
        }
        remove() {
            this.parent.removeChild(this);
        }
        getScene(): Scene {
            return this.proxy.scene;
        }
    }

    /**
     * Wrapper for PIXI.Text
     */
    export class Text extends PIXI.Text implements ComponentObject {
        proxy: GameObjectProxy;

        constructor(tag: string = "", text: string = "") {
            super(text);
            this.proxy = new GameObjectProxy(tag, this);
        }

        // overrides pixijs function
        addChild<T extends PIXI.DisplayObject>(
            child: T,
            ...additionalChildren: PIXI.DisplayObject[]
        ): T {
            let newChild = super.addChild(child, ...additionalChildren);
            let cmbObj = <ComponentObject><any>newChild;
            this.proxy.onChildAdded(cmbObj.proxy);

            for (let additional of additionalChildren) {
                cmbObj = <ComponentObject><any>additional;
                this.proxy.onChildAdded(cmbObj.proxy);
            }

            return newChild;
        }

        // overrides pixijs function
        addChildAt<T extends PIXI.DisplayObject>(child: T, index: number): T {
            let newChild = super.addChildAt(child, index);
            let cmbObj = <ComponentObject><any>newChild;
            this.proxy.onChildAdded(cmbObj.proxy);
            return newChild;
        }

        // overrides pixijs function
        removeChild(child: PIXI.DisplayObject): PIXI.DisplayObject {
            let removed = super.removeChild(child);
            let cmpObj = <ComponentObject><any>removed;
            this.proxy.onChildRemoved(cmpObj.proxy);
            return removed;
        }

        // overrides pixijs function
        removeChildAt(index: number): PIXI.DisplayObject {
            let removed = super.removeChildAt(index);
            let cmpObj = <ComponentObject><any>removed;
            this.proxy.onChildRemoved(cmpObj.proxy);
            return removed;
        }

        // overrides pixijs function
        removeChildren(beginIndex?: number, endIndex?: number): PIXI.DisplayObject[] {
            let removed = super.removeChildren(beginIndex, endIndex);
            for (let removedObj of removed) {
                let cmpObj = <ComponentObject><any>removedObj;
                this.proxy.onChildRemoved(cmpObj.proxy);
            }
            return removed;
        }

        getTag(): string {
            return this.proxy.tag;
        }

        addComponent(component: Component) {
            this.proxy.addComponent(component);
        }
        removeComponent(component: Component) {
            this.proxy.removeComponent(component);
        }
        removeComponentByClass(name: string): boolean {
            return this.proxy.removeComponentByClass(name);
        }
        findComponentByClass(name: string): Component {
            return this.proxy.findComponentByClass(name);
        }
        addAttribute(key: string, val: any) {
            this.proxy.addAttribute(key, val);
        }
        getAttribute<T>(key: string): T {
            return this.proxy.getAttribute<T>(key);
        }
        removeAttribute(key: string): boolean {
            return this.proxy.removeAttribute(key);
        }
        setFlag(flag: number) {
            this.proxy.setFlag(flag);
        }
        resetFlag(flag: number) {
            this.proxy.resetFlag(flag);
        }
        hasFlag(flag: number): boolean {
            return this.proxy.hasFlag(flag);
        }
        invertFlag(flag: number) {
            this.proxy.invertFlag(flag);
        }
        getState(): number {
            return this.proxy.getState();
        }
        setState(state: number) {
            this.proxy.setState(state);
        }
        getPixiObj(): PIXI.Container {
            return this.proxy.pixiObj;
        }
        remove() {
            this.parent.removeChild(this);
        }
        getScene(): Scene {
            return this.proxy.scene;
        }
    }
}
