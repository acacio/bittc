const EventEmitter = require('events').EventEmitter;
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

// Peer states
const HANDSHAKE = 0;
const CHOKED = 1;

class PeerNode extends EventEmitter {

    constructor (master, opts) {
        super();

        this.master = master;
        this.ip = opts.ip;
        this.port = opts.port;

        this.state = new Set([HANDSHAKE, CHOKED]);



        this.conn = net.createConnection(this.port, this.ip, () => {
            console.log('connected');
            this.conn.write(handshake, () => {
                console.log('send handshake');
            });
        });

        this.conn.on('error', (e) => {
            console.log(`peer has failed: ${this.ip}:${this.port}`);
        });

        this.conn.on('data', (chunk) => {


            // receive HANDSHAKE
            if (this.state.has(HANDSHAKE)) {


                const peerId = chunk.slice(chunk.length - 20).toString();
                console.log(`received HANDSHAKE from: ${peerId}`);
                this.state.delete(HANDSHAKE);



            } else {

                const length = chunk.readInt32BE();
                const code = chunk[4];


                // handle BITFIELD
                if (code == 5) {
                    console.log('received BITFIELD');
                    this.conn.write(interested, () => {
                        console.log('sent INTERESTED');
                    });
                // handle UNCHOKE
                } else if (code == 1) {
                    console.log('received UNCHOKE');
                    this.state.delete(CHOKED);

                    this.conn.write(request, () => {
                        console.log('sent REQUEST');
                    });
                // handle PIECE
                } else if (code == 7) {



                    const piece = {
                        pieceIdx : chunk.readInt32BE(5),
                        begin : chunk.readInt32BE(9),
                        block : chunk.slice(13)
                    };

                    this.master.emit('piece', piece);



                } else {
                    console.log('unknown message');
                }

            }

        });

    }
}

module.exports = PeerNode;
