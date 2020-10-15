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

import Component from './component';
import Vector from '../utils/vector';
import { Func } from '../utils/helpers';

import * as PIXI from 'pixi.js';

enum ObjectType {
	AnimatedSprite,
	BitmapText,
	Container,
	Graphics,
	Mesh,
	NineSlicePlane,
	ParticleContainer,
	SimpleMesh,
	SimplePlane,
	SimpleRope,
	Sprite,
	Text,
	TilingSprite,
}

/**
 * Properties of all pixi objects that will eventually be passed 
 * to the constructors upon creation
 */
type ObjectProps = {
	type: ObjectType;
	textures?: PIXI.Texture[] | PIXI.AnimatedSprite.FrameObject[]; // animatedsprite
	texture?: PIXI.Texture; // sprite, tilingsprite, simpleplane, simplerope, nineSlicePlane
	leftWidth?: number;
	topHeight?: number;
	rightWidth?: number;
	bottomHeight?: number;
	width?: number; // tilingsprite
	height?: number; // tilingsprite
	text?: string; // text
	fontStyle?: PIXI.TextStyle; // text
	fontName?: string; // bitmaptext
	fontSize?: number; // bitmaptext
	fontColor?: number; // bitmaptext
	geometry?: PIXI.Geometry; // mesh
	shader?: PIXI.Shader | PIXI.MeshMaterial; // mesh
	vertices?: Float32Array; // simpleMesh
	verticesX?: number; // simplePlane
	verticesY?: number; // simplePlane
	points?: PIXI.Point[]; // simpleRope
}


type BuilderProps = {
	name: string;
	locPosX?: number;
	locPosY?: number;
	anchorX?: number;
	anchorY?: number;
	virtAnchorX?: number;
	virtAnchorY?: number;
	relPosX?: number;
	relPosY?: number;
	absPosX?: number;
	absPosY?: number;
	scaleX?: number;
	scaleY?: number;
	components: Component<any>[];
	componentBuilders: Func<void, Component<any>>[];
	attributes: Map<string, any>;
	flags: number[];
	tags: Set<string>;
	state?: number;
	parent?: Container;
}


/**
 * Builder for Game Objects
 */
export default class Builder {

	private scene: Scene;
	private children: Builder[];
	private props: BuilderProps;
	private objectProps: ObjectProps;
	private objectToBuild?: Container;

	constructor(scene: Scene) {
		this.scene = scene;
		this.clear();
	}

	/**
	 * Sets an anchor
	 * If you pass 'x' as a number and no 'y', it will have the same value as 'x' 
	 */
	anchor(x: number | Vector, y?: number): Builder {
		if (typeof (x) === 'number') {
			this.props.anchorX = x;
			if (y != null) {
				this.props.anchorY = y;
			} else {
				this.props.anchorY = this.props.anchorX;
			}
		} else {
			this.props.anchorX = x.x;
			this.props.anchorY = x.y;
		}
		return this;
	}

	/**
	 * Sets a virtual anchor (it aligns the position but doesn't change the real pivot nor anchor)
	 * If you pass 'x' as a number and no 'y', it will have the same value as 'x' 
	 */
	virtualAnchor(x: number | Vector, y?: number): Builder {
		if (typeof (x) === 'number') {
			this.props.virtAnchorX = x;
			if (y != null) {
				this.props.virtAnchorY = y;
			} else {
				this.props.virtAnchorY = this.props.virtAnchorX;
			}
		} else {
			this.props.virtAnchorX = x.x;
			this.props.virtAnchorY = x.y;
		}
		return this;
	}

	/**
	 * Sets position relative to the screen ([0,0] for topleft corner, [1,1] for bottomright corner)
	 * If you pass 'x' as a number and no 'y', it will have the same value as 'x' 
	 */
	relativePos(x: number | Vector, y?: number): Builder {
		if (typeof (x) === 'number') {
			this.props.relPosX = x;
			if (y != null) {
				this.props.relPosY = y;
			} else {
				this.props.relPosY = this.props.relPosX;
			}
		} else {
			this.props.relPosX = x.x;
			this.props.relPosY = x.y;
		}
		return this;
	}

