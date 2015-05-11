/**
 * Created by jeon on 2015. 5. 10..
 */
define(function () {

    var pageScript="";

    jwt = $.cookie('jwt');

    if (jwt == null) {
        $("#page-wrapper").load("./spa/signin.html");
    }
    else {
        success_signin(null);
    }

    $.ajax({        // addKids 불러오기
        type: 'GET',
        url: './spa/loading.html',
        dataType: 'html',
        success: function (html) {
            $('body').last().prepend(html);
            reposition();
            $('.loading').hide();
        },
        error: function (result, status, err) {
            alert("loading.html 불러오기 실패\n" + err);
        }
    });

    return {
        load: function(pageName) {
            $('.loading').show();
            $('#page-wrapper').load('./spa/' + pageName + '.html');
            require.undef(pageScript);
            require([pageName], function() {
                setTimeout("$('.loading').hide()", 1000);
            });
            pageScript = pageName;

            //$('.loading').hide();
        },
        dashboard: function() {
            this.load('dashboard');
        },
        datatable: function() {
            this.load('datatable');
        }
    };
});
