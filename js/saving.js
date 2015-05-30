/**
 * Created by jeon on 2015. 5. 23..
 */

var saving;
var week_selectedChild={};
var day_selectedChild={};
var weekctx;
var dayctx;
var weekChart;
var dayChart;

function findChild(search) {
    if( !isNaN(search) )
    {
        for(var i in child)
        {
            if (child[i].fk_kids == search)
                return child[i].name;
        }
    }
    else
    {
        for(var i in child)
        {
            if (child[i].name == search)
                return child[i].fk_kids;
        }
    }

    return 0;
}

var options =
{
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
    legendTemplate : "<div><ul class=\"<%=name.toLowerCase()%>-legend\"><div>자녀선택</div><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><input type=\"checkbox\" checked><%=datasets[i].label%><%}%></li><%}%></ul></div>"

};

function week_drawChart() {

    var weekLabelDate;
    var weekLabels;
    var weekDataset;
    var weekDataset_prev;
    var week = ['일','월','화','수','목','금','토'];
    var weekData = {
        datasets: [
            {
                label: "My First dataset",
                fk_kids: 0,
                fillColor: "rgba(220,220,220,0.5)",
                strokeColor: "rgba(220,220,220,0.8)",
                highlightFill: "rgba(220,220,220,0.75)",
                highlightStroke: "rgba(220,220,220,1)"
            }
        ]
    };

    for (var fk_kids in week_selectedChild) {
        weekLabelDate = new Date();
        weekLabelDate_prev = new Date();
        weekLabelDate_prev.setDate(weekLabelDate.getDate() - 7);
        weekDataset = new Array();
        weekDataset_prev = new Array();
        weekLabels = new Array();

        for (var i = 0; i < 7; i++) {
            var index_date = weekLabelDate.yyyymmdd();
            var index_date_prev = weekLabelDate_prev.yyyymmdd();

            dayMoney = 0;
            if (saving[index_date]) {
                for (var index in saving[index_date][fk_kids])
                    dayMoney += saving[index_date][fk_kids][index].now_cost;
            }
            weekDataset.unshift(dayMoney);

            dayMoney = 0;
            if (saving[index_date_prev]) {
                for (var index in saving[index_date_prev][fk_kids])
                    dayMoney += saving[index_date_prev][fk_kids][index].now_cost;
            }
            weekDataset_prev.unshift(dayMoney);

            weekLabels.unshift(index_date);
            weekData.labels = weekLabels;
            weekLabelDate.setDate(weekLabelDate.getDate() - 1);
            weekLabelDate_prev.setDate(weekLabelDate_prev.getDate() - 1);
        }

        weekData.datasets[weekData.datasets.length] = JSON.parse(JSON.stringify(weekData.datasets[0]));
        weekData.datasets[weekData.datasets.length - 1].data = weekDataset;
        weekData.datasets[weekData.datasets.length - 1].label = findChild(fk_kids)+'의 이번주 저축 금액';

        //weekData.datasets[weekData.datasets.length] = JSON.parse(JSON.stringify(weekData.datasets[0]));
        //weekData.datasets[weekData.datasets.length - 1].data = weekDataset_prev;
        //weekData.datasets[weekData.datasets.length - 1].label = findChild(fk_kids)+'의 저번주 저축 금액';
    }
    weekData.datasets.shift();
    console.log('create week chart data is done.');

    if (weekChart)
        weekChart.destroy();

    weekChart = new Chart(weekctx).Bar(weekData, options);

}


