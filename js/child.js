/**
 * Created by jeon on 2015. 6. 9..
 */
$(document).ready(function() {
    "use strict";

    if (!jwt || !child) {
        alert('로그인 정보가 없습니다. 다시 로그인해 주세요.');
        $(location).attr('href', './login.html');
    }

    $('#addKids').submit(addKids);

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

    $('#upload'+fk_kids).click(function() {
        $( ":file").click();
        $(":file").change(function(e) {

            doing = 1;

            var data = new FormData();
            $.each($('#inputFile')[0].files, function(i, file) {
                data.append('file-' + i, file);
            });
            data.append('fk_kids', fk_kids);

            $.ajax({
                type: 'POST',
                url: './upload.php',
                headers: {"Authorization": jwt},
                contentType: 'multipart/form-data',
                processData: false,
                data: data,
                success: function (result) {
                    alert('사진 업로드 성공');
                    $(location).attr('href', './child.html');
                },
                error: function (result, status, err) {
                    alert('사진 업로드에 실패하였습니다.');
                },
                complete: function () {
                    doing = 0;
                }
            });
        });
    });

    $('#delete'+fk_kids).click(function() {
        if(confirm(findChild(fk_kids)+'아이의 저금통 등록을 해제하시겠습니까?\n아이의 저금통은 언제든지 다시 등록할 수 있습니다.')) {
            // Do someting
            alert('등록 해제되었습니다.');
        }
    });
}

function addKids() {
    var pn = "";
    var inputPN = $('.inputPN');
    for (var i = 0; i < 4; i++) {
        pn += inputPN[i].value;
    }

    $.ajax({

        url: domain + '/api/user/parents/child',
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