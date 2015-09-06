
/*
fs.writeFile("d:/aa.txt", "woowra", function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
});
*/

var rootPath = "d:/GitNote/";

var http = require('http');
var fs = require('fs');

var currentNote = null;

function listNotes(path) {
    if (path==null) {
        path = "recents";
    }
    var fs = require('fs');
    fs.readdir(rootPath + path, function(error, files) {
        if (!error && files.length>0) {
            for(var i=0; i<files.length; i++) {
                addNote(files[i]);
            }
        }
    });
}

function addNote(file) {

}

function downloadFile(src) {
    var filePath = rootPath  + currentNote + "/img/" + randStr(4) + ".png";
    console.log("Fetch File : " + src + " ->" + filePath);

    fs.exists(filePath, function (exists) {
        if (!exists) {
            fs.mkdir(rootPath  + currentNote + "/img/", function() {

                if (src.indexOf("data:image")>-1) {
                    fs.writeFile(filePath, src, function(error) {
                    });
                } else {
                    var file = fs.createWriteStream(filePath);
                    var request = http.get(src, function(response) {
                        response.pipe(file);
                        file.on('finish', function() {
                            file.close(cb);  // close() is async, call cb after close completes.
                        });
                    }).on('error', function(err) { // Handle errors
                        fs.unlink(dest); // Delete the file async. (But we don't check the result)
                    });
                }
            });
        }
    });
    return filePath;
}

function newNote() {
    fs.readdir(rootPath, function(error, files){
        var name = 1;
        if (!error && files.length>0) {
            for(var i=0; i<files.length; i++) {
                if (parseInt(files[i])>name) {
                    name = parseInt(files[i]);
                }
            }
        }
        name++;
        fs.mkdir(rootPath + name, function() {
            currentNote = name;
            $("#textBox").empty();
        });
    });
}

function saveNote() {
    fs.writeFile(rootPath  + currentNote + "/index.md", extractMD($("#textBox").html()), function(error) {
        if(error) {
            console.log(error);
        } else {
            console.log("The file was saved!");
        }
    });
}
