import GameObject from '../engine/GameObject';
import Component from '../engine/Component';

/**
 * Builder for game objects
 */
export default class GameObjectBuilder {
	gameObj: GameObject = null;
	isGlobal = false;
	parent: GameObject = null;
	isCentered = false;

	constructor(name: string) {
		this.gameObj = new GameObject(name);
	}

	withSecondaryId(id: number): GameObjectBuilder {
		this.gameObj.secondaryId = id;
		return this;
	}

	withComponent(cmp: Component): GameObjectBuilder {
		this.gameObj.addComponent(cmp);
		return this;
	}

	withAttribute(key: string, attr: any): GameObjectBuilder {
		this.gameObj.addAttribute(key, attr);
		return this;
	}

	withParent(parent: GameObject): GameObjectBuilder {
		this.parent = parent;
		return this;
	}

	withPosition(posX: number, posY: number): GameObjectBuilder {
		this.gameObj.mesh.position.x = posX;
		this.gameObj.mesh.position.y = posY;
		return this;
	}

	withRotation(rot, offsetX = 0, offsetY = 0): GameObjectBuilder {
		this.gameObj.mesh.rotation = rot;
		this.gameObj.mesh.pivot.x = offsetX;
		this.gameObj.mesh.pivot.y = offsetY;
		return this;
	}

	withCenteredOrigin(): GameObjectBuilder {
		this.isCentered = true;
		return this;
	}

	withMesh(mesh: PIXI.Container): GameObjectBuilder {
		this.gameObj.mesh = mesh;
		return this;
	}

	asGlobal(): GameObjectBuilder {
		this.isGlobal = true;
		return this;
	}

	build(scene) {
		if (this.isCentered) {
			this.gameObj.mesh.pivot.set(this.gameObj.mesh.width / 2, this.gameObj.mesh.height / 2);
		}

		if (this.isGlobal || this.parent == null) {
			scene.addGlobalGameObject(this.gameObj);
		} else {
			this.parent.addGameObject(this.gameObj);
		}

		return this.gameObj;
	}
}