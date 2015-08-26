
var fs = require('fs');

fs.writeFile("d:/aa.txt", "woowra", function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
});

var rootPath = "d:/gitNoteData/";

function listNotes(path) {

}

function addNote(path) {

}

function saveNote(path, title) {

}
