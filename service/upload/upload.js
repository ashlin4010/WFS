const express = require('express');
const router = express.Router();
const Busboy = require('busboy');
const path = require('path');
const fs = require('fs');

const config = require.main.require("./lib/config.js");
const url = config.URLPrecursors.upload;
const homeDir = config.rootDir;

router.post("/"+url+"*", function(req, res) {

    let address; //Address is the stuff after url in a array without "/" and url example http:/localhost/url/it/gets/this/stuff ==> ["it","gets","this","stuff"]

    //removes url string from url
    address = decodeURI(req.path).substring(url.length+1);
    if (address.endsWith("/")) address = address.slice(0, -1);

    let busboy = new Busboy({ headers: req.headers });

    busboy.on('file', function(fieldname, file, filename, encoding) {
        console.log('Upload started; filename: ' + filename + ', encoding: ' + encoding);

        file.on('data', function(data) {
            console.log('filename [' + filename + '] got ' + data.length + ' bytes');
        });

        file.on('end', function() {
            console.log('Upload ended; filename: ' + filename + ', encoding: ' + encoding);
        });

        if(filename){
            let saveTo = path.join(homeDir,path.join(address, path.basename(filename)));
            file.pipe(fs.createWriteStream(saveTo));
        }
    });

    busboy.on('finish', function() {
        res.writeHead(303, { Connection: 'close', Location: req.get('referer') });
        res.end();
    });

    req.pipe(busboy);
});//Handles file upload over post

module.exports = router;