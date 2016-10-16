class Job {
    constructor (pieceIdx, blockRanges) {
        this.pieceIdx = pieceIdx;
        this.blockRanges = blockRanges;
        this.bitfield = Array(blockRanges.length).fill(false);
        this.blocks = [];
    }

    nextBlockIdx () {
        return this.bitfield.findIndex((x) => !x);
    }

    completed() {
        return this.nextBlockIdx() == -1;
    }


    addBlock(offset, block) {
        const blockIdx = this.blockRanges.findIndex((r) => r[0] == offset);
        this.blocks[blockIdx] = block;
        this.bitfield[blockIdx] = true;
    }

    piece() {
        return Buffer.concat(this.blocks);
    }
}

module.exports = Job;
