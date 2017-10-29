const express = require('express');
const router = express.Router();
const config = require.main.require("./lib/config.js");
const path = require("path");
let url = config.URLPrecursors.pdfViewer;
const fs = require("fs");

router.get("/"+url+"*",function (req, res) {
    let address = decodeURI(req.path).substring(url.length + 1);
    res.render('pdf', {url: config.URLPrecursors,pdf: address,path:path});
});

router.get('/asset', function(request, response){
    var tempFile="./Send/test.pdf";
    fs.readFile(tempFile, function (err,data){
        if(err) console.log(err);
        response.contentType("application/pdf");
        response.send(data);
    });
});

module.exports = router;