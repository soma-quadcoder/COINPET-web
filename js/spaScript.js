/**
 * Created by jeon on 2015. 4. 18..
 */
$(document).ready(function() {

    $(".dropdown").click(function () {
        $(this).children("ul").toggle('down slow').css("display", "table");;
    });

    $("#sidebarmenu").click(function () {
        $("#sidebar").slideToggle('slow');
    });

    $("#sidebar").children('ul').children('li').click(function () {
        $(this).siblings('li').removeClass('active');
        $(this).addClass('active');


        var pageContainer = $("#page-wrapper").children(".container-fluid");
        switch( $(this).index() ) {
            case 0: // 전체 요약 선택
                pageContainer.load("../spa/dashboard.html");
                alert("0");
                break;
            case 1: // 저축 선택
                pageContainer.load("../spa/dashboard.html");
                break;
            case 2: // 용돈 기입장 선택
                pageCntainer.load("../spa/dashboard.html");
                break;
            case 3: // 퀘스트 선택
                pageContainer.load("../spa/dashboard.html");
                break;
            case 4: // 펫 선택
                pageContainer.load("../spa/dashboard.html");
                break;
        }
    });

});