import * as ECSA from './../../../libs/pixi-component';
import { MAP_TYPE_OCTILE, GridMap, SteeringMath } from '../../../libs/pixi-math';

let map = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const ATTR_VELOCITY = 'velocity';
const ATTR_ACCELERATION = 'acceleration';

export abstract class SteeringComponent extends ECSA.Component {
  protected math = new SteeringMath();
  protected gameSpeed: number;
  protected initialVelocity: ECSA.Vector;

  constructor(gameSpeed: number = 1, initialVelocity: ECSA.Vector = new ECSA.Vector(0, 0)) {
    super();
    this.gameSpeed = gameSpeed;
    this.initialVelocity = initialVelocity;
  }

  onInit() {
    super.onInit();
    this.owner.assignAttribute(ATTR_VELOCITY, this.initialVelocity);
    this.owner.assignAttribute(ATTR_ACCELERATION, new ECSA.Vector(0, 0));
  }

  get velocity(): ECSA.Vector {
    return this.owner.getAttribute<ECSA.Vector>(ATTR_VELOCITY);
  }

  set velocity(velocity: ECSA.Vector) {
    this.owner.assignAttribute(ATTR_VELOCITY, velocity);
  }

  get acceleration(): ECSA.Vector {
    return this.owner.getAttribute<ECSA.Vector>(ATTR_ACCELERATION);
  }

  set acceleration(acceleration: ECSA.Vector) {
    this.owner.assignAttribute(ATTR_ACCELERATION, acceleration);
  }

  onUpdate(delta: number, absolute: number) {
    // update dynamics and set new position
    let force = this.calcForce(delta);
    if (force == null) {
      return; // algorithm has finished
    }

    this.acceleration = force;
    // limit acceleration and velocity
    this.acceleration = this.acceleration.limit(30);
    this.velocity = this.velocity.limit(30);

    this.applyVelocity(delta, this.gameSpeed);
    this.applyPosition(delta, this.gameSpeed);

    // change rotation based on the velocity
    let currentAngle = Math.atan2(this.velocity.y, this.velocity.x);
    this.owner.rotation = currentAngle + Math.PI/2;
  }

  protected applyVelocity(delta: number, gameSpeed: number) {
    this.velocity = this.velocity.add(this.acceleration.multiply(delta * 0.001 * gameSpeed));
  }

  protected applyPosition(delta: number, gameSpeed: number) {
    let deltaPos = this.velocity.multiply(delta * 0.001 * gameSpeed);
    this.owner.position.x += deltaPos.x;
    this.owner.position.y += deltaPos.y;
  }

  protected abstract calcForce(delta: number): ECSA.Vector;
}

class WanderSteering extends SteeringComponent {
  wanderTarget = new ECSA.Vector(0, 0);
  angle = 0;
  wanderDistance: number;
  wanderRadius: number;
  wanderJittering: number;
  game: ExampleVisibilityCone;

  constructor(game: ExampleVisibilityCone, wanderDistance: number, wanderRadius: number, wanderJittering: number) {
    super(10, new ECSA.Vector(1,1));
    this.game = game;
    this.wanderDistance = wanderDistance;
    this.wanderRadius = wanderRadius;
    this.wanderJittering = wanderJittering;
  }

  protected calcForce(delta: number): ECSA.Vector {
    let force =  this.math.wander(this.velocity, this.wanderTarget, this.wanderRadius, this.wanderDistance, this.wanderJittering, delta);
    this.wanderTarget = force[1];

    let positionRect = this.owner.getBounds();
    let position = this.game.worldToMap(positionRect.x + positionRect.width / 2, positionRect.y + positionRect.height / 2);
    let velocity = this.owner.getAttribute<ECSA.Vector>(ATTR_VELOCITY);
    let direction = velocity.normalize();
    let targetCell = position.add(direction);
    let targetCellDec = new ECSA.Vector(Math.round(targetCell.x), Math.round(targetCell.y));
    let isObstacle = this.game.grid.notInside(targetCellDec) || this.game.grid.hasObstruction(targetCellDec);

    // simple collision avoidance by using repulsive forces
    if(isObstacle) {
      // repulsive force
      let isDiagonal = targetCellDec.x !== position.x && targetCellDec.y !== position.y;
      let isHorizontal = targetCellDec.y === position.y;
      let isVertical = targetCellDec.x === position.x;
      let randomShift = Math.random() * velocity.magnitudeSquared();
      if(isDiagonal) {
        this.wanderTarget = new ECSA.Vector(-velocity.x * 10 + randomShift, -velocity.y * 10 + randomShift);
      } else if(isHorizontal) {
        this.wanderTarget =  new ECSA.Vector(-velocity.x * 10 + randomShift, velocity.y * 10 + randomShift);
      } else if(isVertical) {
        this.wanderTarget =  new ECSA.Vector(velocity.x * 10 + randomShift, -velocity.y * 10 + randomShift);
      }
    }
    return force[0];// no repulsive force
  }
}

