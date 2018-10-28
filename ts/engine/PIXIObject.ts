import Component from './Component';
import Scene from './Scene'
import Msg from './Msg';
import GameObjectProxy from './GameObject';

export namespace PIXICmp {

    export interface ComponentObject {
        proxy: GameObjectProxy;
        addComponent(component: Component);
        removeComponent(component: Component);
        findComponent(name: string);
        addAttribute(key: string, val: any);
        getAttribute(key: string): any;
        removeAttribute(key: string);
    }

    export class Graphics extends PIXI.Graphics implements ComponentObject {
        proxy: GameObjectProxy;

        constructor() {
            super();
            this.proxy = new GameObjectProxy("mojo", this);
        }

        addChild<T extends PIXI.DisplayObject>(
            child: T,
            ...additionalChildren: PIXI.DisplayObject[]
        ): T {
            let newChild = super.addChild(child, ...additionalChildren);

            let cmbObj = <ComponentObject><any>newChild;
            this.proxy.processNewObject(cmbObj.proxy); // todo error?

            // TODO iterate over additional children
            return newChild;
        }

        addChildAt<T extends PIXI.DisplayObject>(child: T, index: number): T {
            let newChild = super.addChildAt(child, index);
            let cmbObj = <ComponentObject><any>newChild;
            this.proxy.processNewObject(cmbObj.proxy); // todo error?

            return newChild;
        }

        addComponent(component: Component) {
            this.proxy.addComponent(component);
        }
        removeComponent(component: Component) {
            this.proxy.removeComponent(component);
        }
        findComponent(name: string) {
            this.proxy.findComponent(name);
        }
        addAttribute(key: string, val: any) {
            this.proxy.addAttribute(key, val);
        }
        getAttribute(key: string): any {
            this.proxy.getAttribute(key);
        }
        removeAttribute(key: string) {
            this.proxy.removeAttribute(key);
        }
    }



    export class Container extends PIXI.Container implements ComponentObject {
        proxy: GameObjectProxy;

        constructor() {
            super();
            this.proxy = new GameObjectProxy("mojo", this);
        }

        addChild<T extends PIXI.DisplayObject>(
            child: T,
            ...additionalChildren: PIXI.DisplayObject[]
        ): T {
            let newChild = super.addChild(child, ...additionalChildren);

            let cmbObj = <ComponentObject><any>newChild;
            this.proxy.processNewObject(cmbObj.proxy); // todo error?

            // TODO iterate over additional children
            return newChild;
        }

        addChildAt<T extends PIXI.DisplayObject>(child: T, index: number): T {
            let newChild = super.addChildAt(child, index);
            let cmbObj = <ComponentObject><any>newChild;
            this.proxy.processNewObject(cmbObj.proxy); // todo error?

            return newChild;
        }

        addComponent(component: Component) {
            this.proxy.addComponent(component);
        }
        removeComponent(component: Component) {
            this.proxy.removeComponent(component);
        }
        findComponent(name: string) {
            this.proxy.findComponent(name);
        }
        addAttribute(key: string, val: any) {
            this.proxy.addAttribute(key, val);
        }
        getAttribute(key: string): any {
            this.proxy.getAttribute(key);
        }
        removeAttribute(key: string) {
            this.proxy.removeAttribute(key);
        }
    }
}
