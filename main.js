'use strict'

const fs = require('fs');

const Torrent = require('./torrent');
const MasterNode = require('./master_node');

if (process.argv.length < 3) {

    console.log('path to torrent file is not provided');
    console.log('example usage: node main.js hello.torrent');

} else {
    
    const path = process.argv.slice(-1)[0];
    const t = new Torrent(fs.readFileSync(path));

    const master = new MasterNode(t);
    master.on('finished', () => {
        console.log('download complete!');
        process.exit();
    });
}


