import * as ECSA from '../../../libs/pixi-component';
import { KeyInputComponent } from '../../../libs/pixi-component/components/key-input-component';
import * as Net from '../../../libs/network-emulator';


enum NetworkType {
  NONE, CLIENT, SERVER
}

const NET_MSG_COMMAND = 20;

enum Commands {
  ADD_OBJECT,
  REMOVE_OBJECT,
  EDIT_OBJECT
}

enum ObjectType {
  CIRCLE = 0,
  SQUARE = 1,
  RECTANGLE = 2
}

/**
 * Custom message for all sorts of events
 */
class NetworkMessage extends Net.NetData {
  commandType: number = 0;
  param1: number = 0; // ObjectType
  param2: number = 0; // ID
  param3: number = 0; // color
  param4: number = 0; // position X
  param5: number = 0; // position Y
  param6: number = 0; // rotation

  constructor(commandType: number = 0, param1: number = 0, param2: number = 0, param3: number = 0, param4: number = 0, param5: number = 0, param6: number = 0) {
    super();
    this.commandType = commandType;
    this.param1 = param1;
    this.param2 = param2;
    this.param3 = param3;
    this.param4 = param4;
    this.param5 = param5;
    this.param6 = param6;
  }

  loadFromStream(reader: Net.NetReader) {
    this.commandType = reader.readByte();
    this.param1 = reader.readByte();
    this.param2 = reader.read2B();
    this.param3 = reader.read4B();
    this.param4 = reader.readFloat();
    this.param5 = reader.readFloat();
    this.param6 = reader.readFloat();
  }

  saveToStream(writer: Net.NetWriter) {
    writer.writeByte(this.commandType);
    writer.writeByte(this.param1);
    writer.write2B(this.param2);
    writer.write4B(this.param3);
    writer.writeFloat(this.param4);
    writer.writeFloat(this.param5);
    writer.writeFloat(this.param6);
  }

  getDataLength() {
    return 1 + 1 + 2 + 4 + 8 + 8 + 8;
  }
}

class SyncComponent extends ECSA.Component {
  addNewObject(type: ObjectType, id: number, color: number, posX: number, posY: number, rotation: number) {
    let obj = new ECSA.Graphics();
    obj.addTag(id + '');
    obj.beginFill(color);
    switch(type) {
      case ObjectType.CIRCLE:
        obj.drawCircle(0, 0, 100);
        break;
      case ObjectType.RECTANGLE:
        obj.drawRect(0, 0, 200, 100);
        break;
      case ObjectType.SQUARE:
        obj.drawRect(0, 0, 100, 100);
        break;
    }
    obj.endFill();
    obj.position.x = posX;
    obj.position.y = posY;
    obj.rotation = rotation;
    this.scene.stage.addChild(obj);
  }

  removeObject(id: number) {
    // use tag as networkId
    let obj = this.scene.findObjectByTag(id+'');
    if(obj) {
      obj.remove();
    }
  }

  editObject(id: number, posX: number, posY: number, rotation: number) {
    let obj = this.scene.findObjectByTag(id + '') as ECSA.Graphics;
    if(obj) {
      obj.position.x = posX;
      obj.position.y = posY;
      obj.rotation = rotation;
    }
  }
}

/**
 * Synchronization component for the client
 */
class ClientSyncComponent extends SyncComponent {
  client: Net.NetworkClient;

  onInit() {
    this.subscribe(Net.NetworkMessages.NET_MESSAGE_RECEIVED);
    this.client = this.scene.findGlobalComponentByName<Net.NetworkClient>(Net.NetworkClient.name);
    this.client.initClient(60, 7000, 7001);
    this.client.autoConnect = true;
  }

  onMessage(msg: ECSA.Message) {
    if (msg.action === Net.NetworkMessages.NET_MESSAGE_RECEIVED) {
       let netMsg = msg.data as Net.NetInputMessage;
       if (netMsg.action === NET_MSG_COMMAND) {
         this.processMessageFromHost(netMsg);
       }
    }
  }

