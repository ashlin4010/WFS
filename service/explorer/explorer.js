const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const config = require.main.require("./lib/config.js");
const url = config.URLPrecursors.explorer;
const homeDir = config.rootDir;

router.get("/"+url+"*", function(req, res) {

    let workingDir = homeDir;   //This is the address where we will be reading, changing or downloading files form the user shod never see this
    let workingAddress = [];   //This is the last known working Address
    let address;                //Address is the stuff after url in a array without "/" and url example http:/localhost/url/it/gets/this/stuff ==> ["it","gets","this","stuff"]

    //makes address
    address = decodeURI(req.path).substring(url.length + 1);       //removes url "+1" because we have a "/"
    if (address.endsWith("/")) address = address.slice(0, -1);     //idk if we need this but we have it

    //splits address up and cleans int up
    address = address.split("/");
    if (address[0] === "") address.shift();

    //Is the stuff after url is working directory(s) if so add it to the end of workingAddress and workingDir.
    for (let i = 0; i < address.length; i++) {


        //is dir??
        if (presentInArray(findFiles(workingDir), address[i]) && fs.lstatSync(path.join(workingDir, address[i])).isDirectory()) {
            workingAddress.push(address[i]);
            workingDir = path.join(workingDir, address[i]);
        }
        //not a dir, is it not a file?
        else if (!presentInArray(findFiles(workingDir), address[i])) {
            //if url is not right redirect to last good url
            let redirect = "/" + workingAddress.join("/"); //we add the "/" to try to stop problems with the browser
            if (url !== "") redirect = "/" + url + redirect;
            console.log("Redirected " + redirect);
            res.redirect(redirect);
            return
        }
    }

    //Is the stuff after url is not working directory(s) but does exist on the machine then it must be a file or the inside of a dir.
    if (presentInArray(findFiles(workingDir), address[address.length - 1])) {
        console.log('Downloading ' + address[address.length - 1]);
        res.download(path.join(homeDir, address.join("/")));
    }
    else {
        console.log("Navigated to " + (workingAddress.join("/") === "" ? "Root" : workingAddress.join("/"))); //stop it printing "Navigated to "
        res.render('index', {files: fileInfo(workingDir), dir: workingAddress, url: config.URLPrecursors, path:path});
    } //Don't need to download a file and found all the working directories so render the page

}); //based of where the url references a file or a dir it will render a web page or download that file

function findFiles(dir) {
    return fs.readdirSync(dir);
} //Returns an array of files and directories in a directory

function fileInfo(dir) {
    let files = fs.readdirSync(dir);
    let output = [];
    for (let i = 0; i < files.length; i++) {
        let Extension = fileExtension(files[i]);
        let info = fs.lstatSync(path.join(dir,files[i]));
        let file = {
            name: files[i],
            dateModified: formatDate(info.mtime),
            directory: info.isDirectory(),
            size: info.size,
            type: Extension.type,
            fileIcon: Extension.icon
        };
        output.push(file);
    }
    return output;
} //Gets all the information that is render to the page each file is and object in an array

function formatDate(date) {
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();

    if (month.toString().length < 2){
        month = "0"+month.toString();
    }
    if (minutes.toString().length < 2){
        minutes = "0"+minutes.toString();
    }
    return day+"/"+month+"/"+year+" "+hours+":"+minutes;
} //Makes the time look good

function presentInArray(arr,obj) {
    return (arr.indexOf(obj) !== -1);
} //Is obj in the array?? returns bool

function fileExtension(fileName) {
    //The extension that go with what icon
    let audio = [".wav", ".mp3", ".ogg", ".gsm", ".dct", ".flac", ".au", ".aiff", ".vox"];
    let powerpoint = [".pptx", ".pptm", ".ppt", ".xps", ".potx", ".potm", ",pot", ".thmx", ".pps", ".ppsx", ".ppsm", ".ppt", ".ppam", ".ppa"];
    let pdf = [".pdf"];
    let code = [".js", ".c", ".ejs", ".json", ".class", ".cmd", ".cpp"];
    let archive = [".raw", ".zip", "iso", ".ARJ", ".TAR", ".GZ", ".TGZ"];
    let spreadsheet = [".gnumeric", ".ods", ".xls", ".xlsx", ".xlsm", ".xlsb", ".xlt", ".xml", ".xlam"];
    let text = [".txt", ".docx", ".docm", ".doc", ".dot", ".wbk", ".dotx", ".dotm", ".docb"];
    let video = [".webm", ".mkv", ".flv", ".vob", ".ogv", ".drc", ".mng", ".gifv", ".vai", ".mov", ".qt", ".wmv", ".yuv", ".rm", ".rmvb", ".asf", ".amv", ".mp4", ".m4p", ".m4v", ".mpg", ".mpeg", ".m2v", ".svi", ".3gp", ".svi", ".3g2", ".mxf", ".roq", ".nsv", ".flv", ".f4v", ".f4p", ".f4a", ".f4b"];
    let image = [, ".tif", ".tiff", ".gif", ".jpeg", ".jpg", ".jif", ".jfif", ".jp2", ".jpx", ".j2k", ".j2c", ".fpx", ".pcd", ".png"];
    let chrome = [".html"]; //html
    let executable = [".bat", ".sh", ".exe"];

    //Get the Extension for the files name
    let Extension = path.extname(fileName);

    //matches the extension to the icon and return the result
    //I might replace this with a switch
    if (presentInArray(audio, Extension)) {
        return {type: "audio", icon: "fa fa-file-audio-o"};
    } else if (presentInArray(powerpoint, Extension)) {
        return {type: "powerpoint", icon: "fa fa-file-powerpoint-o"};
    } else if (presentInArray(pdf, Extension)) {
        return {type: "pdf", icon: "fa fa-file-pdf-o"};
    } else if (presentInArray(code, Extension)) {
        return {type: "code", icon: "fa fa-file-code-o"};
    } else if (presentInArray(archive, Extension)) {
        return {type: "archive", icon: "fa fa-file-archive-o"};
    } else if (presentInArray(spreadsheet, Extension)) {
        return {type: "spreadsheet", icon: "fa fa-file-excel-o"};
    } else if (presentInArray(text, Extension)) {
        return {type: "text", icon: "fa fa-file-text-o"};
    } else if (presentInArray(video, Extension)) {
        return {type: "video", icon: "fa fa-file-video-o"};
    } else if (presentInArray(image, Extension)) {
        return {type: "image", icon: "fa fa-file-image-o"};
    } else if (presentInArray(chrome, Extension)) {
        return {type: "html", icon: "fa fa-chrome"};
    } else if (presentInArray(executable, Extension)) {
        return {type: "executable", icon: "fa fa-laptop"};
    }
    return {type: "unknown", icon: "fa fa-file-o"}
} //Returns a sting that is a class for awesome font

module.exports = router;