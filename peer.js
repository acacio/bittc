class Peer {
    constructor (node) {
        this.node = node;
        this.id = node.host();
        this.active = false;
        this.bitfield = [];
    }
}

module.exports = Peer;
