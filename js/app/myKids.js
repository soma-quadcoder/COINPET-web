/**
 * Created by Jeon on 2015-05-12.
 */
//
//alert('myKids.js is loaded');

define(function() {
    var windowWidth = window.innerWidth;
    alert(windowWidth);

    $('#upload').click(function() {
        $( ":file").click();
    });

    $('#kidsimgc').click(function() {
        $( ":file").click();
    });

    $('#kidsimg').mouseenter(function() {
        if(window.innerWidth >= 768)
            $('#kidsimgc').show();
    });
    $('#kidsimgc').mouseout(function() {
        $('#kidsimgc').hide();
    });
});