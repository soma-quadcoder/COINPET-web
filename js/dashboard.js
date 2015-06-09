/**
 * Created by jeon on 2015. 5. 23..
 */

var quest_selected = {};
var quest_rec;
var state = ['', 'doing', 'waiting', 'retry', 'finish'];

var saving;
var chartctx={};
var chart={};
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
            label: "현재 저축 금액",
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

    var startDate = new Date(goal.date);
    var startTime = startDate.hhmmss();
    var goalDate = new Date(goal.goal_date);

    for(var index_date in saving) {
        var a = new Date(index_date);
        a.setHours(23); a.setMinutes(59); a.setSeconds(59);

        if(a < startDate || goalDate < a)
            continue;

        if( !saving[index_date][fk_kids])
            continue;

        for(var index_saving in saving[index_date][fk_kids])
        {
            var data_saving = saving[index_date][fk_kids][index_saving];

            if(a.yyyymmdd() == startDate.yyyymmdd() && data_saving.time < startTime)
                continue;

            dayMoney += data_saving.now_cost;
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
    $('#goal'+fk_kids).html(goal.goal_cost.toUnit(true)+'<br>('+goalDate.yyyymmdd()+' 까지)');

    if(chart[fk_kids])
        chart[fk_kids].destroy();

    // Get context with jQuery - using jQuery's .get() method.
    chartctx[fk_kids] = $('#chart'+fk_kids).get(0).getContext("2d");

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

function submitQuest() {

    var type = $('#type').val();
    var content = $('#content').val();
    var startTime = $('#startTime').val();
    var point = 100;

    if( !type )
    {
        alert('퀘스트 유형을 선택해 주세요.');
        return false;
    }

    if(quest_selected) {
        $.ajax({
            type: 'POST',
            url: domain + '/api/quest/parents/' + quest_selected,
            headers : {"Authorization": jwt},
            data: {
                type: type,
                content: content,
                startTime: startTime,
                point: point,
                state: 'doing'
            },
            success: function (result) {
                alert('퀘스트가 만들어졌습니다.');
                $(location).attr('href','./quest.html');

            },
            error: function (result, status, err) {
                alert('퀘스트를 만드는데 실패하였습니다.\n' + err);
            }
        });
    }
}

$(document).ready(function() {

    "use strict";

    if(!jwt || !child)
    {
        alert('로그인 정보가 없습니다. 다시 로그인해 주세요.');
        $(location).attr('href','./login.html');
    }

    $.ajax({
        type: 'GET',
        url: './html component/dashboard/week.html',
        dataType: 'html',
        success: function (html) {

            for(var i=0 ; i<child.length ; i++)
            {
                calculateWeek(child[i].fk_kids, html);
            }
        },
        error: function (result, status, err) {
            alert("dashboard_kids.html 불러오기 실패\n" + err);
        }
    });

    $.ajax({
        type: 'GET',
        url: './html component/dashboard/quest.html',
        dataType: 'html',
        success: function (html) {

            $.ajax({
                type: 'GET',
                url: domain+'/api/getQuestInfo/0',
                headers: {"Authorization": jwt},
                success: function (result) {

                    quest_rec = {};
                    $.each(child, function(index, value)
                    {
                        calculateQuest(value.fk_kids, result[value.fk_kids], html);

                        $('.panel_close').click(function() {
                            $('body').click();
                        });

                    });
                },
                error: function (result, status, err) {
                    alert("자녀의 퀘스트 정보를 받아오는데 실패하였습니다.\n" + err);
                }
            });
        },
        error: function (result, status, err) {
            alert("dashboard_quest.html 불러오기 실패\n" + err);
        }
    });

    $.ajax({
        type: 'GET',
        url: './html component/quest/add.html',
        dataType: 'html',
        success: function (html){
            $('body').append(html
                .replace('_min', (new Date().yyyymmdd())));
            $('body').click(function() {

                quest_selected = 0;
                $('.quest_rec_dis').show();
                $('.quest_rec_en').hide ();
                $('.popup').hide();
            });
            $('.panel_add').click(function (e){
                e.stopPropagation();
            });
            $(window).resize(function() {
                $('.popup').css("height", $(window).height());
                $('.panel_add').css("margin-top", ( $(window).height() - $('.panel_add').height() ) / 2);
            });

            var temp = '<div class="col-xs-6 col-sm-6"><div class="kidsimg"><img class="kidsimg kidsimgo" src="./images/kids/_fk_kids.jpg">_name</div></div>';

            for(var i in child)
                $('#quest_kidsSelect').append(temp
                    .replace('_name', child[i].name)
                    .replace('_fk_kids', child[i].fk_kids));

        },
        error: function (result, status, err) {
            alert("quest_add.html 불러오기 실패");
        }
    });

    $.ajax({
        type: 'GET',
        url: './html component/dashboard/goal.html',
        dataType: 'html',
        success: function (html) {
            $.ajax({
                type: 'GET',
                url: domain + '/api/saving/',
                headers: {"Authorization": jwt},
                success: function (result) {

                    if (result.length == 0) {
                        alert('저축 데이터가 없습니다.');
                        return;
                    }

                    saving = result;
                    current_goals = {};

                    $.each(child, function(index, value) {
                        var fk_kids = value.fk_kids;
                        $('#insertGoal').append(html
                            .replace(/_fk_kids/g, fk_kids)
                            .replace(/_name/g, this.name));

                        sumCurrent(fk_kids);
                    });

                    $(window).resize(fitToContainer);
                },
                error: function (result, statu, err) {
                    alert(findChild(fk_kids)+'의 저축 정보를 받아오는데 실패하였습니다.\n'+err);
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
        url: domain + '/api/goal/current/'+fk_kids,
        headers: {"Authorization": jwt},
        success: function (result) {

            if(result)
                current_goals[fk_kids] = result;

            fitToContainer(fk_kids);
        },
        error: function (result, statu, err) {
            alert(findChild(fk_kids) + '의 현재 저축 정보를 받아오는데 실패하였습니다.\n' + err);
        }
    });
}

function calculateQuest(fk_kids, quest_data, html)
{
    if( quest_data == null) {
        alert(fk_kids + '의 진행중인 퀘스트가 없습니다.');
        return;
    }

    var quest_finish = 0;
    var quest_type_json = {};
    var quest_type_array = [];
    //quest_type_json.study = {};
    //quest_type_json.exercise = {};
    //quest_type_json.etc = {};
    //
    //quest_type_json.study.count = 0;
    //quest_type_json.exercise.count = 0;
    //quest_type_json.etc.count = 0;
    //
    //quest_type_json.study.finish = 0;
    //quest_type_json.exercise.finish = 0;
    //quest_type_json.etc.finish = 0;

    for(var index_data in quest_data)
    {
        var quest_type = quest_data[index_data].type;

        if( !quest_type)
            quest_type = "etc";

        quest_finish += (state[quest_data[index_data].state] == "finish");
        if( !quest_type_json[quest_type] )
        {
            quest_type_json[quest_type] = {};
            quest_type_json[quest_type].count = 0;
            quest_type_json[quest_type].finish = 0;
        }
        quest_type_json[quest_type].finish += (state[quest_data[index_data].state] == "finish");
        quest_type_json[quest_type].count++;
    }

    $.each(quest_type_json ,function(key, value)
    {
        var quest_type_finish_percent = value.finish / value.count * 100;

        if(!quest_type_finish_percent) quest_type_finish_percent = 0;

        quest_type_array.push([key, quest_type_finish_percent, value.count]);
    });

    quest_type_array.sort(function(a,b){return b[1]-a[1]});
    for(var index in quest_type_array)
    {
        if(quest_type_array[index][0] == "etc") {
            quest_type_array.push(["etc", quest_type_array[0][1]]);
            quest_type_array.splice(index, 1);
            break;
        }
    }

    var quest_finish_percent = quest_finish / (index_data*1+1) * 100;
    $('#insertQuest').prepend(html
        .replace(/_percent/g, Math.round(quest_finish_percent*100)/100)
        .replace(/_fk_kids/g, fk_kids)
        .replace(/_name/g, findChild(fk_kids)));

    var type_bar = '<li><span>_type _percent%</span><div class="skill-bar-holder"><div class="skill-capacity" style="width:_percent%"></div></div></li>';
    $.each(quest_type_array, function(index, value) {
        var label;
        if (value[0] == "study")
            label = '<span class="label label-primary">공부</span>';
        else if (value[0] == "exercise")
            label = '<span class="label label-success">운동</span>';
        else if (value[0] == "saving")
            label = '<span class="label label-info">저축</span>';
        else if (value[0] == "help")
            label = '<span class="label label-warning">도움</span>';
        else
            label = '<span class="label label-default">기타</span>';

        $('#insert_quest_type' + fk_kids).append(type_bar
            .replace('_type', label)
            .replace(/_percent/g, Math.round(value[1] * 100) / 100));
    });

    if(quest_finish_percent > 90)
    {
        var text = '아주 좋습니다! _name 아이의 퀘스트 성공률은 아주 높은 편입니다.<br>'
            +'우리 _name에게는 새로운 유형의 퀘스트를 주는건 어떨까요?<br>'
            +'상대적으로 수행 횟수가 낮은 퀘스트를 추천드립니다.';

        quest_type_array.splice(-1, 1);
        quest_type_array.sort(function(a,b){return a[2]-b[2]});
        quest_rec[fk_kids] = quest_type_array[0][0];

    }
    else if(quest_finish_percent > 70) {
        var text = '좋습니다! _name 아이의 퀘스트 성공률은 다소 높은 편입니다.<br>'
            + '우리 _name에게는 다소 성공률이 낮았던 퀘스트를 다시 도전해 보도록 하면 어떨까요?<br>'
            + '어떤 임무든 척척 해낼 수 있는 아이가 되도록 도와주세요.';

        quest_type_array.splice(-1, 1);
        quest_type_array.sort(function(a,b){return a[1]-b[1]});
        quest_rec[fk_kids] = quest_type_array[0][0];
    }
    else if(quest_finish_percent > 50) {
        var text = '무난하군요. _name 아이의 퀘스트 성공률은 평균적입니다.<br>'
            + '우리 _name 아이가 잘 할 수 있는 퀘스트는 어떤 퀘스트일까요?<br>'
            + '성공률이 높었던 유형의 퀘스트를 추천드립니다.';
        quest_rec[fk_kids] = quest_type_array[0][0];
    }
    else {
        var text = '_name 아이의 퀘스트 성공률이 다소 낮은 편입니다.<br>'
            + '우리 _name 아이가 잘 할 수 있는 퀘스트는 어떤 퀘스트일까요?<br>'
            + '성공률이 높었던 유형의 퀘스트를 추천드립니다.';
        quest_rec[fk_kids] = quest_type_array[0][0];
    }

    $('#insert_quest_command'+fk_kids).html(text.replace(/_name/g, findChild(fk_kids)));

    $('#addQuest'+fk_kids).click(function(e) {
        e.stopPropagation();
        quest_selected = fk_kids;

        for(var i in quest_data)
        {
            // set dataset of input tag as quest_rec
            if(quest_data[i].type == quest_rec[fk_kids] && state[quest_data[i].state] == 'finish')
            {
                //if(quest_data[i].pk_parents_quest)
                //    quest_rec[fk_kids].pk_parents_quest = quest_data[i].pk_parents_quest;
                //else if(quest_data[i].fk_std_que)
                //    quest_rec[fk_kids].fk_std_que = quest_data[i].fk_std_que;

                $('#type').val(quest_rec[fk_kids]);
                $('#content').val(quest_data[i].content);
                $('#startTime').val((new Date()).yyyymmdd());
                break;
            }
        }

        $('.quest_rec_dis').hide();
        $('.quest_rec_en').show();
        $('.addQuest').show();
        $('.popup').css("height", $(window).height());
        $('.panel_add').css("margin-top", ( $(window).height() - $('.panel_add').height() ) / 2);
    });

}

function calculateWeek(fk_kids, html){

    $.ajax({
        type: 'GET',
        url: domain + '/api/saving/' + fk_kids,
        headers : {"Authorization": jwt},
        success: function (result) {
            var start = new Date();
            start.setDate(start.getDate() - 7);
            var i = result.length;
            var money = 0;
            var savingday = new Array(7);

            while (i) {
                i--;
                var date = new Date(result[i].date);
                if (date < start)
                    break;
                money += result[i].now_cost;
                savingday[date.getDay()] = true;
            }
            var savingCount = 0;

            for (var i = 0; i < 7; i++)
                if (savingday[i] === true) savingCount++;

            if(savingCount)
                money = parseInt(money / savingCount);
            $('#insertWeek').prepend(html
                .replace('_name', findChild(fk_kids))
                .replace('_fk_kids', fk_kids)
                .replace('_money', money.toUnit())
                .replace('_count', savingCount)
                .replace('_stateClass', 'success')
                .replace('_state', '아주 좋음'));
        },
        error: function () {
            alert('자녀의 저축 정보를 받아오는데 실패하였습니다.');
        }
    });
}

