/**
 * Created by jeon on 2015. 6. 11..
 */

var table;
var user;
var charts;
var ctxs;

var options = {
    //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
    scaleBeginAtZero : true,

    //Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines : true,

    //String - Colour of the grid lines
    scaleGridLineColor : "rgba(0,0,0,.05)",

    //Number - Width of the grid lines
    scaleGridLineWidth : 1,

    //Boolean - Whether to show horizontal lines (except X axis)
    scaleShowHorizontalLines: true,

    //Boolean - Whether to show vertical lines (except Y axis)
    scaleShowVerticalLines: true,

    //Boolean - If there is a stroke on each bar
    barShowStroke : true,

    //Number - Pixel width of the bar stroke
    barStrokeWidth : 2,

    //Number - Spacing between each of the X value sets
    barValueSpacing : 5,

    //Number - Spacing between data sets within X values
    barDatasetSpacing : 1,

    //String - A legend template
    legendTemplate : "<div><ul class=\"<%=name.toLowerCase()%>-legend\"><div>자녀선택</div><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><input type=\"checkbox\" checked><%=datasets[i].label%><%}%></li><%}%></ul></div>",

    labelPeople : true
};

$(document).ready( function() {

    "use strict";

    if (!jwt || !child) {
        alert('잘못된 접근입니다. 다시 로그인해 주세요.');
        $.removeCookie('jwt');
        $.removeCookie('child');
        $(location).attr('href', '../index.html');
    }

    $(window).resize(fitToContainer);

    $.ajax({
        type: 'GET',
        // url is get pn gen log
        url: domain+'/admin/user',
        headers: {"Authorization": jwt},
        success: function (result) {
            user = result;
            fitToContainer();
            pushData();
        },
        error: function (result, status, err) {

        }
    });

    makeTable();

    charts = {};
    ctxs = {};
    ctxs.kids = $("#chartKids").get(0).getContext("2d");
    ctxs.parents = $("#chartParents").get(0).getContext("2d");

});

function fitToContainer() {
    console.log('resize is called');
    var canvasClass = $('canvas');

    canvasClass.each(function () {
        var canvas = this;
        // Make it visually fill the positioned parent
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        // ...then set the internal size to match
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    });

    drawChart('kids');
    drawChart('parents');
}

function drawChart(target) {
    var labels;
    var dataset;
    var dataset_acc;
    var data = {
        datasets: [
            {
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: [65, 59, 80, 81, 56, 55, 40]
            },
            {
                label: "누적 가입자 수(아이)",
                fillColor: "rgba(151,187,205,0.2)",
                strokeColor: "rgba(151,187,205,1)",
                pointColor: "rgba(151,187,205,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(151,187,205,1)",
                data: [28, 48, 40, 19, 86, 27, 90]
            }
        ]
    };

    if(target == "kids")
    {
        data.datasets[0].label = "가입자 수 - 아이";
        data.datasets[1].label = "누적 가입자 수 - 아이";
    }
    else if(target == "parents")
    {
        data.datasets[0].label = "가입자 수 - 부모";
        data.datasets[1].label = "누적 가입자 수 - 부모";
    }

    delete user['cur_week'];
    labels = [];
    dataset = [];
    dataset_acc = [];

    var acc_user = 0;
    for(var week in user)
    {
        if(!user[week][target])
            continue;
        acc_user += user[week][target]

        labels.push(week);
        dataset.push(user[week][target]);
        dataset_acc.push(acc_user);
    }
    data.datasets[0].data = dataset;
    data.datasets[1].data = dataset_acc;

    console.log('create chart data is done. target:'+target);
    if(charts[target])
        charts[target].destroy();

    data.labels = labels;
    charts[target] = new Chart(ctxs[target]).Line(data, options);
}

function makeTable() {
    var column = {};

    column = [
        {
            "title": "주차",
            "render": function (data, type, row) {
                return data;
            }
        },
        {
            "title": "가입자 수(아이)",
            "render": function (data, type, row) {
                if(data)
                    return data+'명';
                else
                    return '0명';
            }
        },
        {
            "title": "가입자 수(부모)",
            "render": function (data, type, row) {
                if(data)
                    return data+'명';
                else
                    return '0명';
            }
        }
    ];

    table = $('#table_user').DataTable({
        "initComplete" : function() {
            console.log('table_user init callback');
        },
        "drawCallback": function () {
            var api = this.api();
            console.log('table_user draw callback');
        },

        autoWidth: false,
        paging: true,
        "data": [],
        "columns": column,
        "language": {
            "url": "../html component/datatable_kr.json"
        }
    });

}

function updateTable()
{
    $.ajax({
        type: 'GET',
        // url is get pn gen log
        url: domain+'/admin/user',
        headers: {"Authorization": jwt},
        success: function (result) {
            user = result;
            table.clear();

            pushData();
        },
        error: function (result, status, err) {
            alert('서버로부터 데이터를 갱신하는데 실패하였습니다.');
        }
    });
}

function pushData() {
    var row;
    var cur_week = user['cur_week'];

    delete user['cur_week'];

    for(var week in user)
    {
        row = [];
        row.push(week);
        row.push(user[week].kids?user[week].kids:0);
        row.push(user[week].parents?user[week].parents:0);
        table.row.add(row);
    }

    table.draw(true);
}