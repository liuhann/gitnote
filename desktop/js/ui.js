/**
 * Created by liuhan on 2015/8/17.
 */

$(function() {

    $("#search-text").focusin(function() {
        $(".search-wrap").addClass("in");
    }).focusout(function() {
        $(".search-wrap").removeClass("in");
    });

});