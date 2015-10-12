var rootPath = "d:/GitNote/";

var http = require('http');
var fs = require('fs');

var currentNote = {};

var allTags = [];

$(function() {
    /**Init when some thing copied into the editor*/
    initPaste();

    /**Events */
    initEvents();

    /**Read notes from fs*/
    listNotes();
});

function initPaste() {
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
            var url = downloadFile(oe.dataTransfer.files[i].path);
            formatDoc("inserthtml", "<img src='" + url + "'/>");
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

                var dom = $(html).wrapAll('<div>').parent();
                dom.find("img").each(function() {
                    var url = downloadFile($(this).attr("src"), function() {

                    });

                    if (url==null) {
                        $(this).remove();
                    } else {
                        $(this).attr("src", "file://" + url);
                    }
                });
                var md = MdUtils.html2Md(dom.html());
                formatDoc("inserthtml", MdUtils.md2Html(md));
            } else if (/text\/plain/.test(oe.clipboardData.types)) {
                formatDoc("inserthtml", oe.clipboardData.getData('text/plain'));
            } else {

            }
            return false;
        }
    });
}

function formatDoc(sCmd, sValue) {
    oDoc = document.getElementById("textBox");
    document.execCommand(sCmd, true, sValue); oDoc.focus();
}


function initEvents() {
    $("#note-title").keyup(function() {
        $(".note-list li.selected .title").html($(this).val());
        $(".note-list li.selected .hovered .mt").html($(this).val());
    });

    $(".tag-edit .close").click(function() {
        $(".tag-edit").slideUp('fast');
    });
}

function listNotes() {
    var notes = [];
    fs.readdir(rootPath, function(error, files) {
        if (!error && files.length>0) {

            /**read note info from meta*/
            for(var i=0; i<files.length; i++) {
                var path = rootPath + files[i] + "/meta.md";
                if(fs.existsSync(path)) {
                    var md = fs.readFileSync(path, "utf8");
                    var note = MdUtils.md2Object(md);
                    note.path = rootPath + files[i];
                    notes.push(note);
                }
            }

            /**resort by modified time*/
            notes.sort(function(x, y) {
                if (new Date(x.modified) > new Date(y.modified)) {
                    return 1;
                } else {
                    return 0;
                }
            });

            /**display notes*/
            for(var i=0; i<notes.length; i++) {
                /**init all tags*/
                if (notes[i].tags) {
                    var dr = notes[i].tags.split(",");
                    for(var r=0; r<dr.length; r++) {
                        if (allTags.indexOf(dr[r])===-1) {
                            allTags.push(dr[r]);
                        }
                        //allTags[dr[r].toString()] = {};
                    }
                }
                _addNote(notes[i]);
            }
        }

        console.log(allTags);

        if (notes.length>0) {
            /**open the recentest note by default*/
            currentNote = notes[notes.length-1];
            $(".note-list li:not(.template):first").addClass("selected");
            openNote(currentNote);
        } else {
            /**If no note, create a default one*/
            newNote();
        }
    });
}

/***
 * Update note info on the navigation list
 * @param note
 * @private
 */
function _updateNote(note) {
    var noteListEntry = $("#" + note.path.slice(note.path.lastIndexOf("/")+1));

    __bindNote(noteListEntry, note);

    if ($(".note-list li.dt").index(noteListEntry)>0) {
        noteListEntry.prependTo(noteListEntry.parent());
    }
}


/**
 * Add note to the navigation list
 * @param note
 * @param focused
 * @private
 */
function _addNote(note, focused) {
    var cloned = $(".note-list li.dt.template").clone().removeClass("template").addClass("note");

    cloned.attr("id", note.path.slice(note.path.lastIndexOf("/")+1));

    __bindNote(cloned, note);

    cloned.click(function() {
        if ($(this).hasClass("selected")) {
            return;
        }
        saveNote(true);
        $(".note-list li.selected").removeClass("selected on");
        $(this).addClass("selected");

        var note = $(this).data("note");
        openNote(note);
    });

    cloned.find(".rm").click(function(e){
        var note = $(this).parents("li").data("note");
        removeNote(note);
        e.stopPropagation();
    });

    if (focused) {
        $(".note-list li.selected").removeClass("selected on");
        cloned.addClass("selected");
    }

    $(".note-list ul").prepend(cloned);
}


function __bindNote(cloned, note) {
    cloned.data("note", note);
    cloned.find(".desc").html(note.desc);
    cloned.find(".title").html(note.title);

    if (note.title==="") {
        note.title = "无标题笔记";
    }
    cloned.find(".tags").empty();
    if (note.tags) {
        var dr = note.tags.split(",");
        for (var i = 0; i < dr.length; i++) {
            var o = dr[i];
            cloned.find(".tags").append("<span class='tag'>" + o + "</span>");
        }
    }
}