class BotAnimComponent extends ECSA.Component {
  changeFrequency = 10;
  lastSwitchTime = 0;
  texture: PIXI.Texture;
  currentFrame = 0;

  onInit() {
    this.texture = this.owner.asSprite().texture;
    // no animation
    this.texture.frame = new PIXI.Rectangle(0, 64, 32, 32);
  }

  onUpdate(delta: number, absolute: number) {
    let velocity = this.owner.getAttribute<ECSA.Vector>(ATTR_VELOCITY);

    if (velocity.magnitude() < 1) {
      // no animation
      this.texture.frame = new PIXI.Rectangle(0, 64, 32, 32);
    } else {
        this.currentFrame = (this.currentFrame + 1) % 3;
        // switch animation
        this.texture.frame = new PIXI.Rectangle(32 * (this.currentFrame + 1), 64, 32, 32);
    }
  }
}

class ConeRenderer extends ECSA.Component {
  bot: ECSA.Container;
  game: ExampleVisibilityCone;
  fieldOfView = 60;
  coneColor: number;

  constructor(game: ExampleVisibilityCone, bot: ECSA.Container, coneColor: number) {
    super();
    this.coneColor = coneColor;
    this.bot = bot;
    this.game = game;
  }

  checkPosition(position: ECSA.Vector): boolean {
    let mapBlock = this.game.worldToMap(Math.floor(position.x), Math.floor(position.y));
    let isObstacle = this.game.grid.notInside(mapBlock) || this.game.grid.hasObstruction(mapBlock);
    return !isObstacle;
  }

  onUpdate(delta: number, absolute: number) {
    let position = new ECSA.Vector(this.bot.position.x, this.bot.position.y);
    let direction = this.bot.getAttribute<ECSA.Vector>(ATTR_VELOCITY).normalize();

    let render = this.owner.asGraphics();
    render.clear();
    render.beginFill(this.coneColor, 0.2);

    let fov = this.fieldOfView / 180 * Math.PI;
    let maxDistance = Math.max(this.game.grid.width, this.game.grid.height);
    // minimum sampling angle is equal to number of cells we can sample from the max distance
    let angleSamples = Math.ceil((maxDistance * 2) / (Math.PI / 2) * fov);
    let distanceStep = this.game.mapCellSize / 8;
    distanceStep = 32;
    let renderedBlocks = new Set<number>();

    for(let i = 0; i< angleSamples; i++) {
      let currAngle = fov/2 - fov*(i/angleSamples);
      let currDirectionX = Math.cos(currAngle) * direction.x - Math.sin(currAngle) * direction.y;
      let currDirectionY = Math.sin(currAngle) * direction.x + Math.cos(currAngle) * direction.y;
      let currDirection = new ECSA.Vector(currDirectionX, currDirectionY);
      let currPosition = position;
      let counter = 0;
      while(counter ++ < 50) {
        let mapBlock = this.game.worldToMap(Math.floor(currPosition.x), Math.floor(currPosition.y));
        let isVisible = !this.game.grid.notInside(mapBlock) && !this.game.grid.hasObstruction(mapBlock);
        if(isVisible) {
          if(!renderedBlocks.has(this.game.grid.indexMapper(mapBlock))) {
            let block = this.game.mapToWorld(mapBlock.x, mapBlock.y);
            render.drawRect(block.x, block.y, this.game.mapCellSize, this.game.mapCellSize);
            renderedBlocks.add(this.game.grid.indexMapper(mapBlock));
          }
          let increment = currDirection.multiply(distanceStep);
          currPosition = currPosition.add(new ECSA.Vector(increment.x, increment.y));
        }
      }
    }

    render.endFill();
  }
}


