const fs = require('fs');

class File {
    constructor (path, errCb) {
        this.path = path;
        this.buffer = [];
        this.errCb;
        this.create();
    }

    create() {
        fs.open(this.path, 'w+', (err, fd) => {

            if (err) {
                this.errCb(err);
            } else {
                this.fd = fd;
            }
        });
    }

    write(piece) {
        this.buffer.push(piece);
        if (this.buffer.length == 1) {
            this.writeToFile();
        }
    }

    writeToFile() {
        if (this.buffer.length == 0) {
            return;
        }
        const piece = this.buffer.shift();
        fs.write(this.fd, piece.data, 0, piece.data.length, piece.offset, (err) => {
            if (err) {
                this.errCb(err);
            } else {
                process.nextTick(() => {this.writeToFile()});
            }
        });
    }
}


module.exports = File;
