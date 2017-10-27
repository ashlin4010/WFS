const express = require('express');
const router = express.Router();
const config = require.main.require("./lib/config.js");
const path = require("path");
let url = config.URLPrecursors.audioPlayer;

router.get("/"+url+"*",function (req, res) {
    let address = decodeURI(req.path).substring(url.length + 1);
    res.render('audio', {url: config.URLPrecursors,audio: address,path:path});
});

module.exports = router;