function openNote(note) {
    htmlMode();
    currentNote = note;

    var md ;
    if (fs.existsSync(note.path + "/autosave.index.md")) {
        var md = fs.readFileSync(note.path + "/autosave.index.md", "utf8");
    } else {
        var md = fs.readFileSync(note.path + "/index.md", "utf8");
    }

    $("#textBox").html(MdUtils.md2Html(md));
    currentNote.md = md;
    $("#note-title").val(note.title);
}


function removeNote(note) {
    if (!fs.existsSync(rootPath + "trash")) {
        fs.mkdirSync(rootPath + "trash");
    }
    console.log("link: " +  note.path + "->" + rootPath + "trash/" + note.path.slice(note.path.lastIndexOf("/")+1));
    fs.rename(note.path, rootPath + "trash/" + note.path.slice(note.path.lastIndexOf("/")+1), function() {
        var $node = $("#" + note.path.slice(note.path.lastIndexOf("/")+1));

        if (note.path===currentNote.path) {
            var candidate = $node.prev("li.note");
            if (candidate.length===0) {
                candidate = $node.next("li.note");
            }
            if (candidate.length===0) {
                newNote();
            } else {
                currentNote = candidate.data("note");
                candidate.addClass("selected");
                openNote(currentNote);
            }
        }
        $node.slideUp("fast").remove();
    });
}

function downloadFile(src, cb) {
    var filePath = currentNote.path + "/img/" + randStr(4) + ".png";
    console.log("Fetch File : " + src + " ->" + filePath);

    fs.exists(filePath, function (exists) {
        if (!exists) {
            fs.mkdir(currentNote.path + "/img/", function() {

                if (src.indexOf("data:image")>-1) {
                    return null;
                    /*   base64的图片稍后处理
                     fs.writeFile(filePath, src, function(error) {
                     });
                     */
                } else {
                    var file = fs.createWriteStream(filePath);
                    if (src.indexOf("http:")===0) {
                        var request = http.get(src, function(response) {
                            response.pipe(file);
                            file.on('finish', function() {
                                if (cb) {
                                    file.close(cb);
                                } else {
                                    file.close();
                                }
                            });
                        }).on('error', function(err) { // Handle errors
                            fs.unlink(dest); // Delete the file async. (But we don't check the result)
                        });
                    } else {
                        fs.createReadStream(src).pipe(file);
                    }
                }
            });
        }
    });
    return filePath;
}

function newNote(template) {
    var name = new Date().format("note-yyMMdd-HHmmss");

    saveNote(true);
    fs.mkdir(rootPath + name, function() {
        currentNote = {};

        currentNote.path = rootPath + name;
        if (template==null) {
            $("#textBox").empty();
        } else {
            $("#textBox").html(MdUtils.md2Html(template));
        }

        currentNote.created = new Date().format("yyyy-MM-dd HH:mm:ss");
        currentNote.modified = new Date().format("yyyy-MM-dd HH:mm:ss");
        currentNote.desc = "";
        currentNote.length = 0;
        currentNote.title = "";

        $("#note-title").val(currentNote.title);
        saveNote();
        _addNote(currentNote, true);
    });
}




function saveNote(autoSave) {
    var md = MdUtils.html2Md($("#textBox").html());
    var meta = {
        "modified": new Date().format("yyyy-MM-dd HH:mm:ss"),
        "created": currentNote.created,
        "title": ($("#note-title").val()==="")?"无标题笔记":$("#note-title").val()
    };

    if (currentNote.tags) {
        meta.tags = currentNote.tags;
    }

    /**Here replace out the marks like header(##),link([]),image(![])*/
    var desc = MdUtils.md2RawText(md);

    if (desc.length>200) {
        meta.desc = desc.substring(0, 200);
    } else {
        meta.desc = desc;
    }
    meta.length = desc.length;

    var pics = MdUtils.getMdPics(md);

    currentNote.length = meta.length;
    currentNote.modified = meta.modified;
    currentNote.title = meta.title;

    if (autoSave) {
        if (md!=currentNote.md) {
            fs.writeFile(currentNote.path + "/autosave.index.md", md, function(error) {
                if(error) {
                    console.log(error);
                }
            });
        }
    } else {
        if(fs.existsSync(currentNote.path + "/autosave.index.md")) {
            fs.unlink(currentNote.path + "/autosave.index.md");
        }
        fs.writeFile(currentNote.path + "/meta.md" , MdUtils.object2Md(meta), function(error) {
            if(error) {
                console.log(error);
            }
        });
        fs.writeFile(currentNote.path + "/index.md", md, function(error) {
            if(error) {
                console.log(error);
            }
        });
        _updateNote(currentNote);
    }
}



