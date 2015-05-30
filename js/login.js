/**
 * Created by jeon on 2015. 5. 22..
 */

$(document).ready(function() {

    if (jwt)
    {
        $(location).attr('href','./dashboard.html');
    }
    else
    {
        // Do nothing
    }

    $('form').on("submit", function() {
        var email = $(".form-email").val();
        var passwd = $(".form-password").val();

        params = {'email': email, 'passwd': passwd};

        $.ajax({        // Login
            url: domain + '/api/user/parents/login',
            data: params,
            type: 'POST',
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            success: success_login,
            error: function() { alert('로그인에 실패했습니다.\n 이메일 주소와 비밀번호를 확인하세요.'); }
        });

        return false;
    });

    function success_login(result) {

        if (result) {
            jwt = "Bearer " + result.Authorization;

            $.cookie('jwt', jwt);
        }
        getChild();
    }

    function getChild() {
        $.ajax({       // Get children info.
            url: domain + '/api/user/parents/child',
            type: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", jwt);
            },
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            success: function (result) {

                child = result;
                $.cookie('child', JSON.stringify(child));

                if (child.length) {
                    // 등록된 자녀가 있음.
                    $(location).attr('href','./dashboard.html');
                }
                else {
                    // 등록된 자녀가 없음.
                    alert('등록된 자녀가 없습니다.');
                }
            }
        });
    }
});