	/**
	 * Sets local position
	 * If you pass 'x' as a number and no 'y', it will have the same value as 'x' 
	 */
	localPos(x: number | Vector, y?: number): Builder {
		if (typeof (x) === 'number') {
			this.props.locPosX = x;
			if (y != null) {
				this.props.locPosY = y;
			} else {
				this.props.locPosY = this.props.locPosX;
			}
		} else {
			this.props.locPosX = x.x;
			this.props.locPosY = x.y;
		}

		return this;
	}

	/**
	 * Sets global position
	 * If you pass 'x' as a number and no 'y', it will have the same value as 'x' 
	 */
	globalPos(x: number | Vector, y?: number): Builder {
		if (typeof (x) === 'number') {
			this.props.absPosX = x;
			if (y != null) {
				this.props.absPosY = y;
			} else {
				this.props.absPosY = this.props.absPosX;
			}
		} else {
			this.props.absPosX = x.x;
			this.props.absPosY = x.y;
		}

		return this;
	}

	/**
	 * Sets local scale
	 * If you pass 'x' as a number and no 'y', it will have the same value as 'x' 
	 */
	scale(x: number | Vector, y?: number): Builder {
		if (typeof (x) === 'number') {
			this.props.scaleX = x;
			if (y != null) {
				this.props.scaleY = y;
			} else {
				this.props.scaleY = this.props.scaleX;
			}
		} else {
			this.props.scaleX = x.x;
			this.props.scaleY = x.y;
		}

		return this;
	}

	/**
	 * Adds an attribute to the object
	 */
	withAttribute(key: string, val: any): Builder {
		this.props.attributes.set(key, val);
		return this;
	}

	/**
	 * Adds either a component or an arrow function that returns this component (can be used as a factory)
	 * Use arrow function if you want to use this builder for the same object more than once.
	 */
	withComponent(cmp: Component<any> | Func<void, Component<any>>): Builder {
		if (cmp instanceof Component) {
			this.props.components.push(cmp);
		} else {
			this.props.componentBuilders.push(cmp);
		}
		return this;
	}

	withComponents(cmps: Component<any>[]): Builder {
		cmps.forEach(cmp => this.withComponent(cmp));
		return this;
	}

	withFlag(index: number): Builder {
		this.props.flags.push(index);
		return this;
	}

	withState(state: number): Builder {
		this.props.state = state;
		return this;
	}

	withTag(tag: string): Builder {
		this.props.tags.add(tag);
		return this;
	}

	withParent(parent: Container): Builder {
		this.props.parent = parent;
		return this;
	}

	withChild(child: Builder): Builder {
		this.children.push(child);
		return this;
	}

	withName(name: string): Builder {
		this.props.name = name;
		return this;
	}

	asContainer(): Builder {
		this.objectProps = { type: ObjectType.Container };
		return this;
	}

	asAnimatedSprite(textures: PIXI.Texture[] | PIXI.AnimatedSprite.FrameObject[]): Builder {
		this.objectProps = { 
			type: ObjectType.AnimatedSprite, 
			textures
		};
		return this;
	}
	
	asBitmapText(text: string = '', fontName: string, fontSize: number, fontColor: number): Builder {
		this.objectProps = {
			text, fontName, fontSize, fontColor, type: ObjectType.BitmapText
		};
		return this;
	}
	
	asGraphics(): Builder {
		this.objectProps = {
			type: ObjectType.Graphics
		};
		return this;
	}

	asMesh(geometry: PIXI.Geometry, shader: PIXI.Shader | PIXI.MeshMaterial): Builder {
		this.objectProps = {
			geometry, shader, type: ObjectType.Mesh
		};
		return this;
	}

	asNineSlicePlane(texture: PIXI.Texture, leftWidth: number, topHeight: number, rightWidth: number, bottomHeight: number): Builder {
		this.objectProps = {
			type: ObjectType.NineSlicePlane,
			texture,
			leftWidth,
			topHeight,
			rightWidth,
			bottomHeight
		};
		return this;
	}

	asParticleContainer(): Builder {
		this.objectProps = {
			type: ObjectType.ParticleContainer
		};
		return this;
	}

	asSimpleMesh(texture?: PIXI.Texture, vertices?: Float32Array): Builder {
		this.objectProps = {
			type: ObjectType.SimpleMesh,
			texture,
			vertices
		};
		return this;
	}

