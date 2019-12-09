import * as ECSA from '../../../libs/pixi-component';
import * as Net from '../../../libs/network-emulator';
import { checkTime } from '../../utils/functions';
import { KeyInputComponent, Keys } from '../../../libs/pixi-component/components/key-input-component';
import { SteeringComponent } from '../lab04/example-steering';

enum NetworkType {
  NONE, CLIENT, SERVER
}

const NET_MSG_UPDATE = 21;

const KEY_POSITION_X = 0;
const KEY_POSITION_Y = 1;
const KEY_ROTATION = 2;

const OBJECTS_NUM = 20;

export class RandomMovement extends SteeringComponent {
  wanderTarget = new ECSA.Vector(0, 0);
  angle = 0;
  wanderDistance: number;
  wanderRadius: number;
  wanderJittering: number;

  constructor(wanderDistance: number, wanderRadius: number, wanderJittering: number) {
    super(3, new ECSA.Vector(1,1));
    this.wanderDistance = wanderDistance;
    this.wanderRadius = wanderRadius;
    this.wanderJittering = wanderJittering;
  }

  onUpdate(delta: number, absolute: number) {
    super.onUpdate(delta, absolute);
    let currentAngle = Math.atan2(this.velocity.y, this.velocity.x);
    this.owner.rotation = currentAngle;
  }

  protected calcForce(delta: number): ECSA.Vector {
    let force =  this.math.wander(this.velocity, this.wanderTarget, this.wanderRadius, this.wanderDistance, this.wanderJittering, delta);
    this.wanderTarget = force[1];
    return force[0];
  }
}

/**
 * Custom networking message that stores values for all objects
 */
class NetworkExampleMessage extends Net.NetData {
  positionsX: number[] = [];
  positionsY: number[] = [];
  rotations: number[] = [];
  objectsNum: number;

  loadFromStream(reader: Net.NetReader) {
    this.objectsNum = reader.read2B();
    for(let i = 0; i<this.objectsNum; i++) {
      this.positionsX.push(reader.readFloat());
      this.positionsY.push(reader.readFloat());
      this.rotations.push(reader.readFloat());
    }
  }

  saveToStream(writer: Net.NetWriter) {
    writer.write2B(this.objectsNum);
    for(let i = 0; i<this.objectsNum; i++) {
      writer.writeFloat(this.positionsX[i]);
      writer.writeFloat(this.positionsY[i]);
      writer.writeFloat(this.rotations[i]);
    }
  }

  getDataLength() {
    return (8 + 8 + 8) * this.objectsNum + 2;
  }
}

class NetworkBehavior extends ECSA.Component {
  client: Net.NetworkClient;
  host: Net.NetworkHost;
  interpolator = new Net.Interpolator();
  netType = NetworkType.NONE;
  updateFrequency = 10;
  lastSendTime = 0;
  objects: ECSA.Container[];
  lag: number = 0;

  constructor(netType: NetworkType, lag: number = 0) {
    super();
    this.netType = netType;
    this.lag = lag;
  }

  onInit() {
    this.objects = this.scene.findObjectsByTag('BOT');
    this.subscribe(Net.NetworkMessages.NET_MESSAGE_RECEIVED);
    this.client = this.scene.findGlobalComponentByName<Net.NetworkClient>(Net.NetworkClient.name);
    this.host = this.scene.findGlobalComponentByName<Net.NetworkHost>(Net.NetworkHost.name);
    this.initNetwork(this.netType);
  }

  initNetwork(netType: NetworkType) {
    this.netType = netType;

    if (netType === NetworkType.CLIENT) {
      this.client.initClient(50, 6000, 6001);
      this.client.autoConnect = true;
      this.client.network.udpManager.lag = this.lag;
    }

    if (netType === NetworkType.SERVER) {
      this.host.initHost(50, 6001);
      this.host.network.udpManager.lag = this.lag;
    }
  }

  processMessageFromHost(netMsg: Net.NetInputMessage) {
    let updateMsg = netMsg.parseData(new NetworkExampleMessage()) as NetworkExampleMessage;
    let deltaInfo = new Net.UpdateInfo(netMsg.msgTime);
    for(let i = 0; i < this.objects.length; i++) {
      // identifier of each attribute is determined by the position of given object in the array and a key offset
      deltaInfo.continuousValues.set(i * 3 + KEY_POSITION_X, updateMsg.positionsX[i]);
      deltaInfo.continuousValues.set(i * 3 + KEY_POSITION_Y, updateMsg.positionsY[i]);
      deltaInfo.continuousValues.set(i * 3 + KEY_ROTATION, updateMsg.rotations[i]);
    }
    this.interpolator.acceptUpdateMessage(deltaInfo);
  }

