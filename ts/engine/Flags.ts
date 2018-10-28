/**
 * Bit array for flags
 */
export default class Flags {
    // flag array 0-128
    flags1: number = 0;
    flags2: number = 0;
    flags3: number = 0;
    flags4: number = 0;

    hasFlag(flag: number) {
        let index = this.getFlagIndex(flag);
        let offset = this.getFlagOffset(flag);
        let binary = 1 << offset;

        if (index <= 3) {
            switch (index) {
                case 0: return (this.flags1 & binary) == binary;
                case 1: return (this.flags2 & binary) == binary;
                case 2: return (this.flags3 & binary) == binary;
                case 3: return (this.flags4 & binary) == binary;
            }
        } else {
            throw new Error("Flag values beyond 128 are not supported");
        }
    }

    switchFlag(flag1: number, flag2: number) {
        let hasFlag2 = this.hasFlag(flag2);

        if (this.hasFlag(flag1)) this.setFlag(flag2);
        else this.resetFlag(flag2);

        if (hasFlag2) this.setFlag(flag1);
        else this.resetFlag(flag1);
    }

    setFlag(flag: number) {
        this.changeFlag(true, flag);
    }

    resetFlag(flag: number) {
        this.changeFlag(false, flag);
    }

    private getFlagIndex(flag: number) {
        return Math.floor(flag / 32); // sizeof 32bit int
    }

    private getFlagOffset(flag: number) {
        return flag % 32; // sizeof 32bit int
    }

    private changeFlag(set: boolean, flag: number) {
        let index = this.getFlagIndex(flag);
        let offset = this.getFlagOffset(flag);
        let binary = 1 << offset;

        if (index <= 3) {
            switch (index) {
                case 0: if (set) (this.flags1 |= binary); else (this.flags1 &= ~binary);
                case 1: if (set) (this.flags2 |= binary); else (this.flags2 &= ~binary);
                case 2: if (set) (this.flags3 |= binary); else (this.flags3 &= ~binary);
                case 3: if (set) (this.flags4 |= binary); else (this.flags4 &= ~binary);
            }
        } else {
            throw new Error("Flag values beyond 128 are not supported");
        }
    }
}
