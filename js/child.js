/**
 * Created by jeon on 2015. 6. 9..
 */
$(document).ready(function() {
    "use strict";

    if (!jwt || !child) {
        alert('로그인 정보가 없습니다. 다시 로그인해 주세요.');
        $(location).attr('href', './login.html');
    }

    $.ajax({
        type: 'GET',
        url: './html component/child/image.html',
        dataType: 'html',
        success: function (html) {

            for (var i = 0; i < child.length; i++) {
                insertImage(child[i].fk_kids, html);
            }
        },
        error: function (result, status, err) {
            alert("child_image.html 불러오기 실패\n" + err);
        }
    });
});

function insertImage(fk_kids, html)
{
    $('#insert_image').prepend(html
        .replace('_name', findChild(fk_kids))
        .replace(/_fk_kids/g, fk_kids));
}