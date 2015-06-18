/**
 * Created by jeon on 2015. 5. 23..
 */

var saving;
var chartctx={};
var chart={};
var tables;
var current_goals;

var color = [{
    fillColor: "rgba(220,220,220,0.5)",
    strokeColor: "rgba(220,220,220,0.8)",
    highlightFill: "rgba(220,220,220,0.75)",
    highlightStroke: "rgba(220,220,220,1)"
}, {
    fillColor: "rgba(151,187,205,0.5)",
    strokeColor: "rgba(151,187,205,0.8)",
    highlightFill: "rgba(151,187,205,0.75)",
    highlightStroke: "rgba(151,187,205,1)"
}];

var options =
{
    //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
    scaleBeginAtZero : true,

    //Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines : true,

    //String - Colour of the grid lines
    scaleGridLineColor : "rgba(000.05)",

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

    labelMoney : true
};

function goal_drawChart(fk_kids) {

    console.log('goal_drawChart('+fk_kids+')');

    var labels;
    var dataset_line;
    var dataset_bar;
    var dayMoney = 0;

    var data = {
        labels: ['a'],
        datasets: [{
            type: "line",
            label: "목표 금액",
            pointColor: "rgba(220,220,220,1)",
            fillColor: "rgba(151,187,205,0)",
            strokeColor: "rgba(255,0,0,0.8)",
            data: [1000]
        }, {
            type: "bar",
            label: "현재 저금 금액",
            fillColor: "rgba(220,220,220,0.5)",
            strokeColor: "rgba(220,220,220,0.8)",
            pointHighlightFill: "rgba(220,220,220,0.75)",
            pointHightStroke: "rgba(220,220,220,1)",
            data: [500]
        }]
    };

    var goal = current_goals[fk_kids];

    dataset_line = new Array();
    dataset_bar = new Array();
    labels = new Array();

    var temp = goal.date.split('T');
    goal.date = temp[0] + ' ' + temp[1];

    var startDate = new Date(goal.date);
    var startTime = startDate.hhmmss();
    var goalDate = new Date(goal.goal_date);


    var sort_saving = [];
    $.each(saving, function(key,value){
        sort_saving.push( { key: key } );
    });
    sort_saving.sort(function(a,b){
        var temp_a = a.key.split('-');
        temp_a = temp_a[0] + temp_a[1] + temp_a[2];
        temp_a = parseInt(temp_a);
        var temp_b = b.key.split('-');
        temp_b = temp_b[0] + temp_b[1] + temp_b[2];
        temp_b = parseInt(temp_b);
        return temp_a - temp_b;
    });

    //for(var for_index in sort_saving)
    //{
    //    var key = sort_saving[for_index].key;
    //
    //    for(var index in saving[key][fk_kids])
    //        dayMoney += saving[key][fk_kids][index].now_cost;
    //    dayDataset.push(dayMoney);
    //
    //    dayLabels.push(key);
    //}


    for(var index_for in sort_saving) {
        var index_date = sort_saving[index_for].key;
        var a = new Date(index_date);
        a.setHours(23); a.setMinutes(59); a.setSeconds(59);

        if(a < startDate || a > goalDate)
            continue;

        if( !saving[index_date][fk_kids])
            continue;

        for(var index_saving in saving[index_date][fk_kids])
        {
            var data_saving = saving[index_date][fk_kids][index_saving];

            if(a.yyyymmdd() == startDate.yyyymmdd() && data_saving.time < startTime)
                continue;

            dayMoney += data_saving.now_cost;
            if(dayMoney > current_goals[fk_kids].goal_cost)
                dayMoney = current_goals[fk_kids].goal_cost;
        }

        dataset_bar.push(dayMoney);
        dataset_line.push(goal.goal_cost);
        labels.push(index_date);
    }

    data.labels = labels;
    data.datasets[0].data = dataset_line;
    data.datasets[1].data = dataset_bar;

    $('#content'+fk_kids).html(goal.content+'<br> ');
    $('#now'+fk_kids).html(dayMoney.toUnit(true)+'<br>('+startDate.yyyymmdd()+' 부터)');
    $('#goal'+fk_kids).html('<b style="color:#ff0000">'+goal.goal_cost.toUnit(true)+'</b><br>('+goalDate.yyyymmdd()+' 까지)');

    if(chart[fk_kids])
        chart[fk_kids].destroy();

    // Get context with jQuery - using jQuery's .get() method.
    chartctx[fk_kids] = $('#chart'+fk_kids).get(0).getContext("2d");

    if(dataset_bar.length == 0)
    {
        chartctx[fk_kids].font='20px Arial';
        chartctx[fk_kids].textBaseline = 'middle';
        chartctx[fk_kids].fillText('현재 목표에 대한 저금 내역이 없습니다.',20,200);
    }
    else
        chart[fk_kids] = new Chart(chartctx[fk_kids]).LineBar(data, options);
}

