import GameObjectProxy from '../game-object-proxy';
import Component from '../component';
import Scene from '../scene';
import GameObject from '../game-object';

import AnimatedSprite from './animated-sprite';
import BitmapText from './bitmap-text';
import Graphics from './graphics';
import Mesh from './mesh';
import NineSlicePlane from './nine-slice-plane';
import ParticleContainer from './particle-container';
import SimpleMesh from './simple-mesh';
import SimplePlane from './simple-plane';
import SimpleRope from './simple-rope';
import Sprite from './sprite';
import Text from './text';
import TilingSprite from './tiling-sprite';

import * as PIXI from 'pixi.js';

/**
 * Wrapper for PIXI.Container
 */
export default class Container extends PIXI.Container implements GameObject {
	_proxy: GameObjectProxy;

	constructor(name: string = '') {
		super();
		this._proxy = new GameObjectProxy(name, this);
	}

	get id(): number {
		return this._proxy.id;
	}

	get pixiObj(): PIXI.Container {
		return this;
	}

	get scene(): Scene {
		return this._proxy.scene;
	}

	get parentGameObject(): Container {
		return <Container><any>this.parent;
	}

	asAnimatedSprite(): AnimatedSprite { throw new Error('Can\'t cast to this object!'); }
    asBitmapText(): BitmapText { throw new Error('Can\'t cast to this object!'); }
    asContainer(): Container { return this; }
    asGraphics(): Graphics { throw new Error('Can\'t cast to this object!'); }
    asMesh(): Mesh { throw new Error('Can\'t cast to this object!'); }
    asNineSlicePlane(): NineSlicePlane { throw new Error('Can\'t cast to this object!'); }
    asParticleContainer(): ParticleContainer { throw new Error('Can\'t cast to this object!'); }
    asSimpleMesh(): SimpleMesh { throw new Error('Can\'t cast to this object!'); }
    asSimplePlane(): SimplePlane { throw new Error('Can\'t cast to this object!'); }
    asSimpleRope(): SimpleRope { throw new Error('Can\'t cast to this object!'); }
    asSprite(): Sprite { throw new Error('Can\'t cast to this object!'); }
    asText(): Text { throw new Error('Can\'t cast to this object!'); }
    asTilingSprite(): TilingSprite { throw new Error('Can\'t cast to this object!'); }

	// overrides pixijs function
	addChild<T extends PIXI.DisplayObject[]>(...children: T): T[0] {
		let newChild = super.addChild(...children);
		for (let child of children) {
			let cmpObj = <GameObject><any>child;
			if (cmpObj && cmpObj._proxy) {
				this._proxy.onChildAdded(cmpObj._proxy);
			}
		}

		return newChild;
	}

	// overrides pixijs function
	addChildAt<T extends PIXI.DisplayObject>(child: T, index: number): T {
		let newChild = super.addChildAt(child, index);
		let cmpObj = <GameObject><any>newChild;
		if (cmpObj && cmpObj._proxy) {
			this._proxy.onChildAdded(cmpObj._proxy);
		}
		return newChild;
	}

	// overrides pixijs function
	removeChild<T extends PIXI.DisplayObject[]>(...children: T): T[0] {
		let removed = super.removeChild(...children);
		for (let child of children) {
			let cmpObj = <GameObject><any>child;
			if (cmpObj && cmpObj._proxy) {
				this._proxy.onChildDetached(cmpObj._proxy);
			}
		}

		return removed;
	}

	// overrides pixijs function
	removeChildAt(index: number): PIXI.DisplayObject {
		let removed = super.removeChildAt(index);
		let cmpObj = <GameObject><any>removed;
		if (cmpObj && cmpObj._proxy) {
			this._proxy.onChildDetached(cmpObj._proxy);
		}
		return removed;
	}

	// overrides pixijs function
	removeChildren(beginIndex?: number, endIndex?: number): PIXI.DisplayObject[] {
		let removed = super.removeChildren(beginIndex, endIndex);
		for (let removedObj of removed) {
			let cmpObj = <GameObject><any>removedObj;
			if (cmpObj && cmpObj._proxy) {
				this._proxy.onChildDetached(cmpObj._proxy);
			}
		}
		return removed;
	}

	destroyChild<T extends PIXI.DisplayObject[]>(...children: T): T[0] {
		let removed = super.removeChild(...children);
		let cmpObj = <GameObject><any>removed;
		if (cmpObj && cmpObj._proxy) {
			this._proxy.onChildDestroyed(cmpObj._proxy);
		}
		return removed;
	}
	addComponent(component: Component<any>) {
		this._proxy.addComponent(component, false);
	}
	addComponentAndRun(component: Component<any>) {
		this._proxy.addComponent(component, true);
	}
	findComponentByName<T extends Component<any>>(name: string): T {
		return this._proxy.findComponentByName<T>(name);
	}
	removeComponent(component: Component<any>) {
		this._proxy.removeComponent(component);
	}
	assignAttribute(key: string, val: any) {
		this._proxy.assignAttribute(key, val);
	}
	getAttribute<T>(key: string): T {
		return this._proxy.getAttribute<T>(key);
	}
	removeAttribute(key: string): boolean {
		return this._proxy.removeAttribute(key);
	}
	addTag(tag: string) {
		this._proxy.addTag(tag);
	}
	removeTag(tag: string) {
		this._proxy.removeTag(tag);
	}
	hasTag(tag: string): boolean {
		return this._proxy.hasTag(tag);
	}
	get tags() {
		return this._proxy.tags;
	}
	setFlag(flag: number) {
		this._proxy.setFlag(flag);
	}
	resetFlag(flag: number) {
		this._proxy.resetFlag(flag);
	}
	hasFlag(flag: number): boolean {
		return this._proxy.hasFlag(flag);
	}
	invertFlag(flag: number) {
		this._proxy.invertFlag(flag);
	}
	get stateId(): number {
		return this._proxy.stateId;
	}
	set stateId(state: number) {
		this._proxy.stateId = state;
	}
	detach(): void {
		this.parent.removeChild(this);
	}
	destroy(): void {
		if (this.parentGameObject) {
			this.parentGameObject.destroyChild(this);
		}
		super.destroy({ children: true, texture: true, baseTexture: false });
	}
	destroyChildren(): void {
		for (let child of [...this.children]) {
			child.destroy();
		}
	}
}