'use strict'

const net = require('net');

// HANDSHAKE

const protocol = 'BitTorrent protocol';
const infoHash = Buffer.from('ca155edaa8132d637537990d15dd70f277f72c50', 'hex');
const peerId = Buffer.from('-MM0001-000000000000');

const handshake = Buffer.concat([
    Buffer.from([protocol.length]),
    Buffer.from(protocol, 'ascii'),
    Buffer.alloc(8),
    infoHash,
    peerId
]);


// INTERESTED
var interested = Buffer.alloc(5);
interested.writeInt32BE(1);
interested[4] = 2;


// REQUEST
const pieceIdx = 0;
const begin = 0;
const length = 3332;

var request = Buffer.alloc(17);
request.writeInt32BE(13);
request[4] = 6;
request.writeInt32BE(pieceIdx, 5);
request.writeInt32BE(begin, 9);
request.writeInt32BE(length, 13);




const conn = net.createConnection('51413', '192.168.0.101', function() {
    console.log('connected');
    this.write(handshake, () => {
        console.log('send HANDSHAKE');
    });
});


const HANDSHAKE = 0;
const CHOKED = 1;
const state = new Set([HANDSHAKE, CHOKED]);

conn.on('data', function(chunk) {


    // receive HANDSHAKE
    if (state.has(HANDSHAKE)) {


        const peerId = chunk.slice(chunk.length - 20).toString();
        console.log(`received HANDSHAKE from: ${peerId}`);
        state.delete(HANDSHAKE);



    } else {

        const length = chunk.readInt32BE();
        const code = chunk[4];


        // handle BITFIELD
        if (code == 5) {
            console.log('received BITFIELD');
            this.write(interested, () => {
                console.log('sent INTERESTED');
            });
        // handle UNCHOKE
        } else if (code == 1) {
            console.log('received UNCHOKE');
            state.delete(CHOKED);

            this.write(request, () => {
                console.log('sent REQUEST');
            });
        // handle PIECE
        } else if (code == 7) {


            const pieceIdx = chunk.readInt32BE(5);
            const begin = chunk.readInt32BE(9);
            const block = chunk.slice(13);
            console.log('received PIECE');
            console.log(`pieceIdx: ${pieceIdx}, begin: ${begin}`);
            console.log(block.toString('ascii'));



        } else {
            console.log('unknown message');
        }

    }


});
