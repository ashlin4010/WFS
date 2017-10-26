/**
 * Created by Ashlin Inwood on 5/05/2017.
 */
const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
let app = express();

const config = require("./lib/config");
const explorer = require("./service/explorer/explorer.js");
const upload = require("./service/upload/upload.js");
const videoPlayer = require("./service/videoPlayer/vp.js");

app.set('view engine', 'ejs'); //Set the view engine to ejs
app.use(express.static(path.join(__dirname, 'public')));//Set path to static files for webPage stuff

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));//Set the path favicon
app.get('/favicon.ico', function(req, res) {
    res.sendStatus(204);
});//F**K off favicon.ico

app.use("/",explorer);
app.use("/",upload);
app.use("/",videoPlayer);

app.get("/",function (req, res) {
   res.redirect("/"+config.URLPrecursors.explorer);
});

app.listen(80, function () {
    console.log("http://localhost:80"+"/"+config.URLPrecursors.explorer);
}); //Start the http server