var MdUtils = {

    //plat line object to md
    object2Md: function(o) {
        var md = "";
        for(k in o) {
            md += k + ":" + o[k] + "\r\n";
        }
        return md;
    },

    md2Object: function(md) {
        var lines = md.split("\n");
        var o = {};
        for(var i=0;i<lines.length; i++) {
            var sep = lines[i].indexOf(":");
            if (sep>-1) {
                o[lines[i].substring(0, sep)] = lines[i].substring(sep+1);
            }
        }
        return o;
    },

    md2RawText: function(md) {
        md.replace(/ *#{1,6}/g, "").replace(/!\[\]\([^\)]*\)/g, "")
            .replace(/\([^\)]*\)/g, "");
        return md;
    },

    getMdPics: function(md) {
        var ls =  md.match(/!\[\]\([^\)]*\)/g);
        if (ls==null) return null;
        var rs = [];
        for(var i=0; i<ls.length; i++) {
            rs.push(ls[i].substring(ls[i].lastIndexOf("/") + 1, ls[i].length-1));
        }
        return rs;
    },

    getMeta: function(md) {
        var lines = md.split("\n");

        var metas = {};
        for(var i=0;i<lines.length; i++) {
            if (lines[i].indexOf(MdUtils.metaEnd)>-1) {
                break;
            } else {
                if (lines[i].indexOf(":")>-1) {
                    var splits = lines[i].split(":");
                    metas[splits[0]] = splits[1];
                }
            }
        }
        return metas;
    },

    html2Md: function(html) {
        return toMarkdown(html);
    },

    md2Html: function(md) {
        return marked(md);
    }
};


function mdMode() {
    $("#textBox").hide();
    $("#mdbox").show();

    var text = MdUtils.html2Md($("#textBox").html());
    $("#mdbox textarea").val(text);

    $(".btnbar i").hide();
    $(".btnbar i.mode-rtf").show();
    $(".btnbar i.icon-ok").show();
}

function htmlMode() {
    $("#textBox").show();
    $("#mdbox").hide();

    var md = $("#mdbox textarea").val();

    var html = MdUtils.md2Html(md);
    $("#textBox").html(html);

    $(".btnbar i").show();
    $(".btnbar i.mode-rtf").hide();
    $(".btnbar i.icon-ok").show();
}


function editTag() {
    $(".tag-edit").show();
    showMask();

    $(".tag-edit .tags .tag").remove();

    var dr = [];
    /**init current note tag*/
    $(".tag-edit .on .empty").remove();

    if (currentNote.tags) {
        dr = currentNote.tags.split(",");
        for(var i=0; i<dr.length; i++) {
            addTag(dr[i], ".on");
        }
    }

    if (dr.length===0) {
        $(".tag-edit .on").append("<span class='empty'>无标签</span>");
    }

    /**init all tags*/
    for (var i = 0; i < allTags.length; i++) {
        var tag = allTags[i];
        if (dr.indexOf(tag)===-1) {
            addTag(tag, ".off");
        }
    }
    $("#new-tag").unbind();
    $("#new-tag").keypress(function( event ) {
        if ( event.which == 13 ) {
            var newtag = $("#new-tag").val();
            if (newtag === "") {
                return;
            }
            $(".tag-edit .on span.empty").remove();
            addTag(newtag, ".on");
            $("#new-tag").val("");
        }
    });

    function addTag(name, parent) {
        var tspan = $("<span class='tag'>" + name + "</span>");
        $(".tag-edit").find(parent).append(tspan);

        tspan.click(function() {
            if ($(this).parent().hasClass("on")) {
                moveAnimate($(this), $(".tag-edit .tags .off"));
                if ($(".tag-edit .on .tag").length===0) {
                    $(".tag-edit .on").append("<span class='empty'>无标签</span>");
                }
            } else {
                $(".tag-edit .on span.empty").remove();
                moveAnimate($(this), $(".tag-edit .tags .on"));
            }
        });
    }
}

function saveEditTag() {
    var tags = [];
    $(".tag-edit .on .tag").each(function() {
        tags.push($(this).html());
    });
    /*
    allTags = [];
    $(".tag-edit .tag").each(function() {
        var tag = $(this).html();
        if (allTags.indexOf(tag)===-1) {
            allTags.push(tag);
        }
    });
    */
    currentNote.tags = tags.join(",");
    saveNote();
    closeEditTag();
}

function closeEditTag() {
    $(".tag-edit").hide();
    hideMask();
}


function _toggleNoteList() {
    if ($(".sidebar .icon-menu").hasClass("on")) {
        $(".sidebar .icon-menu").removeClass("on");
        $(".list").css("transform", "rotateY(90deg)");
        //$(".list").css("opacity", "0");
        $(".content").css("left", "44px");
    } else {
        $(".sidebar .icon-menu").addClass("on");
        $(".list").css("transform", "rotateY(0deg)");
        $(".list").css("opacity", "1");
        $(".content").css("left", "384px");
    }
}


function _toggleBooks() {

    if (parseInt($(".content").css("left"))>600) {
        $(".nav-books").css("-webkit-transform", "translateX(-300px)");
        $(".list").css("transform", "translateX(0)");
        $(".content").css("left", "384px");
    } else {
        $(".nav-books").css("-webkit-transform", "translateX(0)");
        $(".list").css("transform", "translateX(300px)");
        $(".content").css("left", "684px");
    }


}

