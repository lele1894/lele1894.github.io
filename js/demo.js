/// <reference path="jquery-1.10.2.min.js" />


var minSize = 5;
var maxSize = 50;
var newOn = 80;
var flake = $("<div></div>").css({ "position": "absolute", "top": "-50px" }).html("❅");
$(function () {
    

    var documentHeight = $(document).height();
    var documentWidth = $(document).width();
    setInterval(function () {
        var startPositionLeft = Math.random() * documentWidth;
        var sizeFlake = minSize + Math.random() * maxSize;
        var endPositionLeft = Math.random() * documentWidth;
        var durationFall = documentHeight * 10 + Math.random() * 3000;
        var startOpacity = 0.7 + 0.3 * Math.random();
        var endOpacity = 0.5 * Math.random();
        flake.clone().appendTo($("body")).css({
            "left": startPositionLeft,
            "opacity": startOpacity,
            "font-size": sizeFlake,
            "color": "#fff"
        }).animate({
            "top": documentHeight - 40,
            "left": endPositionLeft,
            "opacity": endOpacity
        }, durationFall, function () {
            $(this).remove();
        });
    }, newOn);
});