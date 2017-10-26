/**
 * Created by Ashlin Inwood on 8/08/2017.
 */
const fs = require("fs");
const path = require('path');
const config_path = path.join(__dirname, "/../config.json");
let config = {
    URLPrecursors: {
        explorer: "file",
        upload: "upload",
        videoPlayer: "video"
    },
    rootDir: "D:\\WebstormProjects\\WFS\\Send"

};//config

try {
    config = require(config_path);
}//load config file
catch(e) {
    if (e.code !== 'MODULE_NOT_FOUND') throw e;
    fs.writeFileSync(config_path, JSON.stringify(config,null,2));
}//make config file

module.exports = config;