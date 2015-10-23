/**
 * Created by liuhan on 2015/10/19.
 */

var bookService = (function(fs, noteService) {

    var rootPath = noteService.rootPath;

    function listBooks() {
        logger.debug("listing books");
        fs.readdir(rootPath , function(error, files) {
            if (!error && files.length>0) {
                $(".book-list li.book").not(".template").remove();
                logger.debug(files);
                for(var i=0; i<files.length; i++) {
                    if (files[i].indexOf("book-")>-1) {
                        var filename = files[i].substring("book-".length);
                        (function(filename) {
                            fs.readdir(noteService.rootPath + files[i], function(error, files) {
                                _addBook(filename, files.length);
                            });
                        }(filename));
                    }
                }
            }
        });
    }

    function _toggleBooks() {
        if (parseInt($(".content").css("left"))>500) {
            /**would hide book list*/
            $(".nav-books").css("-webkit-transform", "translateX(-100px)");
            $(".list").css("transform", "translateX(0)");
            $(".content").css("left", "384px");
        } else {
            /**show books list*/

            /**need refresh book */
            listBooks();
            $(".nav-books").css("-webkit-transform", "translateX(0)");
            $(".list").css("transform", "translateX(200px)");
            $(".content").css("left", "584px");
        }
    }


    function _editBook(cl) {
        var inp = $("<input class='in-book-title' placeholder='笔记本名称'>");

        if ($(cl).data("oname")) {
            inp.val(name);
        }

        $(cl).find(".title").replaceWith(inp);


        save.click(function () {
            var bookTitle = $(".in-book-title").val();
            if (bookTitle === "") {
                saveErrorMsg("名称不能为空");
                return;
            }

            var bookPath = rootPath + "book-" + bookTitle;
            if (fs.existsSync(bookPath)) {
                saveErrorMsg("已存在同名笔记");
                return;
            }

            if ($(cl).data("oname") == null) {
                /**new book*/
                fs.mkdir(bookPath, function () {
                    listBooks();
                });
            } else {

            }
            /**update book name*/
        });
        $(cl).find(".total").remove();
        $(cl).append(save);
    }

    function saveErrorMsg(msg) {
        $(cl).find("span.error").remove();
        $(cl).append("<span class='error'>" + msg + "</span>");
    }

    function _addBook(name, length) {
        logger.debug("add book name=" + name + "   length=" + length);

        var cl = $(".book-list li.template.book").clone().removeClass("template");
        cl.find(".title").html(name);
        cl.find("input").val(name);

        if (length===0) {
            cl.find(".total").html("没有笔记");
        } else {
            cl.find(".total").html(length + "个笔记");
        }

        (function(name) {
            cl.click(function() {
                if ($(this).hasClass("selected")) {
                    return;
                }
                $(".book.selected").removeClass("selected");
                $(this).addClass("selected");
                _openBook(name);
            });

            cl.find("a.save").click(function() {
                if($(cl).find("a.in-book-title")) {

                }
            });
            cl.find("a.delete").click(function() {
                Dialog.confirm("确定删除这个笔记本?", function() {
                    fs.rmdir(rootPath + "book-" +name, function() {
                        listBooks();
                    });
                });
            });

            cl.find("a.cancel").click(function() {
                cl.removeClass("editing");
            });

            cl.find(".icon-pencil").click(function() {
               cl.addClass("editing");
            });
        }(name));
        $(".book-list ul").append(cl);
    }

    function _openBook(name) {
        noteService.listNotes("book-" + name);
    }

    function _removeBook(name) {

    }

    function _newBook() {
        var cl = $(".book-list li.template.book").clone().removeClass("template");
        cl.data("total", 0);
        cl.data("oname", null);
        _editBook(cl, true, true);
        $(".book-list ul").append(cl);
    }


    return {
        newBook: _newBook,
        addBook: _addBook,
        toggleBook:_toggleBooks
    };
}(fs, noteService));
