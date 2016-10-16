const assert = require('chai').assert;
const fs = require('fs');

const Bencode = require('../bencode');


describe('Bencode', () => {


    describe('decode', () => {


        it('should decode integers', () => {
            const data = Buffer.from('i42e');
            assert.equal(Bencode.decode(data), 42);
        });

        it('should decode strings', () => {
            const data = Buffer.from('4:spam');
            assert(Bencode.decode(data).equals(Buffer.from('spam')));
        });

        it('should decode lists', () => {
            const data = Buffer.from('l4:spami42ee');
            const result = Bencode.decode(data);

            assert(result[0].equals(Buffer.from('spam')));
            assert.equal(result[1], 42);

        });

        it('should decode dictionaries', () => {

            const data = Buffer.from('d3:bar4:spam3:fooi42ee');

            const result = Bencode.decode(data);


            assert(result.get('bar').equals(Buffer.from('spam')));
            assert(result.get('foo') == 42);
        });

        it('should handle torrent file', () => {
            const data = fs.readFileSync(__dirname + '/data/loremipsum.torrent');
            const torrent = Bencode.decode(data);
            assert(torrent.has('announce'));
            assert(torrent.has('created by'));
            assert(torrent.has('creation date'));
            assert(torrent.has('encoding'));
            assert(torrent.has('info'));

            const info = torrent.get('info');
            assert(info.has('length'));
            assert(info.has('name'));
            assert(info.has('piece length'));
            assert(info.has('pieces'));
            assert(info.has('private'));

            assert.instanceOf(torrent.get('announce'), Buffer);
            assert.typeOf(torrent.get('creation date'), 'number');
        });


    });


    describe('encode', () => {

        it('should encode integers', () => {
            assert.equal(Bencode.encode(32), 'i32e');
        });

        it('should encode strings', () => {
            assert(Bencode.encode('spam').equals(Buffer.from('spam')));
        });

        it('should encode lists', () => {
            assert(
                Bencode.encode([Buffer.from('spam'), 42]).equals(
                    Buffer.from('l4:spami42ee')));
        });

        it('should encode dictionaries', () => {
            const m = new Map(
                [['bar', Buffer.from('spam')], ['foo', 42]]
            );
            assert.equal(Bencode.encode(m), 'd3:bar4:spam3:fooi42ee');
        });

        it('should handle torrent file', () => {


            const data = fs.readFileSync(__dirname + '/data/loremipsum.torrent');
            const torrent = Bencode.decode(data);

            assert.equal(data.toString(), Bencode.encode(torrent));


        });
    });



});
