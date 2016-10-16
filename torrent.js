const crypto = require('crypto');

const Bencode = require('./bencode');

class Torrent {

    constructor (buffer) {
        this.data = Bencode.decode(buffer);
        this.info = this.data.get('info');

        // byte array
        this.infoHash = crypto.createHash('sha1')
            .update(Bencode.encode(this.info))
            .digest();

        this.pieces = splitToPieces(this.info.get('pieces'));
    }

}

function splitToPieces(data) {
    var acc = [];

    for (let i = 0; i < data.length; i+=20) {
        acc.push(data.slice(i, i+20));
    }

    return acc;
}

module.exports = Torrent
