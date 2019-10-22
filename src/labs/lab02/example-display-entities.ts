import * as PIXI from 'pixi.js';

abstract class BaseApp extends PIXI.Application {

  constructor(view: HTMLCanvasElement, transparent: boolean = false) {
    super({
      view,
      transparent,
      backgroundColor: 0x000000,
      antialias: true,
      resolution: 1,
      width: view.clientWidth,
      height: view.clientHeight,
    });

    this.init();
    this.ticker.add(deltaTime => this.update(deltaTime));
  }

  abstract init();

  abstract update(deltaTime: number);
}

export class DisplaySprite extends BaseApp {
  sonic: PIXI.Sprite;
  tint = 0;

  constructor(view: HTMLCanvasElement) {
    super(view, true);
  }

  init() {
    let texture = PIXI.Texture.from('./assets/lab02/sonic.png');
    this.sonic = new PIXI.Sprite(texture); // or PIXI.Sprite.from(<url>)
    this.sonic.position.set(this.screen.width / 2, this.screen.height / 2);
    this.sonic.anchor.set(0.5);
    this.stage.addChild(this.sonic);
  }

  update(deltaTime: number) {
    this.tint = (this.tint + 5) % 0xFF;
    let tintCoeff = this.tint > 128 ? 0xFF - this.tint : this.tint;
    this.sonic.tint = ((tintCoeff*2) << 16) + 0xFFFF;
  }
}

export class DisplayPrimitives extends BaseApp {

  constructor(view: HTMLCanvasElement) {
    super(view);
  }

  init() {
    // Create a line
    let line = new PIXI.Graphics();

    // Define line style = stroke
    // width, color, alpha
    line.lineStyle(10, 0xD5402B, 1);
    // align the top left corner of an element
    line.position.x = this.screen.width / 2;
    line.position.y = this.screen.height / 2;
    // Define pivot to the center of the element = transformOrigin
    line.pivot.set(0,140);
    line.rotation = 0.785398;

    // Draw line
    line.moveTo(5,0);
    line.lineTo(5, 280);

    this.stage.addChild(line);

    // create a circle
    let circle = new PIXI.Graphics();
    // define outline = stroke
    circle.lineStyle(20, 0x91CF46, 1);
    // draw circle (x, y, radius)
    circle.drawCircle(this.screen.width / 2, this.screen.height / 2,100);

    this.stage.addChild(circle);

    // create a triangle
    let triangle = new PIXI.Graphics();
    triangle.lineStyle(5, 0x4A5FB4, 1);
    triangle.position.set(this.screen.width / 2, this.screen.height / 2);
    triangle.moveTo(20,0);
    triangle.lineTo(100, 80);
    triangle.lineTo(20, 80);
    triangle.lineTo(20, 0);
    this.stage.addChild(triangle);
  }

  update(deltaTime: number) {

  }
}

export class DisplayBitmapText extends BaseApp {
  private text: PIXI.BitmapText;
  private counter = 0;

  constructor(view: HTMLCanvasElement) {
    super(view);
  }

  init() {
    this.loader.add('myFont', './assets/lab02/dosfont.fnt').load(() => {
      // Once font has been loaded, call a function that uses it
      this.text = new PIXI.BitmapText('Pixel bitmap font', { font: { name: 'PxPlus IBM VGA8', size: 80 }, align: 'center' });
      this.text.position.x = this.screen.width / 2;
      this.text.position.y =  this.screen.height / 2;
      this.text.anchor = 0.5;
      this.stage.addChild(this.text);
    });
  }

  update(deltaTime: number) {
    if(this.text && this.counter++ %5 === 0) {
      if(this.text.tint === 0x555555) {
        this.text.tint = 0xFFFFFF;
      } else {
        this.text.tint = 0x555555;
      }
    }
  }
}

export class DisplayRegularText extends BaseApp {

  private text: PIXI.Text;
  private directionLeft = false;

  constructor(view: HTMLCanvasElement) {
    super(view);
  }

