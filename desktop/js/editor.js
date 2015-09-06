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
    }).on("paste", function(pe) {
        var oe = pe.originalEvent;
        if (oe && oe.clipboardData && oe.clipboardData.getData) {// Webkit - get data from clipboard, put into editdiv, cleanup, then cancel event
            if (/text\/html/.test(oe.clipboardData.types)) {
                if (oe.preventDefault) {
                    oe.stopPropagation();
                    oe.preventDefault();
                }
                var html =  oe.clipboardData.getData('text/html');
                //$(html).find("pre").remove();

                var dom = $(html).wrapAll('<div>').parent();

                console.log(dom.html());

                dom.find("img").each(function() {
                    $(this).attr("src", "file://" + downloadFile($(this).attr("src")));
                });

                console.log(dom.html());
                var md = extractMD(dom.html());
                formatDoc("inserthtml", mdToHtml(md));
            } else if (/text\/plain/.test(oe.clipboardData.types)) {
                formatDoc("inserthtml", oe.clipboardData.getData('text/plain'));
            } else {

            }
            return false;
        }
    });
});

jQuery.fn.tagName = function() {
    return this.prop("tagName");
};

function extractMD(val) {
    return toMarkdown(val);
}

function mdToHtml(html) {
    return marked(html)
}

function traverse(dom) {
    $(dom).contents().each(function() {
        if (3===this.typeName) {
            md += $(this).text() + "\n";
        } else {
            if ("LI"===$(this).tagName()) {
                if ($(this).parents("blockquote").length>-1) {
                    md += "> ";
                }
                if ("OL"===$(this).parent().tagName()) {
                    md += $(this).sibling().index($(this)) + ". " + $(this).text() + "\n";
                }
                if ("UL"===$(this).parent().tagName()) {
                    md +=  "- " + $(this).text() + "\n";
                }
                return;
            }

            if ("PRE"===$(this).tagName()) {
                md += "    " + $(this).text().replace( new RegExp( "\\n", "g" ), "\n    ");
                return;
            }

            if ("H1"===$(this).tagName()) {
                md += "\r# " + $(this).text() + "\n";
                return;
            }
            if ("H2"===$(this).tagName()) {
                md += "\r## " + $(this).text() + "\n";
                return;
            }
            if ("H3"===$(this).tagName()) {
                md += "\r### " + $(this).text() + "\n";
                return;
            }
            if ("H4"===$(this).tagName()) {
                md += "\r#### " + $(this).text() + "\n";
                return;
            }
            if ("H5"===$(this).tagName()) {
                md += "\r##### " + $(this).text() + "\n";
                return;
            }


            if ($(this).children().length>0) {
                traverse($(this));
            } else {
                if ("BLOCKQUOTE"===$(this).tagName()) {
                    md += "> " + $(this).text() + "\n";
                    return;
                }

                md += "\r" + $(this).text() + "\n";
            }
        }
    });
}
