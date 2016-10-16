const EventEmitter = require('events').EventEmitter;

const PeerNode = require('./peer_node');
const Tracker = require('./tracker');
const Bencode = require('./bencode');
const Peer = require('./peer');
const File = require('./file');


class MasterNode extends EventEmitter {

    constructor (torrent) {
        super();
        this.torrent = torrent;
        this.peerId = padPeerId('-MM0001-');

        this.tracker = new Tracker.Tracker(this, torrent);
        this.peers = new Map();

        this.downloadPath = __dirname + '/downloads/' + torrent.info.get('name');
        this.file = new File(this.downloadPath, (err) => {
            console.log(err);
        });


        this.bitfield = Array(this.torrent.pieces.length).fill(false);
        this.pending = Array(this.torrent.pieces.length).fill(false);

        this.missingCount = this.bitfield.length;

        this.on('trackerConnected', this.onTrackerConnected);
        this.on('bitfield', this.onBitfield);
        this.on('needWork', this.onNeedWork);
        this.on('piece', this.onPiece);

        this.download();
    }

    download() {
        for (let pieceIdx of this.missing()) {
            const peer = this.findPeerToDownload(pieceIdx);
            if (peer) {
                this.queuePieceDownload(pieceIdx, peer);
            }
        }

        setImmediate(() => this.download());
    }

    *missing() {
        for (let i = 0; i < this.bitfield.length; i++) {
            if (!this.bitfield[i] && !this.pending[i]) {
                yield i;
            }
        }
    }

    findPeerToDownload(pieceIdx) {
        for (let peer of this.peers.values()) {
            if (peer.bitfield[pieceIdx] && peer.active) {
                return peer;
            }
        }
        return false;
    }

    queuePieceDownload(pieceIdx, peer) {
        peer.node.emit('download', pieceIdx);
        peer.active = false;
        this.peers.set(peer.id, peer);
    }

    onTrackerConnected(response) {
        const body = Bencode.decode(response);
        const peerOpts = Tracker.parsePeers(body.get('peers'));

        for (let opts of peerOpts) {
            const node = new PeerNode(this, this.torrent, opts);
            const peer = new Peer(node);
            this.peers.set(peer.id, peer);
        }
    }

    onPiece(piece) {

        this.bitfield[piece.idx] = true;
        this.pending[piece.idx] = false;

        this.file.write(piece);

        this.missingCount-=1;

        if (this.missingCount == 0) {
            this.emit('finished');
        }

    }

    onBitfield(node, bitfield) {
        const peer = this.peers.get(node.host());
        peer.bitfield = bitfield;
        this.peers.set(peer.id, peer);
    }

    onNeedWork(node) {
        const peer = this.peers.get(node.host());
        peer.active = true;
        this.peers.set(peer.id, peer);
    }

}

function padPeerId(prefix) {
    const pb = Buffer.from(prefix);
    const padLen = 20 - prefix.length;
    const pad = Buffer.alloc(padLen);

    for (let i = 0; i < padLen; i++) {
        pad[i] = Math.floor(Math.random() * 256);
    }

    return Buffer.concat([pb, pad]);
}

module.exports = MasterNode;
