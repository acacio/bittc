const EventEmitter = require('events').EventEmitter;
const net = require('net');

const Message = require('./message');


// Peer states
const HANDSHAKE = 0;
const AM_CHOKING = 1;
const AM_INTERESTED = 2;
const PEER_CHOKING = 3;
const PEER_INTERESTED = 4;

class PeerNode extends EventEmitter {

    constructor (master, torrent, opts) {
        super();

        this.master = master;
        this.torrent = torrent;

        this.ip = opts.ip;
        this.port = opts.port;

        // buffer for arrived chunks of messages
        this.buffer = [];
        // list of messages from peer
        this.inbox = [];

        // pieces available to this peer
        // TODO: fill with array of false values of length = pieces.length
        this.bitfield = false;

        this.state = new Set([HANDSHAKE, PEER_CHOKING]);



        this.conn = net.createConnection(this.port, this.ip, () => {
            console.log('connected');

            const handshake = Message.handshake(
                this.torrent.infoHash,
                this.master.peerId);

            this.conn.write(handshake.asBytes, () => {
                console.log('send handshake');
            });
        });

        this.conn.on('error', (e) => {
            console.log(`peer has failed: ${this.ip}:${this.port}`);
        });

        this.conn.on('data', (chunk) => {

            this.buffer.push(chunk);

            const buffer = Buffer.concat(this.buffer);

            var message, restOfBuffer;
            if (this.state.has(HANDSHAKE)) {
                [message, restOfBuffer] = Message.parseHandshake(buffer);
                this.state.delete(HANDSHAKE);
            } else {
                [message, restOfBuffer] = Message.parse(buffer);
            }

            if (message) {
                this.inbox.push(message);
                this.buffer = [restOfBuffer];
            }

        });


        this.react();
    }

    react() {
        this.handleIncomingMessages();
        this.inbox = [];

        setImmediate(() => {this.react()});
    }


    handleIncomingMessages() {
        if (this.inbox.length == 0) {
            return;
        }

        for (let msg of this.inbox) {
            switch (msg.constructor) {
                case Message.Unchoke:
                    this.onUnchoke();
                    break;
                case Message.Bitfield:
                    this.onBitfield(msg);
                    break;
                case Message.Piece:
                    this.onPiece(msg);
                    break;
                case Message.Have:
                    this.onHave(msg);
                    break;
                default:
                    console.log(`received ${msg.constructor.name}`);

            }
        }
    }

    onUnchoke(msg) {
        this.state.delete(PEER_CHOKING);
        this.conn.write(Message.request(0, 0, 3332).asBytes, () => {
            console.log('sent REQUEST');
        });
    }

    onBitfield(msg) {
        this.conn.write(Message.interested().asBytes, () => {
            this.bitfield = msg.bitfield;
            this.state.add(AM_INTERESTED);
            console.log('sent INTERESTED');
        });
    }

    onPiece(msg) {
        this.master.emit('piece', msg.payload);
    }

    onHave(msg) {
        this.bitfield[msg.pieceIdx] = true;
    }
}

module.exports = PeerNode;
