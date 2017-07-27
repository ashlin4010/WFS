/**
 * Created by Ashlin Inwood on 5/05/2017.
 */
const express = require('express');
const favicon = require('serve-favicon');
const fs = require('fs');
const path = require('path');
const Busboy = require('busboy');
let app = express();
let configJson = {
    "rootDir": path.join(__dirname, 'Send'),
    "URLPrecursors":""
};//config

try {
    configJson = require('./config.json');
}//load config file
catch(e) {
    if (e.code !== 'MODULE_NOT_FOUND') throw e;
    fs.writeFileSync(path.join(__dirname,"config.json"),JSON.stringify(configJson));
}//make config file

let homeDir = configJson.rootDir; //Root directory for files

let url = configJson.URLPrecursors; //some text that can go before the rest of the url path

app.set('view engine', 'ejs'); //Set the view engine to ejs

app.use(express.static(path.join(__dirname, 'public')));//Set path to static files

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));//Set the path favicon

app.get('/favicon.ico', function(req, res) {
    res.sendStatus(204);
});//F**K off favicon.ico

app.post('*', function(req, res) {

    let address; //Address is the stuff after url in a array without "/" and url example http:/localhost/url/it/gets/this/stuff ==> ["it","gets","this","stuff"]

    //removes url string from url
    address = decodeURI(req.path).substring(url.length);
    if (address.endsWith("/")) {
        address = address.slice(0, -1);
    }

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

app.get(url+'*', function(req, res) {

    let workingDir = homeDir;   //This is the address where we will be reading, changing or downloading files form
    let workingAddress = url;   //This is the last known working Address with /url at the start
    let address;                //Address is the stuff after url in a array without "/" and url example http:/localhost/url/it/gets/this/stuff ==> ["it","gets","this","stuff"]

    //makes address
    address = decodeURI(req.path).substring(url.length); //remove url
    if (address.endsWith("/")) address = address.slice(0, -1);

    address = address.split("/");
    if (address[0] === "") address.shift();

    //workingAddress shod not have "/" at the end
    if (workingAddress.endsWith("/")) workingAddress = workingAddress.slice(0, -1);
    workingAddress = [workingAddress];

    //Is the stuff after url is working directory(s) if so add it to the end of workingAddress and workingDir.
    for (let i = 0; i < address.length; i++) {
        if (presentInArray(findFiles(workingDir), address[i]) && fs.lstatSync(path.join(workingDir,address[i])).isDirectory()) {
            workingAddress.push(address[i]);
            workingDir = path.join(workingDir,address[i]);
        }
        else if (!presentInArray(findFiles(workingDir), address[i])){
            res.redirect((workingAddress.join("/") === "") ? "/": workingAddress.join("/"));
            return
        }
    }

    //Is the stuff after url is not working directory(s) but does exist on the machine then it must be a file so download it.
    if (presentInArray(findFiles(workingDir), address[address.length - 1])) {
        console.log('Downloading ' + address[address.length - 1]);
        res.download(path.join(homeDir,address.join("/")));
    }
    else {
        console.log("Navigated to " + (workingAddress.join("/") === "" ? "Root": workingAddress.join("/"))); //stop it printing "Navigated to "
        res.render('index', {files: fileInfo(workingDir), dir: workingAddress});
    } //Don't need to download a file and found all the working directories so render the page

}); //based of where the url references a file or a dir it will render a web page or download that file

app.listen(80, function () {
    console.log("http://localhost:80"+url);
}); //Start the http server

function findFiles(dir) {
    return fs.readdirSync(dir);
} //Returns an array of files and directories in a directory

function fileInfo(dir) {
    let files = fs.readdirSync(dir);
    let output = [];
    for (let i = 0; i < files.length; i++) {
        let fileIcon = fileExtension(files[i]);
        let info = fs.lstatSync(path.join(dir,files[i]));
        let file = {
            name: files[i],
            dateModified: formatDate(info.mtime),
            directory: info.isDirectory(),
            size: info.size,
            fileIcon: fileIcon
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
    let audio = [".wav",".mp3",".ogg",".gsm",".dct",".flac",".au",".aiff",".vox"];
    let powerpoint = [".pptx",".pptm",".ppt",".xps",".potx",".potm",",pot",".thmx",".pps",".ppsx",".ppsm",".ppt",".ppam",".ppa"];
    let pdf = [".pdf"];
    let code = [".js",".c",".ejs",".json",".class",".cmd",".cpp"];
    let archive = [".raw",".zip","iso",".ARJ",".TAR",".GZ",".TGZ"];
    let spreadsheet = [".gnumeric",".ods",".xls",".xlsx",".xlsm",".xlsb",".xlt",".xml",".xlam"];
    let text = [".txt",".docx",".docm",".doc",".dot",".wbk",".dotx",".dotm",".docb"];
    let video = [".webm",".mkv",".flv",".vob",".ogv",".drc",".mng",".gifv",".vai",".mov",".qt",".wmv",".yuv",".rm",".rmvb",".asf",".amv",".mp4",".m4p",".m4v",".mpg",".mpeg",".m2v",".svi",".3gp",".svi",".3g2",".mxf",".roq",".nsv",".flv",".f4v",".f4p",".f4a",".f4b"];
    let image = [,".tif",".tiff",".gif",".jpeg",".jpg",".jif",".jfif",".jp2",".jpx",".j2k",".j2c",".fpx",".pcd",".png"];
    let chrome = [".html"]; //html
    let executable = [".bat",".sh",".exe"];

    //Get the Extension for the files name
    let Extension = path.extname(fileName);

    //matches the extension to the icon and return the result
    //I might replace this with a switch
    if(presentInArray(audio,Extension)){
        return "fa fa-file-audio-o"
    }else if(presentInArray(powerpoint,Extension)){
        return "fa fa-file-powerpoint-o"
    }else if(presentInArray(pdf,Extension)){
        return "fa fa-file-pdf-o"
    }else if(presentInArray(code,Extension)){
        return "fa fa-file-code-o"
    }else if(presentInArray(archive,Extension)){
        return "fa fa-file-archive-o"
    }else if(presentInArray(spreadsheet,Extension)){
        return "fa fa-file-excel-o"
    }else if(presentInArray(text,Extension)){
        return "fa fa-file-text-o"
    }else if(presentInArray(video,Extension)){
        return "fa fa-file-video-o"
    }else if(presentInArray(image,Extension)){
        return "fa fa-file-image-o"
    }else if(presentInArray(chrome,Extension)){
        return "fa fa-chrome"
    }else if(presentInArray(executable,Extension)){
        return "fa fa-laptop"
    }
    return "fa fa-file-o"
} //Returns a sting that is a class for awesome font