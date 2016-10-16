
function decode(data) {

    var position = 0;

    const INT_START = Buffer.from('i')[0];
    const END = Buffer.from('e')[0];
    const LIST_START = Buffer.from('l')[0];
    const DICT_START = Buffer.from('d')[0];
    const BA_START = Buffer.from(':')[0];


    function int() {
        position++;

        var acc = [];
        while (data[position] != END) {
            acc.push(data[position]);
            position++;
        }

        position++;
        return parseInt(byteArrayToStr(acc));
    }

    function byteArrayToStr(arr) {
        return Buffer.from(arr).toString();
    }

    function byteArray() {
        var acc = [];
        while (data[position] != BA_START) {
            acc.push(data[position]);
            position++;
        }
        const length = parseInt(byteArrayToStr(acc));
        position++;

        acc = [];
        for (let i = 0; i< length; i++) {
            acc.push(data[position]);
            position++;
        }
        return Buffer.from(acc);
    }

    function list() {
        position++;

        var acc = [];
        while (data[position] != END) {
            const e = any();
            acc.push(e);
        }
        position++;
        return acc;
    }

    function dict() {
        position++;
        var acc = [];
        while (data[position] != END) {
            const key = byteArray().toString();
            const value = any();
            acc.push([key, value]);
        }
        position++;
        return new Map(acc);
    }

    function any() {
        var r;
        switch(data[position]) {
            case INT_START:
                r = int();
                break;
            case LIST_START:
                r = list();
                break;
            case DICT_START:
                r = dict();
                break;
            default:
                r = byteArray();
        }

        return r;

    }


    return any();


}


function encode(obj) {

    function int(o) {
        return 'i' + o + 'e';
    }

    function str(o) {
        return o.length + ':' + o;
    }

    function buffer(o) {
        return str(o.toString());
    }

    function list(o) {
        var acc = 'l';
        for (let e of o) {
            acc += any(e);
        }
        acc += 'e';
        return acc;
    }

    function dict(o) {
        var acc = 'd';
        for (let [k, v] of o) {
            acc += str(k);
            acc += any(v);
        }
        acc += 'e';
        return acc;
    }


    function any(o) {
        var r;
        switch (o.constructor) {
            case Number:
                r = int(o);
                break;
            case String:
                r = str(o);
                break;
            case Buffer:
                r = buffer(o);
                break;
            case Array:
                r = list(o);
                break;
            case Map:
                r = dict(o);
                break
            default:
                console.log('unknown type');
        }
        return r;
    }

    return any(obj);
}

module.exports = {
    decode: decode,
    encode: encode
}
