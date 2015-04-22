/**
 * Created by jeon on 2015. 4. 18..
 */

var jwt;
var params;
var child;
var kids_selector;
var selected_fk_kdis;
var mainPage = $("#page-wrapper").children(".container-fluid");
//var domain='http://172.16.101.197';
var domain="";

function action_addKids() {
    var pn="";
    var inputPN = $('.inputPN');
    for(var i=0 ; i<4 ; i++) {
        pn += inputPN[i].value;
    }

    $.ajax({       // Login

        url: domain+'/api/user/parents/child',
        type: 'POST',
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", jwt);
        },
        data: {'pn' : pn },
        contentType : "application/x-www-form-urlencoded; charset=UTF-8",
        success: function(addedChild) {
            alert('등록되었습니다.');
            child.push(addedChild);
            $('.inputPN').val('');
            $("#kids").append(kids_selector.replace("name", addedChild.name));
            mainPage.load("./spa/dashboard.html");
            $('.addKids').hide('slow');
        },
        error: function() {
            alert('pn이 올바르지 않습니다.');
        }

    });
    return false;
}

function action_signin() {

    //$.ajax({
    //    url: '/script.cgi',
    //    type: 'DELETE',
    //    success: function(result) {
    //        // Do something with the result
    //    }
    //});

    var email = $("#inputEmail").val();
    var passwd = $("#inputPassword").val();

    params = {'email':email, 'passwd':passwd };

    $.ajax({
        url: domain+'/api/user/parents/login',
        data: params,
        type: 'POST',
        contentType : "application/x-www-form-urlencoded; charset=UTF-8",
        success: function(result) {
            $(".logout").removeClass("logout");
            $(".side-nav").animate({width: 'toggle'}, 500);
            $(".top-nav").animate({height: 'toggle'}, 500);

            jwt = "Bearer "+result.Authorization;
            alert("jwt "+jwt);
            getChild();
        }
    });

    return false;
}


function getChild () {
    $.ajax({       // Login
        url: domain+'/api/user/parents/child',
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", jwt);
        },
        contentType : "application/x-www-form-urlencoded; charset=UTF-8",
        success: function(result) {
            child = result;

            $.ajax({        // kids_selector 불러오기
                type: 'GET',
                url: './spa/kids_selector.html',
                dataType: 'html',
                success: function(html) {
                    kids_selector = html;
                    if(child.length)
                    {
                        $("#page-wrapper").children(".container-fluid").load("./spa/dashboard.html");

                        selected_fk_kdis = child[0].fk_kids;
                        for(var i=0 ; i<child.length ; i++)
                        {
                            $('#kids').append(kids_selector.replace("name", child[i].name));
                            //$(".message-footer").prepend(kids_selector.replace("name", child[i].name));
                        }

                    }
                    else {
                        $(".side-bar li").hide();
                        $("#page-wrapper").children(".container-fluid").load("./spa/no_child.html");
                    }

                }
            });

        }
    });
}

function repositionAddKids() {
    $('.addKids').css("height", $(window).height());
    $('.addKids_panel').css("margin-top", ( $(window).height() - $('.addKids_panel').height() )/2 );
}


$(document).ready(function() {

    $.ajax({        // addKids 불러오기
        type: 'GET',
        url: './spa/addKids.html',
        dataType: 'html',
        success: function(html) {
            $('body').last().prepend(html);
            repositionAddKids();
            $('.addKids').hide();

            $('.addKids_panel').click( function (e) {
                e.stopPropagation();
            });
        },
        error: function(result, status, err) {
            alert("addKids.html 불러오기 실패\n"+err);
        }
    });

    $(window).resize (repositionAddKids);

    $("body").click(function () {
        $('.dropdown').children('ul').hide('down slow');
        $('.addKids').hide('slow');
    });

    $(".dropdown").click(function (e) {
        e.stopPropagation(); // body에 click event발생을 금지시킴

        $(this).siblings('li').children('ul').hide('down slow');
        $(this).children("ul").toggle('down slow').css("display", "table");
    });

    $("#sidebarmenu").click(function () {
        $("#sidebar").slideToggle('slow');
    });

    $("#addKids").click(function () {
        $('.addKids').show('down').css("display", "block");
    });


    $("#sidebar").children('ul').children('li').click(function () {
        $(this).siblings('li').removeClass('active');
        $(this).addClass('active');


        switch( $(this).index() ) {
            case 0: // 전체 요약 선택
                mainPage.load("../spa/dashboard.html");
                break;
            case 1: // 저축 선택
                mainPage.load("../spa/dashboard.html");
                break;
            case 2: // 용돈 기입장 선택
                mainPage.load("../spa/dashboard.html");
                break;
            case 3: // 퀘스트 선택
                mainPage.load("../spa/dashboard.html");
                break;
            case 4: // 펫 선택
                mainPage.load("../spa/dashboard.html");
                break;
        }
    });

});
