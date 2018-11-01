
/**
 * Bit array for flags
 */
export default class Flags {
    // flag array 1-255
    flags1: number = 0;
    flags2: number = 0;
    flags3: number = 0;
    flags4: number = 0;

    /**
     * Returns true, if given flag is set
     */
    hasFlag(flag: number) {
        if (flag < 1 || flag > 255) {
            throw new Error("Only flag values between 1-255 are supported");
        }
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
            throw new Error("Flag at unsupported index");
        }
    }

    /**
     * Inverts given flag
     */
    invertFlag(flag: number) {
        if (this.hasFlag(flag)) {
            this.resetFlag(flag);
        } else {
            this.setFlag(flag);
        }
    }

    /**
     * Will switch two flags
     */
    switchFlag(flag1: number, flag2: number) {
        let hasFlag2 = this.hasFlag(flag2);

        if (this.hasFlag(flag1)) this.setFlag(flag2);
        else this.resetFlag(flag2);

        if (hasFlag2) this.setFlag(flag1);
        else this.resetFlag(flag1);
    }

    /**
     * Sets given flag to true
     */
    setFlag(flag: number) {
        this.changeFlag(true, flag);
    }

    /**
     * Sets given flag to false
     */
    resetFlag(flag: number) {
        this.changeFlag(false, flag);
    }

    private getFlagIndex(flag: number) {
        return Math.floor(flag / 64); // sizeof 64bit int
    }

    private getFlagOffset(flag: number) {
        return flag % 64; // sizeof 64bit int
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
            throw new Error("Flag at unsupported index");
        }
    }
}
