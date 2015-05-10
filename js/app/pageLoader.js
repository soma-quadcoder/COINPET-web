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

    return {
        dashboard: function() {
            $('#page-wrapper').load('./spa/dashboard.html');
            require.undef(pageScript);
            require(['dashboard']);
            pageScript = 'dashboard';
        },
        datatable: function() {
            $('#page-warrper').load('./spa/datatable.html');
            require.undef(pageScript);
            require(['datatable']);
            pageScript = 'datatable';
        }
    };
});
