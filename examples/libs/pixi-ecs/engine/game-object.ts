import GameObjectProxy from './game-object-proxy';
import Component from './component';
import Scene from './scene';

import AnimatedSprite from './game-objects/animated-sprite';
import BitmapText from './game-objects/bitmap-text';
import Container from './game-objects/container';
import Graphics from './game-objects/graphics';
import Mesh from './game-objects/mesh';
import NineSlicePlane from './game-objects/nine-slice-plane';
import ParticleContainer from './game-objects/particle-container';
import SimpleMesh from './game-objects/simple-mesh';
import SimplePlane from './game-objects/simple-plane';
import SimpleRope from './game-objects/simple-rope';
import Sprite from './game-objects/sprite';
import Text from './game-objects/text';
import TilingSprite from './game-objects/tiling-sprite';

import * as PIXI from 'pixi.js';

/**
 * Interface for PIXI objects attached to the component architecture
 */
export default interface GameObject {
	// unique identifier
	id: number;
	// name of the object
	name: string;
	// state of the object (can by any number)
	stateId: number;
	// wrapped pixi object
	pixiObj: PIXI.Container;
	// parent game object
	parentGameObject: Container;
	// scene
	scene: Scene;
	// Link to proxy object, <<<!!!shouldn't be used from within any custom component!!!>>>
	_proxy: GameObjectProxy;

	// ==================== Methods for type casting ====================

	/*
	* Casts itself to animated sprite
	*/
	asAnimatedSprite(): AnimatedSprite;

	/*
	 * Casts itself to BitmapText
	 */
	asBitmapText(): BitmapText;

	/*
	* Casts itself to Container
	*/
	asContainer(): Container;

	/*
	 * Casts itself to Graphics
	 */
	asGraphics(): Graphics;

	/*
	 * Casts itself to Mesh
	 */
	asMesh(): Mesh;

	/*
	 * Casts itself to Nine Slice Plane
	 */
	asNineSlicePlane(): NineSlicePlane;

	/*
	 * Casts itself to Particle Container
	 */
	asParticleContainer(): ParticleContainer;

	/*
	 * Casts itself to Simple Mesh
	 */
	asSimpleMesh(): SimpleMesh;

	/*
	 * Casts itself to Simple Plane
	 */
	asSimplePlane(): SimplePlane;

	/*
	 * Casts itself to Simple Rope
	 */
	asSimpleRope(): SimpleRope;

	/*
	 * Casts itself to Sprite
	 */
	asSprite(): Sprite;

	/*
	 * Casts itself to Text
	 */
	asText(): Text;

	/*
	* Casts itself to TilingSprite
	*/
	asTilingSprite(): TilingSprite;

	// ========================================================================

	/**
	 * Adds a new component
	 */
	addComponent(component: Component<any>);

	/**
	 * Adds a new component and runs it instantly
	 */
	addComponentAndRun(component: Component<any>);
	/**
	 * Tries to find a component by its class
	 */
	findComponentByName<T extends Component<any>>(name: string): T;
	/**
	 * Removes an existing component
	 */
	removeComponent(component: Component<any>): void;
	/**
	 * Adds or changes generic attribute
	 */
	assignAttribute(key: string, val: any): void;
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
	 * Add a new tag
	 */
	addTag(tag: string);
	/**
	 * Removes tag
	 */
	removeTag(tag: string);
	/**
	 * Returns true if given tag is set
	 */
	hasTag(tag: string): boolean;
	/**
	 * Sets flag at given index
	 */
	setFlag(flag: number): void;
	/**
	 * Resets flag at given index
	 */
	resetFlag(flag: number): void;
	/**
	 * Returns true, if there is a flag set at given index
	 */
	hasFlag(flag: number): boolean;
	/**
	 * Inverts a flag at given index
	 */
	invertFlag(flag: number): void;
	/**
	 * Detaches itself from its parent but doesn't destroy the object
	 */
	detach(): void;
	/**
	 * Detaches itself from its parent (if not already detached) and destroys the object
	 */
	destroy(): void;
	/**
	 * Destroys all children
	 */
	destroyChildren(): void;
}