class ExampleVisibilityCone {
  engine: ECSA.GameLoop;

  mapWidth: number;
  mapHeight: number;
  slowPathCost = 10;
  grid: GridMap;

  mapCellSize = 32; // 32px

  // frames for sprite atlas
  pathRect = new PIXI.Rectangle(0, 0, 32, 32);
  obstructionRect = new PIXI.Rectangle(32 * 1, 0, 32, 32);

  constructor(view: HTMLCanvasElement, fullScreen: boolean = false) {
    this.engine = new ECSA.GameLoop();
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, fullScreen);

    this.mapWidth = map[0].length;
    this.mapHeight = map.length;

    this.engine.app.loader
      .reset()    // necessary for hot reload
      .add('pathfinding', 'assets/lab05/pathfinding.png')
      .load(() => this.onAssetsLoaded());
  }

  indexMapper = (vec: ECSA.Vector) => {
    return vec.y * this.mapWidth + vec.x;
  }

  onAssetsLoaded() {
    // initialize grid from the static array
    this.grid = new GridMap(MAP_TYPE_OCTILE, 10, this.mapWidth, this.mapHeight);

    for (let i = 0; i < this.mapHeight; i++) {
      for (let j = 0; j < this.mapWidth; j++) {
        let mapCell = map[i][j];
        if (mapCell === 1) {
          // add obstacles
          this.grid.addObstruction(new ECSA.Vector(j, i));
        } else if (mapCell === 2) {
          // add block with higher cost to cross
          this.grid.setElevation(new ECSA.Vector(j, i), this.slowPathCost);
        } else {
          // 0 -> nothing to do
        }
      }
    }

    // recreate view model
    this.recreateMap();
    this.addBot(new ECSA.Vector(10, 10), 0xFF0000);
    this.addBot(new ECSA.Vector(15, 15), 0x00FF00);
    this.addBot(new ECSA.Vector(12, 13), 0x0000FF);
  }

  addBot(position: ECSA.Vector, coneColor: number) {
    let bot = new ECSA.Sprite('', new PIXI.Texture(PIXI.BaseTexture.from('pathfinding')));
    bot.addComponent(new WanderSteering(this, 0, 10, 0.1));
    bot.anchor.set(0.5);
    bot.addComponent(new BotAnimComponent());
    let mapPos = this.mapToWorld(position.x, position.y);
    bot.position.set(mapPos.x, mapPos.y);
    let renderer = new ECSA.Graphics('');
    renderer.addComponent(new ConeRenderer(this, bot, coneColor));
    this.engine.scene.stage.addChild(renderer);
    this.engine.scene.stage.addChild(bot);
  }

  /**
   * Recreates view-model
   */
  recreateMap() {
    let texture = new PIXI.Texture(PIXI.BaseTexture.from('pathfinding'));
    this.engine.scene.clearScene();

    // create sprites
    for (let i = 0; i < this.mapWidth; i++) {
      for (let j = 0; j < this.mapHeight; j++) {
        let textureCl = texture.clone();
        let sprite = new ECSA.Sprite('', textureCl);
        let pos = this.mapToWorld(i, j);
        sprite.position.set(pos.x, pos.y);
        textureCl.frame = this.getSpriteFrame(new ECSA.Vector(i, j));
        this.engine.scene.stage.addChild(sprite);
      }
    }
  }


  /**
   * Sets sprite index according to the type of the block of the map
   */
  getSpriteFrame(mapPos: ECSA.Vector): PIXI.Rectangle {
    let elevation = this.grid.getElevation(mapPos);
    let hasObstr = this.grid.hasObstruction(mapPos);

    if (hasObstr) {
      return this.obstructionRect;
    }
    if (elevation === 1) {
      return this.pathRect;
    }
  }

  /**
   * Transforms map coordinates into world coordinates
   */
  mapToWorld(x: number, y: number) {
    return new ECSA.Vector(x * this.mapCellSize, y * this.mapCellSize);
  }

  /**
   * Transforms world coordinates into map coordinates
   */
  worldToMap(x: number, y: number) {
    return new ECSA.Vector(Math.floor(x / this.mapCellSize), Math.floor(y / this.mapCellSize));
  }
}

export { ExampleVisibilityCone };