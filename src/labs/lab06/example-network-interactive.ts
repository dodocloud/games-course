import * as ECSA from '../../../libs/pixi-component';
import * as Net from '../../../libs/network-emulator';
import { PointerMessages } from '../../../libs/pixi-component/components/pointer-input-component';


enum NetworkType {
  NONE, CLIENT, SERVER
}

const NET_MSG_COMMAND = 20;


class NetworkMessage extends Net.NetData {
  param1: number = 0; // color
  param2: number = 0; // position X
  param3: number = 0; // position Y

  constructor(param1: number = 0, param2: number = 0, param3: number = 0) {
    super();
    this.param1 = param1;
    this.param2 = param2;
    this.param3 = param3;
  }

  loadFromStream(reader: Net.NetReader) {
    this.param1 = reader.read4B();
    this.param2 = reader.readFloat();
    this.param3 = reader.readFloat();
  }

  saveToStream(writer: Net.NetWriter) {
    writer.write4B(this.param1);
    writer.writeFloat(this.param2);
    writer.writeFloat(this.param3);
  }

  getDataLength() {
    return 4 + 8 + 8;
  }
}

abstract class SyncComponent extends ECSA.Component {
  idCounter = 0;

  onInit() {
    this.subscribe(Net.NetworkMessages.NET_MESSAGE_RECEIVED);
    this.subscribe(PointerMessages.POINTER_TAP);
  }

  onMessage(msg: ECSA.Message) {
    if (msg.action === Net.NetworkMessages.NET_MESSAGE_RECEIVED) {
       let netMsg = msg.data as Net.NetInputMessage;
       if (netMsg.action === NET_MSG_COMMAND) {
         this.processReceivedMessage(netMsg);
       }
    } else if (msg.action === PointerMessages.POINTER_TAP && this.canAddObjects()) {
      let posX = msg.data.mousePos.posX;
      let posY = msg.data.mousePos.posY;
      let color = Math.floor(Math.random() * 0xFFFFFF);
      this.addNewObject(color, posX, posY);
      this.notifyObjectCreated(color, posX, posY);
    }
  }

  abstract canAddObjects(): boolean;

  abstract notifyObjectCreated(color: number, posX: number, posY: number);

  addNewObject(color: number, posX: number, posY: number) {
    let obj = new ECSA.Graphics();
    obj.beginFill(color);
    obj.drawRect(0, 0, 100, 100);
    obj.endFill();
    obj.position.x = posX;
    obj.position.y = posY;
    obj.pivot.set(50, 50);
    this.scene.stage.addChild(obj);
  }

  processReceivedMessage(netMsg: Net.NetInputMessage) {
    let cmdMsg = netMsg.parseData(new NetworkMessage()) as NetworkMessage;
    this.addNewObject(cmdMsg.param1, cmdMsg.param2, cmdMsg.param3);
  }
}

class ClientSyncComponent extends SyncComponent {
  client: Net.NetworkClient;
  idCounter = 10000; // start at 10000 to avoid conflicts with server

  onInit() {
    super.onInit();
    this.client = this.scene.findGlobalComponentByName<Net.NetworkClient>(Net.NetworkClient.name);
    this.client.initClient(70, 8000, 8001);
    this.client.autoConnect = true;
  }

  canAddObjects(): boolean {
    return this.client.networkState === Net.ClientState.CONNECTED;
  }

  sendMessageToHost(message: NetworkMessage, time: number) {
    this.client.pushMessageForSending(Net.NetMsgTypes.DATA, NET_MSG_COMMAND, time, message, false, true);
  }

  notifyObjectCreated(color: number, posX: number, posY: number) {
    this.sendMessageToHost(new NetworkMessage(color, posX, posY), this.scene.currentAbsolute);
  }
}

class ServerSyncComponent extends SyncComponent {
  host: Net.NetworkHost;
  idCounter = 0;

  onInit() {
    super.onInit();
    this.host = this.scene.findGlobalComponentByName<Net.NetworkHost>(Net.NetworkHost.name);
    this.host.initHost(70, 8001);
  }

  sendMessageToClient(message: NetworkMessage, time: number) {
    this.host.pushMessageForSending(Net.NetMsgTypes.DATA, NET_MSG_COMMAND, time, 0, message, false, true);
  }

  notifyObjectCreated(color: number, posX: number, posY: number) {
    this.sendMessageToClient(new NetworkMessage(color, posX, posY), this.scene.currentAbsolute);
  }

  canAddObjects(): boolean {
    return this.host.peers.size !== 0;
  }
}

class ExampleNetworkInteractive {
  engine: ECSA.GameLoop;

  constructor(view: HTMLCanvasElement, netType: NetworkType) {
    this.engine = new ECSA.GameLoop();
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);
    Net.UDPEmulator.reset();

    if(netType === NetworkType.CLIENT) {
      this.engine.scene.addGlobalComponent(new ClientSyncComponent());
    } else {
      this.engine.scene.addGlobalComponent(new ServerSyncComponent());
    }

    let host = new Net.NetworkHost();
    let client = new Net.NetworkClient();
    this.engine.scene.addGlobalComponent(host, true);
    this.engine.scene.addGlobalComponent(client, true);
    this.engine.scene.addGlobalComponent(new ECSA.PointerInputComponent(true));

    new ECSA.Builder(this.engine.scene)
    .withParent(this.engine.scene.stage)
    .asText('text', '', new PIXI.TextStyle({fontSize: 35, fill: '#0F0'}))
    .withComponent(new ECSA.GenericComponent('').doOnUpdate((cmp, delta, absolute) => {
      if(netType === NetworkType.SERVER) {
        cmp.owner.asText().text = host.peers.size === 0 ? 'WAIT' : 'CONNECTED';
      } else {
        cmp.owner.asText().text = client.networkState === Net.ClientState.CONNECTED ? 'CONNECTED' : 'WAIT';
      }
    }))
    .build();

  }
}

export class ExampleNetworkInteractiveClient extends ExampleNetworkInteractive {
  constructor(view: HTMLCanvasElement) {
    super(view, NetworkType.CLIENT);
  }
}

export class ExampleNetworkInteractiveServer extends ExampleNetworkInteractive {
  constructor(view: HTMLCanvasElement) {
    super(view, NetworkType.SERVER);
  }
}