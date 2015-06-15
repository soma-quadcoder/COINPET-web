/**
 * Created by jeon on 2015. 6. 8..
 */

function addKids() {
    var pn = "";
    var inputPN = $('.inputPN');
    for (var i = 0; i < 4; i++) {
        pn += inputPN[i].value;
    }

    $.ajax({       // Login

        url: domain + /*api*/'/user/parents/child',
        type: 'POST',
        headers: {"Authorization": jwt},
        data: {'pn': pn},
        success: function (addedChild) {
            alert('등록되었습니다.');
            $.cookie('child', '['+JSON.stringify(addedChild)+']');
            $('.inputPN').val('');

            $(location).attr('href', './dashboard.html');
        },
        error: function () {
            alert('제품 번호가 올바르지 않습니다.');
        }
    });
    return false;
}

$(document).ready(function() {
    $('#addKids').submit(addKids);
});

