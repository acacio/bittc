class Handshake {
    constructor (bytes) {

        const pstrlen = bytes[0];

        this.protocol = bytes.slice(1, 1+pstrlen).toString();
        this.infoHash = bytes.slice(1+pstrlen+8, 1+pstrlen+8+20);
        this.peerId = bytes.slice(1+pstrlen+8+20);
    }
}

class KeepAlive {}
class Choke {}
class Unchoke {}
class Interested {}
class Uninterested {}

class Have {

    constructor (bytes) {
        this.pieceIdx = bytes.readInt32BE(5);
    }
}

class Bitfield {
    constructor (bytes) {
        this.length = bytes.readInt32BE();
        const bitfield = bytes.slice(5);

        var acc = '';
        for (let i = 0; i < bitfield.length; i++) {
            acc += bitfield[i].toString(2);
        }

        this.bitfield = acc.split('').map((x) => x == 1);
    }
}

class Request {
    constructor (bytes) {
        this.pieceIdx = bytes.readInt32BE(5);
        this.offset = bytes.readInt32BE(9);
        this.length = bytes.readInt32BE(13);
    }
}

class Piece {
    constructor (bytes) {
        this.pieceIdx = bytes.readInt32BE(5),
        this.offset = bytes.readInt32BE(9),
        this.payload = bytes.slice(13)
    }
}


function parseHandshake(bytes) {

    if (bytes.length == 0 || bytes.length < bytes[0] + 49) {
        return [false, bytes];
    }

    const mLength = bytes[0] + 49;
    const message = bytes.slice(0, mLength);

    return [new Handshake(bytes), bytes.slice(mLength)];
}

function parse(bytes) {
    if (bytes.length < 4) {
        return [false, bytes];
    }

    const length = bytes.readInt32BE();
    if (length == 0) {
        return [new KeepAlive(), bytes.slice(4)];
    }

    const id = bytes[4];

    var msg;
    switch (id) {
        case 0:
            msg = new Choke();
            break;
        case 1:
            msg = new Unchoke();
            break;
        case 2:
            msg = new Interested();
            break;
        case 3:
            msg = new Uninterested();
            break;
        case 4: 
            msg = new Have(bytes);
            break;
        case 5: 
            msg = new Bitfield(bytes);
            break;
        case 6: 
            msg = new Request(bytes);
            break;
        case 7: 
            msg = new Piece(bytes);
            break;
        default:
            console.log('unknown message');
    }

    const rest = bytes.slice(length + 4);
    return [msg, rest];


}

module.exports = {
    Handshake: Handshake,
    KeepAlive: KeepAlive,
    KeepAlive: KeepAlive,
    Choke: Choke,
    Unchoke: Unchoke,
    Interested: Interested,
    Uninterested: Uninterested,
    Have: Have,
    Bitfield: Bitfield,
    Request: Request,
    Piece: Piece,

    parseHandshake: parseHandshake,
    parse: parse
}
