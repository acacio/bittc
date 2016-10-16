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


    });


    describe('encode', () => {

        it('should encode integers', () => {
            assert.equal(Bencode.encode(32), 'i32e');
        });

        it('should encode strings', () => {
            assert.equal(Bencode.encode('spam'), '4:spam');
        });

        it('should encode lists', () => {
            assert.equal(Bencode.encode(['spam', 42]), 'l4:spami42ee');
        });

        it('should encode dictionaries', () => {
            const m = new Map(
                [['bar', Buffer.from('spam')], ['foo', 42]]
            );
            assert.equal(Bencode.encode(m), 'd3:bar4:spam3:fooi42ee');
        });
    });



});
