
var allTags = [];

$(function() {
    noteService.listNotes();
});

function formatDoc(sCmd, sValue) {
    oDoc = document.getElementById("textBox");
    document.execCommand(sCmd, true, sValue); oDoc.focus();
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

