const assert = require('chai').assert;

const Piece = require('../piece');


describe('Piece', () => {


    describe('blockRanges', () => {

        it('should have ranges of same length if fileSize % pieceSize = 0', () => {
            var r, start, end;

            r = Piece.blockRanges({
                pieceIdx: 0,
                fileSize : 20,
                pieceSize: 10, 
                blockSize: 5
            });

            [start, end] = r[0];
            assert.equal(start, 0);
            assert.equal(end, 5);

            [start, end] = r[1];
            assert.equal(start, 5);
            assert.equal(end, 10);

            r = Piece.blockRanges({
                pieceIdx: 1,
                fileSize: 20,
                pieceSize: 10,
                blockSize: 5
            });

            [start, end] = r[0];
            assert.equal(start, 0);
            assert.equal(end, 5);

            [start, end] = r[1];
            [start, end] = r[0];
            assert.equal(start, 0);
            assert.equal(end, 5);
        });



        it('should have last range of length fileSize % pieceSize if fileSize % pieceSize != 0', () => {

            var r, start, end;

            r = Piece.blockRanges({
                pieceIdx: 0,
                fileSize : 18,
                pieceSize: 10, 
                blockSize: 5
            });

            [start, end] = r[0];
            assert.equal(start, 0);
            assert.equal(end, 5);

            [start, end] = r[1];
            assert.equal(start, 5);
            assert.equal(end, 10);

            r = Piece.blockRanges({
                pieceIdx: 1,
                fileSize : 18,
                pieceSize: 10, 
                blockSize: 5
            });

            [start, end] = r[0];
            assert.equal(start, 0);
            assert.equal(end, 5);

            [start, end] = r[1];
            assert.equal(start, 5);
            assert.equal(end, 8);
        });

    });


});