  processMessageFromHost(netMsg: Net.NetInputMessage) {
    let cmdMsg = netMsg.parseData(new NetworkMessage()) as NetworkMessage;
    switch(cmdMsg.commandType) {
      case Commands.ADD_OBJECT:
        this.addNewObject(cmdMsg.param1, cmdMsg.param2, cmdMsg.param3, cmdMsg.param4, cmdMsg.param5, cmdMsg.param6);
        break;
      case Commands.REMOVE_OBJECT:
        this.removeObject(cmdMsg.param1);
        break;
      case Commands.EDIT_OBJECT:
        this.editObject(cmdMsg.param1, cmdMsg.param2, cmdMsg.param3, cmdMsg.param4);
    }
  }
}

/**
 * Synchronization component for the server
 */
class ServerSyncComponent extends SyncComponent {
  host: Net.NetworkHost;
  createdObjectIds = new Set<number>();
  idCounter = 0;

  onInit() {
    this.host = this.scene.findGlobalComponentByName<Net.NetworkHost>(Net.NetworkHost.name);
    this.host.initHost(60, 7001);
  }

  sendMessageToClient(message: NetworkMessage, time: number) {
    this.host.pushMessageForSending(Net.NetMsgTypes.DATA, NET_MSG_COMMAND, time, 0, message, false, true);
  }

  onUpdate(delta: number, absolute: number) {
    if(this.host.peers.size !== 0) {
      // send a random event
      if(Math.random() > 0.9) {
        let rnd = Math.floor(Math.random() * 3);
        switch(rnd) {
          case 0:
            // add new object
            let id = this.idCounter++;
            this.createdObjectIds.add(id);
            let type = Math.floor(Math.random() * 3);
            let color = Math.floor(Math.random() * 0xFFFFFF);
            let posX = Math.random() * this.scene.app.screen.width;
            let posY = Math.random() * this.scene.app.screen.height;
            let rotation = Math.random() * Math.PI;
            this.addNewObject(type, id, color, posX, posY, rotation);
            this.sendMessageToClient(new NetworkMessage(Commands.ADD_OBJECT, type, id, color, posX, posY, rotation), absolute);
            break;
          case 1:
            if(this.createdObjectIds.size !== 0) {
              let randomId = [...this.createdObjectIds][Math.floor(Math.random() * this.createdObjectIds.size)];
              this.createdObjectIds.delete(randomId);
              this.removeObject(randomId);
              this.sendMessageToClient(new NetworkMessage(Commands.REMOVE_OBJECT, randomId), absolute);
            }
            break;
          case 2:
            if(this.createdObjectIds.size !== 0) {
              let randomId = [...this.createdObjectIds][Math.floor(Math.random() * this.createdObjectIds.size)];
              let posX = Math.random() * this.scene.app.screen.width;
              let posY = Math.random() * this.scene.app.screen.height;
              let rotation = Math.random() * Math.PI;
              this.editObject(randomId, posX, posY, rotation);
              this.sendMessageToClient(new NetworkMessage(Commands.EDIT_OBJECT, randomId, posX, posY, rotation), absolute);
            }
            break;
        }
      }
    }
  }
}


class ExampleNetworkCommands {
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

    this.engine.scene.addGlobalComponent(new Net.NetworkHost(), true);
    this.engine.scene.addGlobalComponent(new Net.NetworkClient(), true);
    this.engine.scene.addGlobalComponent(new KeyInputComponent());
  }
}

export class ExampleNetworkCommandsClient extends ExampleNetworkCommands {
  constructor(view: HTMLCanvasElement) {
    super(view, NetworkType.CLIENT);
  }
}

export class ExampleNetworkCommandsServer extends ExampleNetworkCommands {
  constructor(view: HTMLCanvasElement) {
    super(view, NetworkType.SERVER);
  }
}