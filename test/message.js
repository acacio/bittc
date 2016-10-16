const assert = require('chai').assert;

const Message = require('../message');

describe('Message', () => {


    describe('parseHandshake', () => {


        it('should not return message if not all data available', () => {
            const protocol = 'BitTorrent protocol';
            const handshake = Buffer.concat([
                Buffer.from([protocol.length])
            ]);

            const [message, buffer] = Message.parseHandshake(handshake);
            assert(message == false);
        });

        it('should return the rest of the buffer if surplus', () => {
            const protocol = 'BitTorrent protocol';
            const infoHash = Buffer.from('ca155edaa8132d637537990d15dd70f277f72c50', 'hex');
            const peerId = Buffer.from('-MM0001-000000000000');

            const handshake = Buffer.concat([
                Buffer.from([protocol.length]),
                Buffer.from(protocol, 'ascii'),
                Buffer.alloc(8),
                infoHash,
                peerId,
                Buffer([0x00, 0x01, 0x02])
            ]);

            const [message, buffer] = Message.parseHandshake(handshake);
            assert(buffer.equals(Buffer([0x00, 0x01, 0x02])));

        });


        it('should parse HANDSHAKE from bytes array', () => {

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


            const [message, buffer] = Message.parseHandshake(handshake);
            assert.instanceOf(message, Message.Handshake);
            assert.equal(message.protocol, protocol);
            assert(message.infoHash.equals(infoHash));
            assert(message.peerId.equals(peerId));
        });
    });

    describe('parse', () => {



        it('should not return message if not all data available', () => {
            const b = Buffer([0x00, 0x00, 0x00]);
            const [message, buffer] = Message.parse(b);
            assert(message == false);
        });

        it('should return the rest of the buffer if surplus', () => {
            const b = Buffer([0x00, 0x00, 0x00, 0x00, 0x01]);
            const [message, buffer] = Message.parse(b);
            assert.equal(buffer.length, 1);
            assert.equal(buffer[0], 1);
        });


        it('should parse KEEPALIVE from bytes array', () => {
            const target  = Buffer([0x00, 0x00, 0x00, 0x00]);
            const [message, buffer] = Message.parse(target);
            assert.instanceOf(message, Message.KeepAlive);
        });

        it('should parse CHOKE from bytes array', () => {
            const target  = Buffer([0x00, 0x00, 0x00, 0x01, 0x00]);
            const [message, buffer] = Message.parse(target);
            assert.instanceOf(message, Message.Choke);
        });


        it('should parse UNCHOKE from bytes array', () => {
            const target  = Buffer([0x00, 0x00, 0x00, 0x01, 0x01]);
            const [message, buffer] = Message.parse(target);
            assert.instanceOf(message, Message.Unchoke);
        });

        it('should parse INTERESTED from bytes array', () => {
            const target  = Buffer([0x00, 0x00, 0x00, 0x01, 0x02]);
            const [message, buffer] = Message.parse(target);
            assert.instanceOf(message, Message.Interested);
        });


        it('should parse UNINTERESTED from bytes array', () => {
            const target  = Buffer([0x00, 0x00, 0x00, 0x01, 0x03]);
            const [message, buffer] = Message.parse(target);
            assert.instanceOf(message, Message.Uninterested);
        });

        it('should parse HAVE from bytes array', () => {
            const target  = Buffer([
                0x00, 0x00, 0x00, 0x05, 
                0x04,
                0x00, 0x00, 0x00, 0x01
            ]);
            const [message, buffer] = Message.parse(target);
            assert.instanceOf(message, Message.Have);
            assert.equal(message.pieceIdx, 1);
        });

        it('should parse BITFIELD from bytes array', () => {
            const target  = Buffer([
                0x00, 0x00, 0x00, 0x02, 
                0x05,
                0x02
            ]);
            const [message, buffer] = Message.parse(target);
            assert.instanceOf(message, Message.Bitfield);
            assert.deepEqual(message.bitfield, [true, false]);
        });

        it('should parse REQUEST from bytes array', () => {
            const target  = Buffer([
                0x00, 0x00, 0x00, 0x0d, 
                0x06,
                0x00, 0x00, 0x00, 0x01, 
                0x00, 0x00, 0x00, 0x02, 
                0x00, 0x00, 0x00, 0x03, 
            ]);
            const [message, buffer] = Message.parse(target);
            assert.instanceOf(message, Message.Request);
            assert.equal(message.pieceIdx, 1);
            assert.equal(message.offset, 2);
            assert.equal(message.length, 3);
        });

        it('should parse PIECE from bytes array', () => {
            const target  = Buffer([
                0x00, 0x00, 0x00, 0x0d, 
                0x07,
                0x00, 0x00, 0x00, 0x00, 
                0x00, 0x00, 0x00, 0x00, 
                0x74, 0x65, 0x73, 0x74
            ]);
            const [message, buffer] = Message.parse(target);
            assert.instanceOf(message, Message.Piece);
            assert.equal(message.pieceIdx, 0);
            assert.equal(message.offset, 0);
            assert.equal(message.payload.toString(), 'test');
        });


    });
});