	asSimplePlane(texture: PIXI.Texture, verticesX: number, verticesY: number): Builder {
		this.objectProps = {
			type: ObjectType.SimplePlane,
			texture,
			verticesX,
			verticesY,
		}
		return this;
	}

	asSimpleRope(texture: PIXI.Texture, points: PIXI.Point[]): Builder {
		this.objectProps = {
			type: ObjectType.SimpleRope,
			texture,
			points
		}
		return this;
	}

	asSprite(texture: PIXI.Texture): Builder {
		this.objectProps = {
			texture,
			type: ObjectType.Sprite,
		};
		return this;
	}

	asTilingSprite(texture: PIXI.Texture, width: number, height: number): Builder {
		this.objectProps = {
			texture, width, height, type: ObjectType.TilingSprite
		};
		return this;
	}

	asText(text: string = '', fontStyle?: PIXI.TextStyle): Builder {
		this.objectProps = {
			text, fontStyle, type: ObjectType.Text
		};
		return this;
	}


	/**
	 * Copies the attributes and properties to already existing object.
	 * All properties will be removed from the builder
	 */
	buildInto(obj: Container) {
		this.objectToBuild = obj;
		return this.process(true);
	}

	/**
	 * Copies the attributes and properties to already existing object
	 * Properties will be kept in the builder for later use
	 */
	buildIntoAndKeepData(obj: Container) {
		this.objectToBuild = obj;
		return this.process(false);
	}

	/**
	 * Builds a new object and removes all properties from the builder
	 */
	build<T extends Container>(): T {
		return this.process(true);
	}
	
	/**
	 * Builds a new object and keeps stored data
	 */
	buildAndKeepData<T extends Container>(): T {
		return this.process(false);
	}

