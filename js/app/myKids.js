/**
 * Created by Jeon on 2015-05-12.
 */
//
//alert('myKids.js is loaded');

define(function() {
    $.ajax({        // addKids 불러오기
        type: 'GET',
        url: './spa/addKids.html',
        dataType: 'html',
        success: function (html) {
            $('body').last().prepend(html);
            reposition();
            $('.addKids').hide();
            $('.addKids_panel').click(function (e) {
                e.stopPropagation();
            });
        },
        error: function (result, status, err) {
            alert("addKids.html 불러오기 실패\n" + err);
        }
    });

    $.ajax({
        type: 'GET',
        url: './spa/myKids_kids.html',
        dataType: 'html',
        success: function (html) {

            $.ajax({       // Login
                url: domain + '/api/user/parents/child/'+child[0].fk_kids,
                type: 'GET',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", jwt);
                },
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                success: function (result) {
                    if (result) {
                        var html_ = html.replace('_name', result.name)
                                    .replace('_age', result.age+"살")
                                    .replace('_number', 0+"");
                        $('#slotKids').append(html_);

                        $('#slotKids').append(html);

                        $('.kidsimgo').mouseenter(function() {
                            if(window.innerWidth >= 768)
                                $(this).prev().show();
                        });

                        $('.kidsimgc').mouseout(function() {
                            $(this).hide();
                        });

                        $('.uploadimg').click(function() {
                            $( ":file").click();
                        });

                        $('.kidsimgc').click(function() {
                            $( ":file").click();
                        });
                    }
                    else {
                        alert("("+child[0].name+")자녀 정보를 받아올 수 없습니다.")
                    }
                }
            });
        },
        error: function (result, statu, err) {
            alert("myKids_kids.html 불러오기 실패\n" + err);
        }
    });

    $("#btn_add").click(function (e) {
        e.stopPropagation();
        $('.addKids').show('down').css("display", "block");
    });


});