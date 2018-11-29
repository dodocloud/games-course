import { MatterExample } from './Matter';
import { Integrations } from './integrations';
import { Steering } from './Steering';
import { PixiRunner } from '../../ts/PixiRunner'
import { PIXICmp } from '../../ts/engine/PIXIObject';
import { QuadTreeExample } from './QuadTree';
import Starshooter from './Starshooter';

class Lecture4 {
    engine: PixiRunner;

    // Start a new game
    constructor() {
        this.engine = new PixiRunner();
        this.engine.init(document.getElementById("gameCanvas") as HTMLCanvasElement, 1);

        PIXI.loader
            .reset()    // necessary for hot reload
            .add("droid", "static/examples/droid.png")
            .load(() => this.onAssetsLoaded());
    }

    onAssetsLoaded() {
        // load example
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.has('p') ? urlParams.get('p').toLowerCase() : ""; 
        switch (page) {
            case 'integrations':
                new Integrations().init(this.engine.scene);
                break;
            case 'matter':
                new MatterExample().init(this.engine.scene);
                break;
            case 'starshooter':
                new Starshooter().init(this.engine.scene);
                break;
            case 'steering':
                new Steering().init(this.engine.scene);
                break;
            case 'quadtree':
                new QuadTreeExample().init(this.engine.scene);
                break;
            default:
                new Integrations().init(this.engine.scene);
                break;
        }
    }
}

new Lecture4();

