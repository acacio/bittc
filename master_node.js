
const EventEmitter = require('events').EventEmitter;

const PeerNode = require('./peer_node');
const Tracker = require('./tracker');
const Bencode = require('./bencode');


class MasterNode extends EventEmitter {

    constructor (torrent) {
        super();
        this.torrent = torrent;

        this.tracker = new Tracker.Tracker(this, torrent);
        this.peers = [];

        this.on('trackerConnected', (response) => {

            const body = Bencode.decode(response);
            this.peers = Tracker.parsePeers(body.get('peers')).map((opts) => {
                return new PeerNode(this, opts);
            });
        });

        this.on('piece', (piece) => {


            console.log('received PIECE');
            console.log(piece);
        });
    }

}

module.exports = MasterNode;
