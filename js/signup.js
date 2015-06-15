/**
 * Created by jeon on 2015. 6. 9..
 */
var reloadIndex = function (){
    $(location).attr('href','./dashboard.html');
}

var doing = 0;

$(document).ready(function() {
    $('#submitSignup').submit(function() {
        if(doing)
        {
            alert('회원가입을 요청중입니다. 잠시만 기다려 주세요.');
            return false;
        }

        if($('.form-password').val() != $('.form-password-check').val()) {
            alert('비밀번호를 똑같이 입력해주세요.');
            return false;
        }

        doing = 1;
        $.ajax({
            type: 'POST',
            url: domain+/*api*/'/user/parents',
            data: {
                email: $('.form-email').val(),
                passwd: $('.form-password').val()
            },
            success: function (result) {
                alert('회원가입이 완료되었습니다!');

                jwt = "Bearer " + result.Authorization;
                $.cookie('jwt', jwt);
                $(location).attr('href', './nochild.html');
            },
            error: function(result, status, err)
            {
                if(result.responseJSON.error == "Duplicated email")
                {
                    alert('이미 존재하는 이메일 주소입니다.');
                }
                else if(result.responseJSON.error == "Invaild_value")
                {
                    alert('올바른 값이 아닙니다.');
                }
                else
                {
                    alert('에러가 발생했습니다. '+status);
                }
            },
            complete: function () {
                doing = 0;
            }
        });

        return false;
    });
});