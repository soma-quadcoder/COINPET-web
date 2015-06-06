/**
 * Created by jeon on 2015. 5. 23..
 */

var tables;
var std_quests;

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

$(document).ready( function() {

    "use strict";

    if(!jwt || !child)
    {
        alert('로그인 정보가 없습니다. 다시 로그인해 주세요.');
        $(location).attr('href','./index.html');
    }

    $.ajax({
        type: 'GET',
        url: './html component/quest/section.html',
        dataType: 'html',
        success: function (html) {
            tables = {};
            $.ajax({
                type: 'GET',
                url: domain+'/api/getQuestInfo/0',
                headers: {"Authorization": jwt},
                success: function (result) {
                    tables = {};
                    std_quests = result.stdQuest;

                    $.each(child, function(index, value)
                    {
                        var fk_kids = value.fk_kids;
                        tables[fk_kids] = {};
                        calculateQuest(fk_kids, result[fk_kids], html);
                        makeTable(fk_kids, tables[fk_kids], result[fk_kids]);
                    });
                },
                error: function (result, statu, err) {
                    alert("자녀의 퀘스트 정보를 받아오는데 실패하였습니다.\n" + err);
                }
            });
        },
        error: function (result, statu, err) {
            alert("dashboard_quest.html 불러오기 실패\n" + err);
        }
    });

});

function calculateQuest(fk_kids, quest_data, html)
{
    if( quest_data == null) {
        alert(fk_kids + '의 진행중인 퀘스트가 없습니다.');
        return;
    }

    var quest_finish = 0;
    var quest_type_json = {};
    var quest_type_array = [];
    quest_type_json.study = {};
    quest_type_json.exercise = {};
    quest_type_json.etc = {};

    quest_type_json.study.count = 0;
    quest_type_json.exercise.count = 0;
    quest_type_json.etc.count = 0;

    quest_type_json.study.finish = 0;
    quest_type_json.exercise.finish = 0;
    quest_type_json.etc.finish = 0;

    for(var index_data in quest_data)
    {
        var quest_type = quest_data[index_data].type;

        if( !quest_type)
            quest_type = "etc";

        quest_finish += (quest_data[index_data].state == "finish");
        quest_type_json[quest_type].finish += (quest_data[index_data].state == "finish");
        quest_type_json[quest_type].count++;
    }

    $.each(quest_type_json ,function(key, value)
    {
        var quest_type_finish_percent = value.finish / value.count * 100;

        if(!quest_type_finish_percent) quest_type_finish_percent = 0;

        quest_type_array.push([key, quest_type_finish_percent]);
    });

    quest_type_array.sort(function(a,b){return b[1]-a[1]});
    quest_type_array.forEach(function(value, index, arr)
    {
        if(value[0] == "etc") {
            arr.push(["기타", value[1]]);
            arr.splice(index, 1);
            value = arr[index];
        }

        if (value[0] == "study") value[0] = "공부";
        else if (value[0] == "exercise") value[0] = "운동";
    });

    var quest_finish_percent = quest_finish / (index_data*1+1) * 100;
    $('#insert_section').append(html
        .replace(/_percent/g, quest_finish_percent)
        .replace(/_fk_kids/g, fk_kids)
        .replace(/_name/g, findChild(fk_kids)));

    var type_bar = '<li><span>_type _percent%</span><div class="skill-bar-holder"><div class="skill-capacity" style="width:_percent%"></div></div></li>';
    $.each(quest_type_array, function(index, value) {
        $('#insert_quest_type'+fk_kids).append(type_bar
            .replace('_type', value[0])
            .replace(/_percent/g, value[1]));
    });

    if(quest_finish_percent > 90)
    {
        var text = '아주 좋습니다! _name 아이의 퀘스트 성공률은 아주 높은 편입니다.<br>'
            +'우리 _name에게는 새로운 유형의 퀘스트를 주는건 어떨까요?<br>'
            +'상대적으로 수행 횟수가 낮은 퀘스트를 추천드립니다.';
        $('#insert_quest_command'+fk_kids).html(text.replace(/_name/g, findChild(fk_kids)));
    }
    else if(quest_finish_percent > 70) {
        var text = '좋습니다! _name 아이의 퀘스트 성공률은 다소 높은 편입니다.<br>'
            + '우리 _name에게는 다소 성공률이 낮았던 퀘스트를 다시 도전해 보도록 하면 어떨까요?<br>'
            + '어떤 임무든 척척 해낼 수 있는 아이가 되도록 도와주세요.';
        $('#insert_quest_command' + fk_kids).html(text.replace(/_name/g, findChild(fk_kids)));
    }
    else if(quest_finish_percent > 50) {
        var text = '무난하군요. _name 아이의 퀘스트 성공률은 평균적입니다.<br>'
            + '우리 _name 아이가 잘 할 수 있는 퀘스트는 어떤 퀘스트일까요?<br>'
            + '성공률이 높었던 유형의 퀘스트를 추천드립니다.';
        $('#insert_quest_command' + fk_kids).html(text.replace(/_name/g, findChild(fk_kids)));
    }
    else {
        var text = '_name 아이의 퀘스트 성공률이 다소 낮은 편입니다.<br>'
            + '우리 _name 아이가 잘 할 수 있는 퀘스트는 어떤 퀘스트일까요?<br>'
            + '성공률이 높었던 유형의 퀘스트를 추천드립니다.';
        $('#insert_quest_command' + fk_kids).html(text.replace(/_name/g, findChild(fk_kids)));
    }

}

function makeTable(fk_kids, table, quest_data) {
    var columds = [
        {
            "classNae": "pk",
            "visible": false,
            "searchable": false
        },
        {
            "title": "내용",
            "width": "55%"},
        {
            "title": "시작일",
            "width": "15%",
            "render": function (data, type, row) {
                if (!data)
                    return "데이터가 없습니다.";

                var token = {};
                token.value = data.split("T");
                token.time = token.value[1].split(":");
                token.time = token.time[0] + '시 ' + token.time[1] + '분';

                return token.value[0];
                //return token.value[0] + ' ' + token.time;
            }
        },
        {
            "title": "보상",
            "width": "10%",
            "render": function (data, type, row) {
                return data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
            },
        },
        {
            "title": "유형",
            "width": "10%",
            "render": function (data, type, row) {

                if (data == "study") return "공부";
                else if (data == "exercise") return "운동";
                else return "기타";
            }
        },
        {
            "title": "상태",
            "width": "10%",
            "render": function (data, type, row) {
                return data;
            }
        }
    ];

    table = $('#table' + fk_kids).DataTable({
        "initComplete": function () {
            var api = this.api();
            api.$('td').dblclick(function () {
                alert('what!?');
            });
        },

        paging: false,
        "data": [],
        "columns": columds,
        "language": {
            "url": "./html component/datatable_kr.json"
        }
    });

    for (var index in quest_data) {
        var data = quest_data[index];

        if(data.pk_quest)
        {
            // data is system quest
            data.pk_parents_quest = 0;
            data.point = std_quests[data.pk_quest].point;
            data.type = std_quests[data.pk_quest].type;
            data.content = std_quests[data.pk_quest].content;

            // error avoid
            //data.startTime = (new Date()).toString();
        }

        var rowdata = [];

        rowdata.push(data.pk_parents_quest);
        rowdata.push(data.content);
        rowdata.push(data.startTime);
        rowdata.push(data.point);
        rowdata.push(data.type);
        rowdata.push(data.state);

        table.row.add(rowdata);
    }
    table.draw();

}

