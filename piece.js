const BLOCK_SIZE = 16384;

function getPieceCount(fileSize, pieceSize) {
    return Math.ceil(fileSize / pieceSize); 
}

function getBlockCount(pieceSize, blockSize = BLOCK_SIZE) {
    return Math.ceil(pieceSize / blockSize); 
}


function getPieceSize(pieceIdx, pieceCount, pieceSize, fileSize) {

    const remaining = fileSize % pieceSize;
    if (pieceIdx == pieceCount - 1 && remaining != 0) {
        return remaining;
    }

    return pieceSize;
}

function blockSize(blockIdx, blockCount, pieceSize, blockSize = BLOCK_SIZE) {


    const remaining = pieceSize % blockSize;
    if (blockIdx == blockCount - 1 && remaining != 0) {
        return remaining;
    }

    return blockSize;

}

function blockRanges(opts) {

    opts = Object.assign({}, {blockSize: BLOCK_SIZE}, opts);

    const pieceCount = getPieceCount(opts.fileSize, opts.pieceSize);
    const pieceSize = getPieceSize(opts.pieceIdx, pieceCount, opts.pieceSize, opts.fileSize);

    var splitPoints = [];

    for (let i = 0; i < pieceSize; i+= opts.blockSize) {
        splitPoints.push(i);
    }

    if (splitPoints[splitPoints.length - 1] != pieceSize) {
        splitPoints.push(pieceSize);
    }

    var ranges = [];

    for (let i = 1; i < splitPoints.length; i++) {
        ranges.push([splitPoints[i - 1], splitPoints[i]]);
    }

    return ranges;


}

module.exports = {
    blockRanges: blockRanges
}