  init() {
    const style = new PIXI.TextStyle({
      fontFamily: 'Adventure',
      fontSize: 36,
      fill: ['#ffffff', '#00ff99'], // gradient
      stroke: '#4a1850',
      strokeThickness: 5,
    });

    this.text = new PIXI.Text('Regular font taken from @font-face', style);
    this.text.position.set(this.screen.width / 2, this.screen.height / 2);
    this.text.anchor.set(0.5);
    this.stage.addChild(this.text);
  }

  update(deltaTime: number) {
    if(this.directionLeft) {
      this.text.position.x -= deltaTime;
    } else {
      this.text.position.x += deltaTime;
    }
    if(this.text.getBounds().left < 0) {
      this.directionLeft = false;
    } else if(this.text.getBounds().right > this.screen.width) {
      this.directionLeft = true;
    }
  }
}

export class DisplayParticles extends BaseApp {
  container: PIXI.ParticleContainer;

  private static particlesNum = 250;

  constructor(view: HTMLCanvasElement) {
    super(view);
  }

  init() {
    this.container = new PIXI.ParticleContainer(DisplayParticles.particlesNum, {
      position: true, // allows to change position during update
      rotation: true, // allows to change rotation during update
    });

    let texture = PIXI.Texture.from('./assets/lab02/ghost.png');

    for(let i=0; i< DisplayParticles.particlesNum; i++) {
      let particle = new PIXI.Sprite(texture);
      particle.position.set(Math.random() * this.screen.width, Math.random() * this.screen.height);
      particle.anchor.set(0.5);
      particle.scale.set(0.25);
      particle.rotation = Math.random() * Math.PI;
      this.container.addChild(particle);
    }

    this.stage.addChild(this.container);
  }

  update(deltaTime: number) {
    for(let child of this.container.children) {
      let distanceToTheEdge = Math.sqrt(child.x * child.x + child.y * child.y);
      // a magic way how to make distant particles rotating somehow faster
      child.rotation += 0.001 * deltaTime * Math.sqrt(distanceToTheEdge * 50);
    }
  }
}

export class DisplayButton extends BaseApp {
  private sonic: PIXI.Sprite;
  private animRunning = false;

  constructor(view: HTMLCanvasElement) {
    super(view, true);
  }

  init() {
    let texture = PIXI.Texture.from('./assets/lab02/sonic.png');
    this.sonic = new PIXI.Sprite(texture); // or PIXI.Sprite.from(<url>)
    this.sonic.position.set(this.screen.width / 2, this.screen.height / 2);
    this.sonic.anchor.set(0.5);

    // set interactivity
    this.sonic.interactive = true;
    // will display hand icon
    this.sonic.buttonMode = true;

    this.sonic.on('pointerdown', () => {
      this.animRunning = !this.animRunning;
    });

    this.stage.addChild(this.sonic);
  }

  update(deltaTime: number) {
    if(this.animRunning) {
      this.sonic.rotation += deltaTime * 0.01;
    }
  }
}

export class DisplayZIndex extends BaseApp {
  sonic: PIXI.Sprite;
  sonic2: PIXI.Sprite;
  counter = 0;

  constructor(view: HTMLCanvasElement) {
    super(view, true);
  }

  init() {
    // this needs to be set for the subtree upon which we want to apply z-indices
    this.stage.sortableChildren = true;

    this.sonic = PIXI.Sprite.from('./assets/lab02/sonic.png');
    this.sonic.position.set(this.screen.width / 2, this.screen.height / 2);
    this.sonic.anchor.set(0.5);
    this.sonic.zIndex = 1;

    this.sonic2 = PIXI.Sprite.from('./assets/lab02/sonic.png');
    this.sonic2.position.set(this.screen.width / 2, this.screen.height / 2);
    this.sonic2.anchor.set(0.5);
    this.sonic2.rotation = Math.PI / 2;
    this.sonic2.zIndex = 2;
    this.sonic2.tint = 0x666666;

    this.stage.addChild(this.sonic);
    this.stage.addChild(this.sonic2);
  }

  update(deltaTime: number) {
    // swap indices every 60 frames
    if(this.counter++ % 60 === 0) {
      let temp = this.sonic.zIndex;
      this.sonic.zIndex = this.sonic2.zIndex;
      this.sonic2.zIndex = temp;
    }
  }
}

