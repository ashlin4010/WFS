const express = require('express');
const router = express.Router();
const config = require.main.require("./lib/config.js");
const path = require("path");
let url = config.URLPrecursors.videoPlayer;

router.get("/"+url+"*",function (req, res) {
    let address = decodeURI(req.path).substring(url.length + 1);
    res.render('video', {url: config.URLPrecursors,video: address,path:path});
});

module.exports = router;