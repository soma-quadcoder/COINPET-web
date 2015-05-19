/**
* Created by jeon on 2015. 4. 18..
*/

var jwt;
var params;
var child;
var kids_selector;
var mainPage = $("#page-wrapper");
var domain = "";
var pageLoader;

function action_addKids() {
    var pn = "";
    var inputPN = $('.inputPN');
    for (var i = 0; i < 4; i++) {
        pn += inputPN[i].value;
    }

    $.ajax({       // Login

        url: domain + '/api/user/parents/child',
        type: 'POST',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", jwt);
        },
        data: {'pn': pn},
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        success: function (addedChild) {
            alert('등록되었습니다.');
            child.push(addedChild);
            $('.inputPN').val('');
            $("#kids").append(kids_selector.replace("name", addedChild.name));
            $("#page-wrapper").load("./spa/dashboard.html");
            $('.addKids').hide('slow');
        },
        error: function () {
            alert('pn이 올바르지 않습니다.');
        }

    });
    return false;
}

function action_signin() {
    var email = $("#inputEmail").val();
    var passwd = $("#inputPassword").val();

    params = {'email': email, 'passwd': passwd};

    $.ajax({
        url: domain + '/api/user/parents/login',
        data: params,
        type: 'POST',
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        success: success_signin
    });

    return false;
}

function success_signin(result) {
    $(".logout").removeClass("logout");
    $(".side-nav").animate({width: 'toggle'}, 500);
    $(".top-nav").animate({height: 'toggle'}, 500);

    if (result) {
        jwt = "Bearer " + result.Authorization;

        if ($("#inputRemember")[0].checked)
            $.cookie('jwt', jwt, {'expires': 15});
        else
            $.cookie('jwt', jwt);
    }

    getChild();
}

function getChild() {
    $.ajax({       // Login
        url: domain + '/api/user/parents/child',
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", jwt);
        },
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        success: function (result) {
            child = result;

            if (child.length) {
                pageLoader.dashboard();
            }
            else {
                $(".side-bar li").hide();
                $("#page-wrapper").load("./spa/no_child.html");
            }
        }
    });
}

function reposition() {
    $('.popup').css("height", $(window).height());
    $('.addKids_panel').css("margin-top", ( $(window).height() - $('.addKids_panel').height() ) / 2);

    $('.loading_panel').css("margin-top", ( $(window).height() - $('.loading_round').height() ) / 2);
}


$(document).ready(function () {
    $(window).resize(reposition);

    $("body").click(function () {
        $('.dropdown').children('ul').hide('down slow');
        $('.addKids').hide('slow');
    });

    $("#logout").click(function () {
        $.removeCookie('jwt');
        location.reload();
    });

    $(".collapser").click(function () {
        $(this).nextAll('.collapse').collapse('toggle');
    });

    $(".dropdown").click(function (e) {
        e.stopPropagation(); // body에 click event발생을 금지시킴

        $(this).siblings('li').children('ul').hide('down slow');
        $(this).children("ul").toggle('down slow').css("display", "table");
    });

    $("#sidebarmenu").click(function () {
        $("#sidebar").slideToggle('slow');
    });

    $("#sidebar").children('ul').children('li').click(function () {
        $(this).siblings('li').removeClass('active');
        $(this).addClass('active');
        //
        //
        //switch ($(this).index()) {
        //    case 0: // 전체 요약 선택
        //        mainPage.load("./spa/dashboard.html");
        //        break;
        //    case 1: // 저축 선택
        //        mainPage.load("./spa/dashboard.html");
        //        break;
        //    case 2: // 용돈 기입장 선택
        //        mainPage.load("./spa/dashboard.html");
        //        break;
        //    case 3: // 퀘스트 선택
        //        mainPage.load("./spa/dashboard.html");
        //        break;
        //    case 4: // 펫 선택
        //        mainPage.load("./spa/dashboard.html");
        //        break;
        //}
    });

});