function fitToContainer(fk_kids) {

    var canvasClass = $('canvas');

    canvasClass.each(function(){
        var canvas = this;

        // Make it visually fill the positioned parent
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        // ...then set the internal size to match
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    });

    if( fk_kids.type == "resize" )
        $.each(child, function() {
            goal_drawChart(this.fk_kids);
        });
    else
        goal_drawChart(fk_kids);
}

$(document).ready( function() {

    "use strict";

    if(!jwt || !child)
    {
        alert('로그인 정보가 없습니다. 다시 로그인해 주세요.');
        $(location).attr('href','./index.html');
    }

    $.ajax({
        type: 'GET',
        url: './html component/goal/section.html',
        dataType: 'html',
        success: function (html) {
            $.ajax({
                type: 'GET',
                url: domain + /*api*/'/saving/',
                headers: {"Authorization": jwt},
                success: function (result) {

                    if (result.length == 0) {
                        alert('저금 데이터가 없습니다.');
                        return;
                    }

                    saving = result;
                    tables = {};
                    current_goals = {};

                    $.each(child, function(index, value) {
                        var fk_kids = value.fk_kids;
                        $('#insert_section').append(html
                            .replace(/_fk_kids/g, fk_kids)
                            .replace(/_name/g, this.name));

                        tables[fk_kids] = {};
                        sumCurrent(fk_kids);
                        makeTable(fk_kids, tables[index]);
                    });

                    $(window).resize(fitToContainer);
                },
                error: function (result, statu, err) {
                    alert(findChild(fk_kids)+'의 저금 정보를 받아오는데 실패하였습니다.\n'+err);
                }
            });
        },
        error: function (result, statu, err) {
            alert("goal_section.html 불러오기 실패\n" + err);
        }
    });
});

function sumCurrent(fk_kids) {

    $.ajax({
        type: 'GET',
        url: domain + /*api*/'/goal/current/'+fk_kids,
        headers: {"Authorization": jwt},
        success: function (result) {

            if(result)
                current_goals[fk_kids] = result;

            fitToContainer(fk_kids);
        },
        error: function (result, statu, err) {
            alert(findChild(fk_kids) + '의 현재 저금 정보를 받아오는데 실패하였습니다.\n' + err);
        }
    });
}

function makeTable(fk_kids, table)
{
    var columds = [
        {"title" : "목표 내용"},
        {"title" : "시작 시간",
            "render": function (data, type, row) {
                var token = {};
                token.value = data.split("T");
                token.time = token.value[1].split(":");
                token.time = token.time[0] + '시 ' + token.time[1] + '분';

                //return token.value[0];
                return token.value[0] + '<br>' + token.time;
            }
        },
        {"title" : "종료일\n(자정 기준)",
            "render": function (data, type, row) {
                if ( !data )
                    return "데이터가 없습니다.";

                var token = {};
                token.value = data.split("T");
                token.time = token.value[1].split(":");
                token.time = token.time[0] + '시 ' + token.time[1] + '분';

                return token.value[0];

                //var token = {};
                //token.value = data.split("T");
                //token.time = token.value[1].split(":");
                //token.time = token.time[0] + '시 ' + token.time[1] + '분';
                //
                //return token.value[0];
                //return token.value[0] + ' ' + token.time;
            }
        },
        {
            "title": "목표 금액",
            "render": function (data, type, row) {
                return data.toUnit(true);
            },
        },
        {"title" : "현재 저금액",
            "render": function ( data, type, row ) {
                return data.toUnit(true);
            }
        },
        {
            "title" : "상태",
            "render" : function (data, type, row) {
                if(data == 'fail')
                    return '<span class="label label-danger">실패</span>';
                else if(data == 'doing')
                    return '<span class="label label-info">진행중</span>';
                else if(data == 'success')
                    return '<span class="label label-success">성공</span>';
                else
                    return '';
            }
        }
    ];

    table = $('#table'+fk_kids).DataTable({
        "initComplete": function () {
            var api = this.api();
            api.$('td').dblclick( function () {

            } );
        },

        "order": [[ 1, 'asc' ]],
        paging: false,
        "data": [],
        "columns": columds,
        "language": {
            "url" : "./html component/datatable_kr.json"
        }
    });

    $.ajax({
        type: 'GET',
        url: domain + /*api*/'/goal/'+fk_kids,
        headers: {"Authorization": jwt},
        success: function (result) {

            if (result.length == 0) {
                console.log(findChild(fk_kids)+'의 전체 목표 데이터가 없습니다.');
                return;
            }

            for(var index in result)
            {
                var data = result[index];
                var rowdata = [];

                rowdata.push(data.content);
                rowdata.push(data.date);
                rowdata.push(data.goal_date);
                rowdata.push(data.goal_cost);
                rowdata.push(data.now_cost);
                rowdata.push(data.state);

                table.row.add(rowdata);
            }
            table.draw();
        },
        error: function (result, statu, err) {
            alert(findChild(fk_kids) + '의 전체 목표 정보를 받아오는데 실패하였습니다.\n'+err);
        }
    });
}