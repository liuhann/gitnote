/**
 * Created by liuhan on 2015/8/17.
 */

$(function() {

    $("#search-text").focusin(function() {
        $(".search-wrap").addClass("in");
    }).focusout(function() {
        $(".search-wrap").removeClass("in");
    });

    $(".note-list li").on("mouseenter", function() {
        $(this).addClass("on");
    }).on("mouseleave", function() {
        $(".note-list li.on:not(.selected)").removeClass("on");
    }).on("click", function() {
        if ($(this).hasClass("selected")) {
            return;
        }
        $(".note-list li.selected").removeClass("selected on");
        $(this).addClass("selected");
    });

    $(".note-list").on("mouseout", function() {

    });

    listNotes();
});