  updateInterpolatedValues() {
    // set position and rotation according to the message
    let delta = this.interpolator.currentUpdate;
    if (delta) {
      for(let i = 0; i < this.objects.length; i++) {
        this.objects[i].rotation = delta.findValue(i * 3 + KEY_ROTATION);
        this.objects[i].position.x = delta.findValue(i * 3 + KEY_POSITION_X);
        this.objects[i].position.y = delta.findValue(i * 3 + KEY_POSITION_Y);
      }
    }
  }

  createMessageForClient(): NetworkExampleMessage {
    // send values to the client
    let updateInfo = new NetworkExampleMessage();
    updateInfo.objectsNum = this.objects.length;
    for(let i = 0; i < this.objects.length; i++) {
      updateInfo.rotations[i] = this.objects[i].rotation;
      updateInfo.positionsX[i] = this.objects[i].position.x;
      updateInfo.positionsY[i] = this.objects[i].position.y;
    }

    return updateInfo;
  }

  onMessage(msg: ECSA.Message) {
    if (msg.action === Net.NetworkMessages.NET_MESSAGE_RECEIVED) {
      if (this.netType === NetworkType.CLIENT) {
        // push received message to Interpolator
        let netMsg = msg.data as Net.NetInputMessage;
        if (netMsg.action === NET_MSG_UPDATE) {
          this.processMessageFromHost(netMsg);
        }
      }
    }
  }

  onUpdate(delta: number, absolute: number) {
    this.interpolator.update(delta);
    let keyInput = this.scene.findGlobalComponentByName<KeyInputComponent>(KeyInputComponent.name);

    if (this.netType === NetworkType.CLIENT) {
      // set position and rotation according to the message
      this.updateInterpolatedValues();
    } else if (this.netType === NetworkType.SERVER) {
      if (checkTime(this.lastSendTime, absolute, this.updateFrequency)) {
        this.lastSendTime = absolute;

        if (!keyInput.isKeyPressed(Keys.KEY_R)) {
          let updateInfo = this.createMessageForClient();
          this.host.pushMessageForSending(Net.NetMsgTypes.DATA, NET_MSG_UPDATE, absolute, 0, updateInfo, true);
        }
        if (keyInput.isKeyPressed(Keys.KEY_W) && this.updateFrequency < 10) {
          this.updateFrequency++;
          console.log('Frequency changed to ' + this.updateFrequency);
        }
        if (keyInput.isKeyPressed(Keys.KEY_Q) && this.updateFrequency > 1) {
          this.updateFrequency--;
          console.log('Frequency changed to ' + this.updateFrequency);
        }
      }
    }
  }
}

class ExampleNetworkSteering {
  engine: ECSA.GameLoop;

  constructor(view: HTMLCanvasElement, netType: NetworkType) {
    this.engine = new ECSA.GameLoop();
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);
    Net.UDPEmulator.reset();

    let networkBehavior = new NetworkBehavior(netType);
    let client = new Net.NetworkClient();

    this.engine.scene.addGlobalComponent(new Net.NetworkHost(), true);
    this.engine.scene.addGlobalComponent(client, true);
    this.engine.scene.addGlobalComponent(networkBehavior);
    this.engine.scene.addGlobalComponent(new KeyInputComponent());

    for(let i = 0; i< OBJECTS_NUM; i++) {
      let wanderBoid = new ECSA.Graphics('WANDER');
      wanderBoid.addTag('BOT');
      wanderBoid.beginFill(0xFF0000 + Math.floor(i / OBJECTS_NUM * 255));
      wanderBoid.drawPolygon([-10, -10, -10, 10, 15, 0]);
      wanderBoid.endFill();
      wanderBoid.scale.set(2);
      wanderBoid.position.set(Math.random() * view.clientWidth, Math.random() * view.clientHeight);
      this.engine.scene.stage.addChild(wanderBoid);
      if(netType !== NetworkType.CLIENT) {
        wanderBoid.addComponent(new RandomMovement(Math.random() * 20, Math.random() * 10, Math.random()));
      }
    }

    new ECSA.Builder(this.engine.scene)
    .withParent(this.engine.scene.stage)
    .asText('text', '', new PIXI.TextStyle({fontSize: 35, fill: '#0F0'}))
    .withComponent(new ECSA.GenericComponent('').doOnUpdate((cmp, delta, absolute) => {
      if(netType === NetworkType.SERVER) {
        cmp.owner.asText().text = 'Update Frequency: ' + networkBehavior.updateFrequency;
      } else {
        cmp.owner.asText().text = client.networkState + '';
      }
    }))
    .build();
  }
}

export class ExampleNetworkSteeringClient extends ExampleNetworkSteering {
  constructor(view: HTMLCanvasElement) {
    super(view, NetworkType.CLIENT);
  }
}

export class ExampleNetworkSteeringServer extends ExampleNetworkSteering {
  constructor(view: HTMLCanvasElement) {
    super(view, NetworkType.SERVER);
  }
}