	private process<T extends Container>(clearData: boolean = true): T {
		let object: Container;

		if (this.objectToBuild !== null) {
			object = this.objectToBuild;
		} else {
			switch (this.objectProps.type) {
				case ObjectType.Container:
					object = new Container(this.props.name);
					break;
				case ObjectType.AnimatedSprite:
					object = new AnimatedSprite(this.props.name, this.objectProps.textures);
					break;
				case ObjectType.BitmapText:
					object = new BitmapText(this.props.name, this.objectProps.text, this.objectProps.fontName, 
						this.objectProps.fontSize, this.objectProps.fontColor);
					break;
				case ObjectType.Graphics:
					object = new Graphics(this.props.name);
					break;
				case ObjectType.Mesh:
					object = new Mesh(this.props.name, this.objectProps.geometry, this.objectProps.shader);
					break;
				case ObjectType.NineSlicePlane:
					object = new NineSlicePlane(this.props.name, this.objectProps.texture, this.objectProps.leftWidth, 
						this.objectProps.topHeight, this.objectProps.rightWidth, this.objectProps.bottomHeight);	
					break;
				case ObjectType.ParticleContainer:
					object = new ParticleContainer(this.props.name);
					break;
				case ObjectType.SimpleMesh:
					object = new SimpleMesh(this.props.name, this.objectProps.texture, this.objectProps.vertices);
					break;
				case ObjectType.SimplePlane:
					object = new SimplePlane(this.props.name, this.objectProps.texture, this.objectProps.verticesX, this.objectProps.verticesY);
					break;
				case ObjectType.SimpleRope:
					object = new SimpleRope(this.props.name, this.objectProps.texture, this.objectProps.points)
					break;
				case ObjectType.Sprite:
					object = new Sprite(this.props.name, this.objectProps.texture.clone());
					break;
				case ObjectType.Text:
					object = new Text(this.props.name, this.objectProps.text);
					(object as Text).style = this.objectProps.fontStyle;
					break;
				case ObjectType.TilingSprite:
					object = new TilingSprite(this.props.name, this.objectProps.texture.clone(), this.objectProps.width, this.objectProps.height);
					break;
			}
		}


		// add all components and attributes before the object is added to the scene
		// this means that we won't get any notification that attributes/components have been added
		for (let component of this.props.components) {
			object.addComponent(component);
		}

		// for safety -> we can't use the same components for more than one object
		this.props.components = [];

		// consider also component builders
		// this is very useful if this builder is used more than once
		for (let builder of this.props.componentBuilders) {
			object.addComponent(builder());
		}

		for (let [key, val] of this.props.attributes) {
			object.assignAttribute(key, val);
		}

		for (let flag of this.props.flags) {
			object.setFlag(flag);
		}

		if (this.props.state != null) {
			object.stateId = this.props.state;
		}

		if (this.props.tags.size !== 0) {
			this.props.tags.forEach(tag => object.addTag(tag));
		}


		let pixiObj = object.pixiObj;

		if (this.props.scaleX != null) {
			pixiObj.scale.x = this.props.scaleX;
		}

		if (this.props.scaleY != null) {
			pixiObj.scale.y = this.props.scaleY;
		}

		if (this.props.relPosX != null) {
			let point = new PIXI.Point();
			point.x = this.props.relPosX * (this.scene.width) / this.scene.stage.scale.x;
			pixiObj.position.x = pixiObj.toLocal(point).x;
			if (this.props.scaleX != null) {
				pixiObj.position.x *= this.props.scaleX;
			}
		}

		if (this.props.relPosY != null) {
			let point = new PIXI.Point();
			point.y = this.props.relPosY * this.scene.height / this.scene.stage.scale.y;
			pixiObj.position.y = pixiObj.toLocal(point).y;
			if (this.props.scaleY != null) {
				pixiObj.position.y *= this.props.scaleY;
			}
		}

		// if the local position is set along with relative position, it will be treated as an offset
		if (this.props.locPosX != null) {
			if (this.props.relPosX != null) {
				pixiObj.position.x += this.props.locPosX;
			} else {
				pixiObj.position.x = this.props.locPosX;
			}
		}

		if (this.props.locPosY != null) {
			if (this.props.relPosY != null) {
				pixiObj.position.y += this.props.locPosY;
			} else {
				pixiObj.position.y = this.props.locPosY;
			}
		}

		if (this.props.absPosX != null) {
			let point = new PIXI.Point();
			point.x = this.props.absPosX;
			pixiObj.position.x = pixiObj.toLocal(point, this.scene.stage.pixiObj).x;
			if (this.props.scaleX != null) {
				pixiObj.position.x *= this.props.scaleX;
			}
		}

		if (this.props.absPosY != null) {
			let point = new PIXI.Point();
			point.y = this.props.absPosY;
			pixiObj.position.y = pixiObj.toLocal(point, this.scene.stage.pixiObj).y;
			if (this.props.scaleY != null) {
				pixiObj.position.y *= this.props.scaleY;
			}
		}

		if (this.props.anchorX != null) {
			// sprites and texts have anchors
			if (pixiObj instanceof Sprite || pixiObj instanceof Text) {
				pixiObj.anchor.x = this.props.anchorX;
			} else {
				pixiObj.pivot.x = this.props.anchorX * pixiObj.width;
			}
		}

		if (this.props.anchorY != null) {
			// sprites and texts have anchors
			if (pixiObj instanceof Sprite || pixiObj instanceof Text) {
				pixiObj.anchor.y = this.props.anchorY;
			} else {
				pixiObj.pivot.y = this.props.anchorY * pixiObj.height;
			}
		}

		if (this.props.virtAnchorX != null) {
			let anchor = this.props.virtAnchorX - (this.props.anchorX == null ? 0 : this.props.anchorX);
			pixiObj.position.x -= anchor * pixiObj.width;
		}

		if (this.props.virtAnchorY != null) {
			let anchor = this.props.virtAnchorY - (this.props.anchorY == null ? 0 : this.props.anchorY);
			pixiObj.position.y -= anchor * pixiObj.height;
		}

		if (this.props.parent != null) {
			this.props.parent.pixiObj.addChild(object.pixiObj);
		}

		// now, when this object is already assigned to its parent, we can build children
		for (let child of this.children) {
			let newChild = child.withParent(<Container><any>object).process(clearData);
			object.pixiObj.addChild(newChild.pixiObj);
		}

		if (clearData) {
			this.clear();
		}
		return object as T;
	}

	private clear(): Builder {
		this.props = {
			name: '',
			components: [],
			componentBuilders: [],
			attributes: new Map(),
			flags: [],
			tags: new Set(),
		};
		this.objectProps = {
			type: ObjectType.Container
		};
		this.objectToBuild = null;
		this.children = [];

		return this;
	}
}