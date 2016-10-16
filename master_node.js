const EventEmitter = require('events').EventEmitter;

const PeerNode = require('./peer_node');
const Tracker = require('./tracker');
const Bencode = require('./bencode');


class MasterNode extends EventEmitter {

    constructor (torrent) {
        super();
        this.torrent = torrent;
        this.peerId = Buffer.from('-MM0001-000000000000');

        this.tracker = new Tracker.Tracker(this, torrent);
        this.peers = new Map();


        this.bitfield = Array(this.torrent.pieces.length).fill(false);
        this.pending = Array(this.torrent.pieces.length).fill(false);

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

        for (let opts in peerOpts) {
            const peerNode = new PeerNode(this, this.torrent, opts);
            const peer = new Peer(node);
            this.peers.set(peer.id, peer);
        }
    }

    onPiece(piece) {
        console.log('received PIECE');
        console.log(piece);
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

module.exports = MasterNode;
