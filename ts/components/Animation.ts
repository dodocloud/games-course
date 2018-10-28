import Component from '../engine/Component'

var Interpolation = {
    linear : null,
    easeinout: null,
};

Interpolation.linear = (current, start, length) => Math.min(1, Math.max(0, (current - start) / length));
Interpolation.easeinout = (current, start, length) => {
    let pos = Interpolation.linear(current, start, length);
    let posInt = pos < 0.5 ? 2 * pos * pos : -1 + (4 - 2 * pos) * pos;
    return Math.min(1, Math.max(0, posInt));
}


export class BaseAnimation extends Component {
    duration = 0;
    goBack = false;
    goingBack = false;
    loops = 0;
    currentLoop = 0;
    startTime = 0;
    interpolation: any = null;

    // loops = 0 for infinite!
    constructor(duration, goBack = false, loops = 1) {
        super();
        this.duration = duration;
        this.goBack = goBack;
        this.loops = loops;
        this.interpolation = Interpolation.linear;
    }

    update(delta: number, absolute : number) {
        if (this.startTime == 0) {
            this.startTime = absolute;
        }

        if (!this.goingBack) {
            // going forward
            let percent = this.interpolation(absolute, this.startTime, this.duration);
            this.applyAnim(percent, false);

            if (percent >= 1) {
                if (this.goBack) {
                    this.goingBack = true;
                    this.startTime = absolute;
                } else {
                    this.finish();
                }
            }
        } else {
            // going back (only if goBack == true)
            let percent = this.interpolation(absolute, this.startTime, this.duration);
            this.applyAnim(percent, true);

            if (percent >= 1) {
                if (++this.currentLoop != this.loops) {
                    this.goingBack = !this.goingBack;
                    this.startTime = absolute;
                } else {
                    this.finish();
                }
            }
        }
    }

    protected applyAnim(percent, inverted) {
        // override in child classes
    }
}

export class TranslateAnimation extends BaseAnimation {
    srcPosX = 0;
    srcPosY = 0;
    targetPosX = 0;
    targetPosY = 0;

    constructor(srcPosX: number, srcPosY: number, targetPosX: number, targetPosY: number, duration: number, goBack = false, loops = 1) {
        super(duration, goBack, loops);
        this.srcPosX = srcPosX;
        this.srcPosY = srcPosY;
        this.targetPosX = targetPosX;
        this.targetPosY = targetPosY;
    }

    oninit() {
        super.oninit();
        this.owner.mesh.position.x = this.srcPosX;
        this.owner.mesh.position.y = this.srcPosY;
    }

    protected applyAnim(percent, inverted) {
        if (inverted) {
            this.owner.mesh.position.x = this.targetPosX + percent * (this.srcPosX - this.targetPosX);
            this.owner.mesh.position.y = this.targetPosY + percent * (this.srcPosY - this.targetPosY);
        } else {
            this.owner.mesh.position.x = this.srcPosX + percent * (this.targetPosX - this.srcPosX);
            this.owner.mesh.position.y = this.srcPosY + percent * (this.targetPosY - this.srcPosY);
        }
    }
}

export class RotationAnimation extends BaseAnimation {
    srcRot = 0;
    targetRot = 0;
    
    constructor(srcRot, targetRot, duration, goBack = false, loops = 1) {
        super(duration, goBack, loops);
        this.srcRot = srcRot;
        this.targetRot = targetRot;
    }

    oninit() {
        super.oninit();
        this.owner.mesh.rotation = this.srcRot;
    }

    protected applyAnim(percent, inverted) {
        if (inverted) {
            this.owner.mesh.rotation = this.targetRot + percent * (this.srcRot - this.targetRot);
        } else {
            this.owner.mesh.rotation = this.srcRot + percent * (this.targetRot - this.srcRot);
        }
    }
}
