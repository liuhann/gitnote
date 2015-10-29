/**
 * Created by liuhan on 2015/10/19.
 */

var noteService = (function(fs, http, $){

    /***
     *
     * Note Meta Runtime
     *
     * path :  full folder D:\GitNote1\book-default\我是狗狗
     * saved:  false/true
     * title: 我是狗狗
     * created\modified: time
     * tags: lists
     * desc: extract from md
     * length: size
     *
     * @type {string}
     */

    var rootPath = "d:/GitNote1/";

    var currentBook = "";

    var NAME_TRASH = "回收站";

    var currentNote = null;

    if (!fs.existsSync(rootPath)) {
        fs.mkdirSync(rootPath);
    }

    function listNotes(book) {
        if (book==null) {
            book = "book-默认笔记本";
        }
        currentBook = book;
        var bookPath = rootPath + book + "/";

        if(!fs.existsSync(bookPath)) {
            fs.mkdirSync(bookPath);
        }

        logger.log("Listing book " + bookPath);
        $(".note-list ul li.note").remove();

        $(".note-list .empty").show();

        fs.readdir(bookPath, function(error, files) {
            var notes = [];
            if (!error && files.length>0) {
                /**read note info from meta*/
                for(var i=0; i<files.length; i++) {
                    /**filter out the folder name without 'note-'*/
                    var path = bookPath + files[i] + "/meta.md";
                    if(fs.existsSync(path)) {
                        var md = fs.readFileSync(path, "utf8");
                        var note = MdUtils.md2Object(md);
                        note.path = bookPath + files[i];
                        note.saved = true;
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

                logger.debug("files ");
                logger.debug(notes);

                /**display notes*/
                for(var i=0; i<notes.length; i++) {
                    $(".note-list .empty").hide();
                    _addNote(notes[i]);
                }
            }

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


    /**
     * Add note to the navigation list
     * @param note
     * @param focused
     * @private
     */
    function _addNote(note, focused) {
        var cloned = $(".note-list li.dt.template").clone().removeClass("template").addClass("note");

        _bindNoteData(cloned, note);
        cloned.click(function() {
            if ($(this).hasClass("selected")) {
                return;
            }
            saveCurrentNote(true);
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


    function _bindNoteData(cloned, note) {
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

    function saveCurrentNote(autoSave) {
        logger.debug("save current note");
        logger.debug(currentNote);
        var noteTitle = $("#note-title").val().trim();
        var md = MdUtils.html2Md($("#textBox").html());

        if (currentNote.saved===false && noteTitle==="" && md==="") {
            /**新建的文档，未保存，未填写内容则直接废弃*/
            return;
        }

        if (noteTitle==="") {
            Dialog.alert("标题不能为空");
            return;
        }

        if (!StringUtils.isFileName(noteTitle)) {
            Dialog.alert("标题含有非法字符");
            return
        }

        var bookPath = rootPath + currentBook + "/";

        if (currentNote.saved && currentNote.title != noteTitle) {
            if (fs.existsSync(bookPath + noteTitle)) {
                Dialog.alert("存在同名的笔记，请更换");
                return
            }
            fs.renameSync(currentNote.path, bookPath + noteTitle);
            currentNote.path = bookPath + noteTitle;
        }

        if (currentNote.saved === false) {
            /**创建目录*/
            if (fs.existsSync(bookPath + noteTitle)) {
                Dialog.alert("存在同名的笔记，请更换");
                return
            }
            fs.mkdirSync(bookPath + noteTitle);
            currentNote.path = bookPath + noteTitle;
            autoSave = false;
        }


        var md = MdUtils.html2Md($("#textBox").html());
        var meta = {
            "modified": new Date().format("yyyy-MM-dd HH:mm:ss"),
            "created": currentNote.created,
            "title": noteTitle
        };

        if (currentNote.tags) {
            meta.tags = currentNote.tags;
        }

        /**Here replace out the marks like header(##),link([]),image(![])*/
        var desc = MdUtils.md2RawText(md);
        meta.length = desc.length;
        if (desc.length>200) {
            meta.desc = desc.substring(0, 200);
        } else {
            meta.desc = desc;
        }

        logger.debug(meta);
        var pics = MdUtils.getMdPics(md);

        if (pics && pics.length>0) {
            meta.pic = pics[0];
        }
        currentNote.length = meta.length;
        currentNote.modified = meta.modified;
        currentNote.title = meta.title;
        currentNote.desc = meta.desc;

        if (autoSave) {
            fs.writeFile(currentNote.path + "/autosave.index.md", md, function(error) {
                if(error) {
                    console.error(error);
                }
            });
            return;
        } else {
            if(fs.existsSync(currentNote.path + "/autosave.index.md")) {
                fs.unlink(currentNote.path + "/autosave.index.md");
            }

            fs.writeFile(currentNote.path + "/meta.md" , MdUtils.object2Md(meta), function(error) {
                if(error) {
                    console.error(error);
                }
            });
            fs.writeFile(currentNote.path + "/index.md", md, function(error) {
                if(error) {
                    console.error(error);
                }
            });
        }

        if (currentNote.saved) {
            _updateNote(currentNote);
        } else {
            currentNote.saved = true;
            _addNote(currentNote);
        }

    }

    /***
     * Update note info on the navigation list
     * @param note
     * @private
     */
    function _updateNote(note) {
        var noteListEntry = $(".note-list .note.selected");
        _bindNoteData(noteListEntry, note);
        if ($(".note-list li.dt").index(noteListEntry)>0) {
            noteListEntry.prependTo(noteListEntry.parent());
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

    function mdMode() {
        $("#textBox").hide();
        $("#mdbox").show();

        var text = MdUtils.html2Md($("#textBox").html());
        $("#mdbox textarea").val(text);

        $(".editor-btns i").hide();
        $(".editor-btns i.mode-rtf").show();
        $(".editor-btns i.icon-ok").show();
    }

    function htmlMode() {
        $("#textBox").show();
        $("#mdbox").hide();

        var md = $("#mdbox textarea").val();

        var html = MdUtils.md2Html(md);
        $("#textBox").html(html);

        $(".editor-btns i").show();
        $(".editor-btns i.mode-rtf").hide();
        $(".editor-btns i.icon-ok").show();
    }


    function removeNote(note) {
        if (!fs.existsSync(rootPath + NAME_TRASH)) {
            fs.mkdirSync(rootPath + NAME_TRASH);
        }

        fs.rename(note.path, rootPath + NAME_TRASH + "/" + StringUtils.randomStr(8), function() {
            listNotes(currentBook);
        });
    }

    function newNote(template) {
        if (currentNote!=null) {
            saveCurrentNote(true);
        }
        $(".note-list li.selected").removeClass("selected on");
        currentNote = {};
        currentNote.saved = false;
        currentNote.created = new Date().format("yyyy-MM-dd HH:mm:ss");
        currentNote.modified = new Date().format("yyyy-MM-dd HH:mm:ss");

        if (template==null) {
            $("#textBox").empty();
        } else {
            logger.log("setting content : " + template);
            $("#textBox").html(MdUtils.md2Html(template));
        }
        $("#note-title").val("");
    }

    /**
     * Init when some thing copied into the editor
     * */
    function initPaste() {
        window.ondragover = function(e) { e.preventDefault(); return false };
        window.ondrop = function(e) { e.preventDefault(); return false };
        logger.debug("initial paste");
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

                    logger.debug("pasting html ");

                    if (oe.preventDefault) {
                        oe.stopPropagation();
                        oe.preventDefault();
                    }
                    var html =  oe.clipboardData.getData('text/html');
                    var md = MdUtils.html2Md(html);

                    var pics = MdUtils.getMdPics(md);
                    console.log(pics);

                    formatDoc("inserthtml", MdUtils.md2Html(md));

                    for(var i=0;i<pics.length; pics++) {
                        if (pics[i].indexOf("file://")===-1) {
                            downloadFile(pics[i]);
                        }
                    }


                } else if (/text\/plain/.test(oe.clipboardData.types)) {
                    formatDoc("inserthtml", oe.clipboardData.getData('text/plain'));
                } else {

                }
                return false;
            }
        });
    }

    function downloadFile(src) {
        var imgId = StringUtils.randomStr(4);
        var filePath = currentNote.path + "/img/";
        console.log("Fetch File : " + src + " ->" + filePath);

        fs.exists(filePath, function (exists) {
            if (!exists) {
                fs.mkdir(filePath, function() {

                    if (src.indexOf("data:image")>-1) {
                        return null;
                        /*   base64的图片稍后处理
                         fs.writeFile(filePath, src, function(error) {
                         });
                         */
                    } else {
                        var file = fs.createWriteStream(filePath + imgId + "." + src.getFileExt());
                        if (src.indexOf("http:")===0) {
                            var request = http.get(src, function(response) {
                                response.pipe(file);
                                file.on('finish', function() {
                                    file.close();
                                    $("img[src='" + src  +"']").attr("src", filePath + imgId + "." + src.getFileExt());
                                    //$("#img-" + imgId).attr("src", currentNote.path + "img/" + imgId);
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
        return imgId;
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

    $(function() {
        initPaste();
        initEvents();

        $(".mask").click(function() {
            closeEditTag();
        });

        $("textarea").on('keydown',function(e){
            if(e.keyCode == 9){
                e.preventDefault();
                var indent = '    ';
                var start = this.selectionStart;
                var end = this.selectionEnd;
                var selected = window.getSelection().toString();
                selected = indent + selected.replace(/\n/g,'\n'+indent);
                this.value = this.value.substring(0,start) + selected + this.value.substring(end);
                this.setSelectionRange(start+indent.length,start+selected.length);
            }
        });

        $("[contenteditable='true']").on("keydown", function(e) {
            if(e.keyCode == 9){
                e.preventDefault();
            }
        });
    });

    return {
        rootPath: rootPath,
        saveNote: saveCurrentNote,
        mdMode: mdMode,
        htmlMode: htmlMode,
        listNotes: listNotes,
        showNotes: _toggleNoteList,
        newNote: newNote
    }
}(fs, http, $));