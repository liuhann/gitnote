/**
 * Created by liuhan on 2015/8/17.
 */

var currentSection;

$(function() {
    window.ondragover = function(e) { e.preventDefault(); return false };
    window.ondrop = function(e) { e.preventDefault(); return false };
    var holder = document.getElementById('textBox');
    $("#textBox").on("dragover", function() {
        $(this).addClass("hover");
    }).on("dragleave", function() {
        $(this).removeClass("hover");
    }).on("drop", function(je) {

        var oe = je.originalEvent;

        oe.preventDefault();
        for (var i = 0; i < oe.dataTransfer.files.length; ++i) {
            formatDoc("inserthtml", "<img src='" + oe.dataTransfer.files[i].path + "'/>");
        }
        return false;
    });
});
