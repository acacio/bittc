const Bencode = require('./bencode');

class Torrent {

    constructor (buffer) {
        this.data = Bencode.decode(buffer);
        this.info = this.data.get('info');
    }

    pieces() {
        const data = this.info.get('pieces');

        var acc = [];

        for (let i = 0; i < data.length; i+=20) {
            acc.push(data.slice(i, i+20));
        }

        return acc;
    }
}
