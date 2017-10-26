const express = require('express');
const router = express.Router();
const config = require.main.require("./lib/config.js");
let url = config.URLPrecursors.explorer;

router.get("/"+url+"*",function (req, res) {
    let address = decodeURI(req.path);
    res.send(address);
});

module.exports = router;