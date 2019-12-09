import * as ECSA from '../../../libs/pixi-component';
import { checkTime } from '../../utils/functions';
import { KeyInputComponent, Keys } from '../../../libs/pixi-component/components/key-input-component';
import { TranslateAnimation, Interpolation } from '../../utils/animation';
import * as Net from '../../../libs/network-emulator';
import { NetworkBehavior } from './example-network-basic';

enum NetworkType {
  NONE, CLIENT, SERVER
}


class ExampleNetworkAnim {
  engine: ECSA.GameLoop;

  constructor(view: HTMLCanvasElement, netType: NetworkType, lag: number, packetLoss: number) {
    this.engine = new ECSA.GameLoop();
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);

    Net.UDPEmulator.reset();
    let loader = this.engine.app.loader;
    loader
    .reset()
    .load(() => {
      let client = new Net.NetworkClient();
      this.engine.scene.addGlobalComponent(new Net.NetworkHost(), true);
      this.engine.scene.addGlobalComponent(client, true);
      this.engine.scene.addGlobalComponent(new KeyInputComponent());

      let networkBehavior = new NetworkBehavior(netType, lag, packetLoss);
      let cmp = new TranslateAnimation(0, 0, view.clientWidth - 200, view.clientHeight - 200, 1500, true, 0);
      let graphics = new ECSA.Builder(this.engine.scene)
        .asGraphics()
        .relativePos(0.5)
        .anchor(0.5)
        .withComponent(networkBehavior)
        .withParent(this.engine.scene.stage)
        .build<ECSA.Graphics>();
      if(netType === NetworkType.SERVER) {
        graphics.addComponent(cmp);
      }

      graphics.beginFill(0xFF0000);
      graphics.drawRect(0, 0, 200, 200);
      graphics.endFill();

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

      cmp.interpolation = Interpolation.easeinout;
    });
  }
}

export class ExampleNetworkAnimClient extends ExampleNetworkAnim {
  constructor(view: HTMLCanvasElement) {
    super(view, NetworkType.CLIENT, 0, 0);
  }
}

export class ExampleNetworkAnimClientLagged extends ExampleNetworkAnim {
  constructor(view: HTMLCanvasElement) {
    super(view, NetworkType.CLIENT, 500, 0);
  }
}

export class ExampleNetworkAnimServer extends ExampleNetworkAnim {
  constructor(view: HTMLCanvasElement) {
    super(view, NetworkType.SERVER, 0, 0);
  }
}

export class ExampleNetworkAnimPacketLossClient extends ExampleNetworkAnim {
  constructor(view: HTMLCanvasElement) {
    super(view, NetworkType.CLIENT, 0, 0.25);
  }
}

export class ExampleNetworkAnimPacketLossLaggedClient extends ExampleNetworkAnim {
  constructor(view: HTMLCanvasElement) {
    super(view, NetworkType.CLIENT, 500, 0.75);
  }
}

export class ExampleNetworkAnimPacketLossServer extends ExampleNetworkAnim {
  constructor(view: HTMLCanvasElement) {
    super(view, NetworkType.SERVER, 0, 0);
  }
}