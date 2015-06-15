/**
 * Created by jeon on 2015. 6. 11..
 */

$(document).ready(function() {

    if (jwt)
    {
        $(location).attr('href','./pn.html');
    }
    else
    {
        // Do nothing
    }

    $('form').on("submit", function() {
        var name = $(".form-name").val();
        var passwd = $(".form-password").val();

        params = {'name': name, 'passwd': passwd};

        $.ajax({        // Login
            type: 'POST',
            url: domain + /*api*/'/admin',
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
            // prepent redirection to nochild.html
            $.cookie('child', new Array(1));
            $(location).attr('href','./pn.html');
        }
        else
        {
            alert('서버 응답이 없습니다.');
        }
    }

});