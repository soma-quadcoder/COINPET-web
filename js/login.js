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
            type: 'POST',
            url: domain + '/api/user/parents/login',
            data: params,
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
            type: 'GET',
            url: domain + '/api/user/parents/child',
            headers:{"Authorization": jwt},
            success: function (result) {

                child = result;
                $.cookie('child', JSON.stringify(child));

                if (child.length)
                    // 등록된 자녀가 있음.
                    $(location).attr('href','./dashboard.html');
                else
                    // 등록된 자녀가 없음.
                    $(location).attr('href','./nochild.html');
            }
        });
    }
});