function day_drawChart() {
    var dayMoney;

    var dayLabels;
    var dayDataset;
    var dayData = {
        datasets: [
            {
                label: "My First dataset",
                fk_kids: 0,
                fillColor: "rgba(220,220,220,0.5)",
                strokeColor: "rgba(220,220,220,0.8)",
                highlightFill: "rgba(220,220,220,0.75)",
                highlightStroke: "rgba(220,220,220,1)"
            }
        ]
    };

    for(var fk_kids in day_selectedChild)
    {
        dayDataset = new Array();
        dayLabels = new Array();

        for(var index_date in saving)
        {
            dayMoney = 0;
            for(var index in saving[index_date][fk_kids])
                dayMoney += saving[index_date][fk_kids][index].now_cost;
            dayDataset.push(dayMoney);

            dayLabels.push(index_date);
        }

        dayData.labels = dayLabels;
        dayData.datasets[dayData.datasets.length] = JSON.parse(JSON.stringify(dayData.datasets[0]));
        dayData.datasets[dayData.datasets.length -1].data = dayDataset;
    }
    dayData.datasets.shift();
    console.log('create day chart data is done.');

    if(dayChart)
        dayChart.destroy();

    dayChart = new Chart(dayctx).Bar(dayData, options);
}

$(document).ready( function() {

    "use strict";

    if(!jwt || !child)
    {
        alert('로그인 정보가 없습니다. 다시 로그인해 주세요.');
        $(location).attr('href','./index.html');
    }

    Date.prototype.yyyymmdd = function() {
        var yyyy = this.getFullYear().toString();
        var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
        var dd  = this.getDate().toString();
        return yyyy +'-'+ (mm[1]?mm:"0"+mm[0]) +'-'+ (dd[1]?dd:"0"+dd[0]); // padding
    };

    function fitToContainer(target) {

        var canvasClass = $('canvas');
        if (target=='week')
            canvasClass = $('#weekChart');
        else if(target=='day')
            canvasClass = $('#dayChart');


        canvasClass.each(function () {
            var canvas = this;
            // Make it visually fill the positioned parent
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            // ...then set the internal size to match
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        });

        if(target=='day')
            day_drawChart();
        else if(target=='week')
            week_drawChart();
        else
        {
            week_drawChart();
            day_drawChart();
        }
    }


    // Get context with jQuery - using jQuery's .get() method.
    weekctx = $("#weekChart").get(0).getContext("2d");
    dayctx = $("#dayChart").get(0).getContext("2d");

    week_selectedChild.length = 0;
    day_selectedChild.length = 0
    ;
    for(var i=0 ; i<child.length ; i++) {
        var _selector = "<div><input type='checkbox' name='_fk_kids' checked>_name</div>";
        $('#week_select').append(_selector
            .replace('_name', child[i].name)
            .replace('_fk_kids', child[i].fk_kids));
        $('#day_select').append(_selector
            .replace('_name', child[i].name)
            .replace('_fk_kids', child[i].fk_kids));
        week_selectedChild[child[i].fk_kids] = true;
        day_selectedChild[child[i].fk_kids] = true;

        week_selectedChild.length++;
        day_selectedChild.length++;
    }


    $.ajax({
        type: 'GET',
        url: domain + '/api/saving/',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", jwt);
        },
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        success: function (result) {

            if (result.length == 0) {
                alert('저축 데이터가 없습니다.');
                return;
            }

            saving = result;

            fitToContainer();
            $(window).resize(fitToContainer);
        },
        error: function (result, statu, err) {
            alert('자녀의 저축 정보를 받아오는데 실패하였습니다.\n'+err);
        }
    });

    $('#day_select div input').change(function(e) {
        if(this.checked)
        {
            day_selectedChild[this.name] = this.checked;
            day_selectedChild.length++;
        }
        else
        {
            delete day_selectedChild[this.name];
            day_selectedChild.length--;

            if(day_selectedChild.length == 0)
            {
                $(this).prop( "checked", true );
                day_selectedChild[this.name] = this.checked;
                day_selectedChild.length++;
            }
        }
        fitToContainer('day');
    });

    $('#week_select div input').change(function(e) {
        if(this.checked)
        {
            week_selectedChild[this.name] = this.checked;
            week_selectedChild.length++;
        }
        else
        {
            delete week_selectedChild[this.name];
            week_selectedChild.length--;

            if(week_selectedChild.length == 0)
            {
                $(this).prop( "checked", true );
                week_selectedChild[this.name] = this.checked;
                week_selectedChild.length++;
            }
        }
        fitToContainer('week');
    });

});
