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

var color = [{
    fillColor: "rgba(220,220,220,0.5)",
    strokeColor: "rgba(220,220,220,0.8)",
    highlightFill: "rgba(220,220,220,0.75)",
    highlightStroke: "rgba(220,220,220,1)"
},{
    fillColor: "rgba(151,187,205,0.5)",
    strokeColor: "rgba(151,187,205,0.8)",
    highlightFill: "rgba(151,187,205,0.75)",
    highlightStroke: "rgba(151,187,205,1)"
}];

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
    legendTemplate : "<div><ul class=\"<%=name.toLowerCase()%>-legend\"><div>자녀선택</div><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><input type=\"checkbox\" checked><%=datasets[i].label%><%}%></li><%}%></ul></div>"

};

function week_drawChart() {
    var weekLabelDate;
    var weekLabels;
    var weekDataset;
    var week = ['일','월','화','수','목','금','토'];
    var weekData = {
        datasets: [
            {
                label: "My First dataset",
                fk_kids: 0
            }
        ]
    };

    for (var fk_kids in week_selectedChild) {
        if(week_selectedChild[fk_kids].selected == false || fk_kids == "length") continue;

        weekLabelDate = new Date();
        weekDataset = new Array();
        weekLabels = new Array();

        for (var i = 0; i < 7; i++) {
            var index_date = weekLabelDate.yyyymmdd();

            dayMoney = 0;
            if (saving[index_date]) {
                for (var index in saving[index_date][fk_kids])
                    dayMoney += saving[index_date][fk_kids][index].now_cost;
            }
            weekDataset.unshift(dayMoney);

            weekLabels.unshift(index_date);
            weekData.labels = weekLabels;
            weekLabelDate.setDate(weekLabelDate.getDate() - 1);
        }

        weekData.datasets[weekData.datasets.length] = JSON.parse(JSON.stringify(weekData.datasets[0]));
        weekData.datasets[weekData.datasets.length - 1].data = weekDataset;
        weekData.datasets[weekData.datasets.length - 1].label = findChild(fk_kids);
        for(var key in week_selectedChild[fk_kids].color)
        {
            weekData.datasets[weekData.datasets.length - 1][key] = week_selectedChild[fk_kids].color[key];
        }
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
                fk_kids: 0
            }
        ]
    };

    for(var fk_kids in day_selectedChild)
    {
        if(day_selectedChild[fk_kids].selected == false || fk_kids == "length") continue;

        dayDataset = new Array();
        dayLabels = new Array();

        dayMoney = 0;
        for(var index_date in saving)
        {
            for(var index in saving[index_date][fk_kids])
                dayMoney += saving[index_date][fk_kids][index].now_cost;
            dayDataset.push(dayMoney);

            dayLabels.push(index_date);
        }

        dayData.labels = dayLabels;
        dayData.datasets[dayData.datasets.length] = JSON.parse(JSON.stringify(dayData.datasets[0]));
        dayData.datasets[dayData.datasets.length -1].data = dayDataset;
        dayData.datasets[dayData.datasets.length -1].label = findChild(fk_kids);

        for(var key in day_selectedChild[fk_kids].color)
        {
            dayData.datasets[dayData.datasets.length - 1][key] = day_selectedChild[fk_kids].color[key];
        }
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
    day_selectedChild.length = 0;

    child.forEach( function(value, index) {
        var _selector = "<div style='text-align: center'><input type='checkbox' name='_fk_kids' checked>_name <span style='width:1em;height:1em;display:inline-block;  background-color: #fff}'><span><span style='width:1em;height:1em;display:block;  background-color: _color; border-style: solid; border-color: _bcolor;}'><span></div>";
        $('#week_select').append(_selector
            .replace('_name', value.name)
            .replace('_fk_kids', value.fk_kids)
            .replace('_color', color[index].fillColor)
            .replace('_bcolor', color[index].strokeColor));
        $('#day_select').append(_selector
            .replace('_name', value.name)
            .replace('_fk_kids', value.fk_kids)
            .replace('_color', color[index].fillColor)
            .replace('_bcolor', color[index].strokeColor));
        week_selectedChild[value.fk_kids] = {};
        week_selectedChild[value.fk_kids].selected = true;
        week_selectedChild[value.fk_kids].color = color[index];
        day_selectedChild[value.fk_kids] = {};
        day_selectedChild[value.fk_kids].selected = true;
        day_selectedChild[value.fk_kids].color = color[index];

        week_selectedChild.length++;
        day_selectedChild.length++;
    });


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

            fitToContainer();
            $(window).resize(fitToContainer);
        },
        error: function (result, statu, err) {
            alert('자녀의 저금 정보를 받아오는데 실패하였습니다.\n'+err);
        }
    });

    $('#day_select div input').change(function(e) {
        if(this.checked)
        {
            day_selectedChild[this.name].selected = true;
            day_selectedChild.length++;
        }
        else
        {
            day_selectedChild[this.name].selected = false;
            day_selectedChild.length--;

            if(day_selectedChild.length == 0)
            {
                $(this).prop( "checked", true );
                day_selectedChild[this.name].selected = true;
                day_selectedChild.length++;
            }
        }
        fitToContainer('day');
    });

    $('#week_select div input').change(function(e) {
        if(this.checked)
        {
            week_selectedChild[this.name].selected = true;
            week_selectedChild.length++;
        }
        else
        {
            week_selectedChild[this.name].selected = false;
            week_selectedChild.length--;

            if(week_selectedChild.length == 0)
            {
                $(this).prop( "checked", true );
                week_selectedChild[this.name].selected = true;
                week_selectedChild.length++;
            }
        }
        fitToContainer('week');
    });

});
