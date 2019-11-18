import * as ECSA from '../../../../libs/pixi-component';
import { BotModel, GameModel, CargoSourceModel } from './model';
import { BotMoveComponent } from './bot-ai-move-component';
import { BotStates, CargoTypes, Attributes } from './constants';

export class BotAIComponent extends ECSA.Component {
  gameModel: GameModel;
  botModel: BotModel;
  moveComponent: BotMoveComponent;
  lastState = BotStates.IDLE;
  // un/loading time in ms
  currentLoadingTime = 0;
  // how long does it take to load a cargo
  loadingDelay = 3000;
  currentTarget: CargoSourceModel;

  onInit() {
    this.gameModel = this.scene.getGlobalAttribute(Attributes.GAME_MODEL);
    this.botModel = this.owner.getAttribute(Attributes.BOT_MODEL);
    this.moveComponent = this.owner.findComponentByName<BotMoveComponent>(BotMoveComponent.name);
  }

  onUpdate(delta: number, absolute: number) {
    let state = this.botModel.currentState;
    let stateChange = state !== this.lastState;

    switch (state) {
      case BotStates.IDLE:
        state = this.processIdleState(stateChange, delta, absolute);
        break;
      case BotStates.GOING_TO_UNLOAD:
        state = this.processGoingToUnloadState(stateChange, delta, absolute);
        break;
      case BotStates.GOING_TO_LOAD:
        state = this.processGoingToLoadState(stateChange, delta, absolute);
        break;
      case BotStates.LOADING:
        state = this.processLoadingState(stateChange, delta, absolute);
        break;
      case BotStates.UNLOADING:
        state = this.processUnloadingState(stateChange, delta, absolute);
        break;
    }

    this.lastState = this.botModel.currentState;
    // update current state
    this.botModel.currentState = state;
  }

  processIdleState(isEntering: boolean, delta: number, absolute: number) {
    return BotStates.IDLE;
  }

  processGoingToLoadState(isEntering: boolean, delta: number, absolute: number) {
    return BotStates.GOING_TO_LOAD;
  }

  processGoingToUnloadState(isEntering: boolean, delta: number, absolute: number) {
    return BotStates.GOING_TO_UNLOAD;
  }

  processLoadingState(isEntering: boolean, delta: number, absolute: number) {
    return BotStates.LOADING;
  }

  processUnloadingState(isEntering: boolean, delta: number, absolute: number) {
    return BotStates.UNLOADING;
  }

  // ============================================================================


 /**
	 * Selects a random loading target and executes follow behavior
	 */
  protected goLoad() {
    let ores = this.gameModel.getCargoSourcesByType(CargoTypes.ORE);
    let petrols = this.gameModel.getCargoSourcesByType(CargoTypes.PETROL);

    if (Math.random() > 0.5) {
      this.currentTarget = ores[Math.floor(Math.random() * ores.length)];
    } else {
      this.currentTarget = petrols[Math.floor(Math.random() * petrols.length)];
    }

    if(this.currentTarget) {
      this.gameModel.notifyGoingToLoad(this.currentTarget, this.botModel);
      this.moveToTarget(this.currentTarget.position);
    }
  }

  /**
	  * Selects an unloading target and executes follow behavior
	  */
  protected goUnload() {
    let warehouse = this.gameModel.warehouseModel.position;
    this.moveToTarget(new ECSA.Vector(warehouse.x, warehouse.y));
  }

  protected get arrivedToTarget() {
    return this.moveComponent.pathFinished;
  }

  protected get isBotLoaded() {
    return this.botModel.isLoaded;
  }

  private moveToTarget(target: ECSA.Vector) {
    let agentLocation = new ECSA.Vector(this.owner.position.x, this.owner.position.y);
    let agentMapPosition = this.worldToMap(agentLocation);
    this.moveComponent.goToPoint(agentMapPosition, agentLocation, target);
  }

  private worldToMap(pos: ECSA.Vector): ECSA.Vector {
    return this.gameModel.map.locationToMapBlock(pos);
  }
}