
const url = require('url');
const http = require('http');
const fs = require('fs');

const Torrent  = require('./torrent');
const Bencode = require('./bencode');

class Tracker {


    constructor (torrent) {
        this.torrent = torrent;
        this.url = url.parse(torrent.data.get('announce').toString());

        const peerId = Buffer.from('-MM0001-000000000000');
        const params = {
            infoHash: escape(torrent.infoHash.toString('binary')),
            peerId: escape(peerId.toString('binary')),
            // TODO: fix me
            port: 6999,
            // TODO: fix me
            uploaded: 0,
            // TODO: fix me
            downloaded: 0,
            // TODO: fix me
            left: this.torrent.info.get('length')
        }

        const query = '?info_hash=' + params.infoHash +
            '&peer_id=' + params.peerId + 
            '&port=' + params.port + 
            '&uploaded=' + params.uploaded + 
            'downloaded=' + params.downloaded + 
            '&left=' + params.left + 
            '&compact=1' + 
            '&event=started';

        const options = {
            hostname: this.url.hostname,
            path: this.url.pathname + query,
            port: this.url.port
        }

        http.get(options, (res) => {

            console.log(`got response: ${res.statusCode}`);

            var response = [];
            res.on('data', (chunk) => {
                response.push(chunk);
            });

            res.on('end', () => {
                const body = Bencode.decode(Buffer.concat(response));
                console.log(parsePeers(body.get('peers')));
            });
        });
            
    }


}

function parsePeers(buffer) {
    var peerBuffList = [];
    for (let i = 0; i < buffer.length; i+=6) {
        peerBuffList.push(buffer.slice(i, i + 6));
    }
    return peerBuffList.map(parsePeer);
}

function parsePeer(buffer) {
    const ip = `${buffer[0]}.${buffer[1]}.${buffer[2]}.${buffer[3]}`;
    const port = buffer[4] << 8 | buffer[5];
    return {
        ip: ip,
        port: port
    }
}

module.exports = Tracker;
