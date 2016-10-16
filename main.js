'use strict'

const fs = require('fs');

const Torrent = require('./torrent');
const MasterNode = require('./master_node');


const t = new Torrent(fs.readFileSync('./torrents/loremipsum.torrent'));
const master = new MasterNode(t);
