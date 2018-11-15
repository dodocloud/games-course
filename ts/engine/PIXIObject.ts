import { GenericComponent } from './../components/GenericComponent';
import GameObjectProxy from './GameObjectProxy';
import Component from './Component';
import Scene from './Scene';
import * as PIXI from 'pixi.js'
import { colorToNumber } from '../utils/Common';

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
         * Returns unique identifier
         */
        getId(): number;
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
            ...additionalChildren: T[]
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

        getId(): number {
            return this.proxy.id;
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
     * Options for MatterBody object
     */
    export class MatterBodyOptions {
        fillStyle: string = "0x0000FF";
        strokeStyle: string = "0x00FF00";
        strokeStyleWireframe: string = "0xFF0000";
        lineWidth: number = 1;
        showWireframes: boolean = false;
        showAngleIndicator: boolean = false;
        showAxes: boolean = false;
    }

    /**
     * Wrapper for Matter-JS bodies
     */
    export class MatterBody extends Graphics {

        body: Matter.Body;
        world: Matter.World;
        options: MatterBodyOptions;

        constructor(tag: string = "", body: Matter.Body, world: Matter.World, options?: MatterBodyOptions) {
            super(tag);
            this.body = body;
            this.world = world;
            this.options = options || new MatterBodyOptions();
            this.createBodyPrimitive();
            
            let thiz = this;
            this.addComponent(new GenericComponent("MatterBodyCmp").doOnUpdate((cmp, delta, absolute) => {
                // synchronize position and rotation
                thiz.rotation = thiz.body.angle;
                thiz.position.x = thiz.body.position.x;
                thiz.position.y = thiz.body.position.y;
            }));
        }

        // render body
        protected createBodyPrimitive() {
            let fillStyle = colorToNumber(this.options.fillStyle),
                strokeStyle = colorToNumber(this.options.strokeStyle),
                strokeStyleWireframe = colorToNumber(this.options.strokeStyleWireframe),
                part;


            // clear the primitive
            this.clear();

            // handle compound parts
            for (var k = this.body.parts.length > 1 ? 1 : 0; k < this.body.parts.length; k++) {
                part = this.body.parts[k];

                if (!this.options.showWireframes) {
                    this.beginFill(fillStyle, 1);
                    this.lineStyle(this.options.lineWidth, strokeStyle, 1);
                }

                this.moveTo(part.vertices[0].x - this.body.position.x, part.vertices[0].y - this.body.position.y);

                for (var j = 1; j < part.vertices.length; j++) {
                    this.lineTo(part.vertices[j].x - this.body.position.x, part.vertices[j].y - this.body.position.y);
                }

                this.lineTo(part.vertices[0].x - this.body.position.x, part.vertices[0].y - this.body.position.y);

                this.endFill();

                // angle indicator
                if (this.options.showAngleIndicator || this.options.showAxes) {
                    this.beginFill(0, 0);

                    if (this.options.showWireframes) {
                        this.lineStyle(1, strokeStyleWireframe, 1);
                    } else {
                        this.lineStyle(1, strokeStyle);
                    }

                    this.moveTo(part.position.x - this.body.position.x, part.position.y - this.body.position.y);
                    this.lineTo(((part.vertices[0].x + part.vertices[part.vertices.length - 1].x) / 2 - this.body.position.x),
                        ((part.vertices[0].y + part.vertices[part.vertices.length - 1].y) / 2 - this.body.position.y));

                    this.endFill();
                }
            }
        };
    }

    /**
     * Options for MatterConstraint object
     */
    export class MatterConstraintOptions {
        strokeStyle: string = "0x00FF00";
        lineWidth: number = 1;
    }

    /**
     * Wrapper for Matter-JS constraints
     */
    export class MatterConstraint extends Graphics {

        constraint: Matter.Constraint;
        world: Matter.World;
        options?: MatterConstraintOptions;

        constructor(tag: string = "", constraint: Matter.Constraint, world: Matter.World, options?: MatterConstraintOptions) {
            super(tag);
            this.constraint = constraint;
            this.world = world;
            this.options = options || new MatterConstraintOptions();
            this.renderPrimitive();
            
            let thiz = this;
            this.addComponent(new GenericComponent("MatterComponent").doOnUpdate((cmp, delta, absolute) => {
                thiz.renderPrimitive(); // re-render at each udpate    
            }));

        }

        // render constraint
        protected renderPrimitive() {
            let strokeStyle = colorToNumber(this.options.strokeStyle);


            // clear the primitive
            this.clear();

            let bodyA = this.constraint.bodyA,
                bodyB = this.constraint.bodyB,
                pointA = this.constraint.pointA,
                pointB = this.constraint.pointB;

            // render the constraint on every update, since they can change dynamically
            this.beginFill(0, 0);
            this.lineStyle(this.options.lineWidth, strokeStyle, 1);

            if (bodyA) {
                this.moveTo(bodyA.position.x + pointA.x, bodyA.position.y + pointA.y);
            } else {
                this.moveTo(pointA.x, pointA.y);
            }

            if (bodyB) {
                this.lineTo(bodyB.position.x + pointB.x, bodyB.position.y + pointB.y);
            } else if(pointB) {
                this.lineTo(pointB.x, pointB.y);
            }

            this.endFill();
        };
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
            ...additionalChildren: T[]
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

        getId(): number {
            return this.proxy.id;
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
            ...additionalChildren: T[]
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

        getId(): number {
            return this.proxy.id;
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
            ...additionalChildren: T[]
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

        getId(): number {
            return this.proxy.id;
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
    export class TilingSprite extends PIXI.extras.TilingSprite implements ComponentObject {
        proxy: GameObjectProxy;

        constructor(tag: string = "", texture?: PIXI.Texture, width?: number, height?: number) {
            super(texture, width, height);
            this.proxy = new GameObjectProxy(tag, this);
        }

        // overrides pixijs function
        addChild<T extends PIXI.DisplayObject>(
            child: T,
            ...additionalChildren: T[]
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

        getId(): number {
            return this.proxy.id;
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
            ...additionalChildren: T[]
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

        getId(): number {
            return this.proxy.id;
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