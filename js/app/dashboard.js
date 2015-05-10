/**
 * Created by jeon on 2015. 4. 30..
 */

define(function () {

    var newChart;
    var chart;
    var old_html;
    var goal = {};

    newChart = function (fk_kids, name) {
        $.ajax({
            url: domain+'/api/goal/'+fk_kids,
            type: 'GET',
            contentType : "application/x-www-form-urlencoded; charset=UTF-8",
            beforeSend: function (xhr) {
                xhr.setRequestHeader ("Authorization", jwt);
            },
            success: function(result) {
                goal.content = result[0].content;
                goal.goal_cost = result[0].goal_cost.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                goal.now_cost = result[0].now_cost.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                goal.remain = (result[0].goal_cost < result[0].now_cost) ? 0 : (result[0].goal_cost - result[0].now_cost)
                    .toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

                $('#insertChart').append( old_html.replace('id="chart"', 'id="chart'+fk_kids+'"')
                    .replace('nameHead', name)
                    .replace('now_cost', goal.now_cost)
                    .replace('goal_cost', goal.goal_cost)
                    .replace('remain_cost', goal.remain ));

                chart = new Morris.Donut({
                    element: "chart" +fk_kids,
                    data: [{
                        label: "현재 저축량  ",
                        value: goal.now_cost
                    }, {
                        label: "남은 저축량  ",
                        value: goal.remain
                    }],
                    formatter: function (x) {
                        return "￦" + x.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                    },
                    resize: true
                });
            },
            error: function(request,status,error) {
                alert("오류, 목표 정보를 받아오는데 실패하였습니다.("+status+")\n"+error);;
            }

        });
    };

    $.ajax({       // Login

        url: './spa/chartpanel.html',
        type: 'GET',
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        async: true,
        success: function (html) {
            old_html = html;
            for (var i = 0; i < child.length; i++) {
                newChart(child[i].fk_kids, child[i].name);
            }
        },
        error: function () {
            alert('chartpanel불러오기 실패');
        }
    });

});

