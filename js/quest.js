/**
 * Created by jeon on 2015. 5. 23..
 */

var tables;
var std_quests;
var state = ['', 'doing', 'waiting', 'retry', 'finish'];

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

var quest_selected;
var pk_quest;
var quest_rec;

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

$(document).ready( function() {

    "use strict";

    if(!jwt || !child)
    {
        alert('로그인 정보가 없습니다. 다시 로그인해 주세요.');
        $(location).attr('href','./index.html');
    }

    $('.panel_exam').click(function (e){
        e.stopPropagation();
    });

    $('#exam_retry').click(function(e) {
        e.stopPropagation();
        if(!pk_quest)
        {
            alert('오류가 발생하였습니다. 관리자에게 문의하세요. (pk_quest)');
            return;
        }

        if(confirm('아이가 퀘스트를 재도전하게 하시겠습니까?'))
        {
            $.ajax({
                type: 'PUT',
                url: domain+'/api/quest/stateUpdate',
                data: {
                    fk_parents_quest: pk_quest,
                    comment: $('#comment').val(),
                    state: 'retry'
                },
                headers: {"Authorization": jwt},
                success: function (result) {
                    $('body').click();
                    alert('퀘스트 재도전을 시작하였습니다.');
                    $(location).attr('href','./quest.html');
                },
                error: function (result, status, err) {
                    alert('재도전 요청 메시지에 실패하였습니다.');
                }
            });
        }
    });

    $('#exam_ok').click(function(e) {
        e.stopPropagation();
        if(!pk_quest)
        {
            alert('오류가 발생하였습니다. 관리자에게 문의하세요. (pk_quest)');
            return;
        }

        if(confirm('아이의 퀘스트를 완료 하시겠습니까?'))
        {
            $.ajax({
                type: 'PUT',
                url: domain+'/api/quest/stateUpdate',
                data: {
                    fk_parents_quest: pk_quest,
                    comment: $('#comment').val(),
                    state: 'finish'
                },
                headers: {"Authorization": jwt},
                success: function (result) {
                    $('body').click();
                    alert('퀘스트를 완료하였습니다.');
                    $(location).attr('href','./quest.html');
                },
                error: function (result, status, err) {
                    alert('재도전 요청 메시지에 실패하였습니다.');
                }
            });
        }
    });

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
                    quest_rec = {};

                    $.each(child, function(index, value)
                    {
                        var fk_kids = value.fk_kids;
                        tables[fk_kids] = {};
                        calculateQuest(fk_kids, result[fk_kids], html);
                        makeTable(fk_kids, tables, result[fk_kids]);

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

            var temp = '<div class="col-xs-6 col-sm-6"><div class="kidsimg"><img class="kidsimg kidsimgo" src="./image/kids/_fk_kids.jpg">_name</div></div>';

            for(var i in child)
                $('#quest_kidsSelect').append(temp
                    .replace('_name', child[i].name)
                    .replace('_fk_kids', child[i].fk_kids));

        },
        error: function (result, status, err) {
            alert("quest_add.html 불러오기 실패");
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
    $('#insert_section').append(html
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

    quest_rec[fk_kids] = {};
    if(quest_finish_percent > 90)
    {
        var text = '아주 좋습니다! _name 아이의 퀘스트 성공률은 아주 높은 편입니다.<br>'
            +'우리 _name에게는 새로운 유형의 퀘스트를 주는건 어떨까요?<br>'
            +'상대적으로 수행 횟수가 낮은 퀘스트를 추천드립니다.';

        quest_type_array.splice(-1, 1);
        quest_type_array.sort(function(a,b){return a[2]-b[2]});
        quest_rec[fk_kids].type = quest_type_array[0][0];

    }
    else if(quest_finish_percent > 70) {
        var text = '좋습니다! _name 아이의 퀘스트 성공률은 다소 높은 편입니다.<br>'
            + '우리 _name에게는 다소 성공률이 낮았던 퀘스트를 다시 도전해 보도록 하면 어떨까요?<br>'
            + '어떤 임무든 척척 해낼 수 있는 아이가 되도록 도와주세요.';

        quest_type_array.splice(-1, 1);
        quest_type_array.sort(function(a,b){return a[1]-b[1]});
        quest_rec[fk_kids].type = quest_type_array[0][0];
    }
    else if(quest_finish_percent > 50) {
        var text = '무난하군요. _name 아이의 퀘스트 성공률은 평균적입니다.<br>'
            + '우리 _name 아이가 잘 할 수 있는 퀘스트는 어떤 퀘스트일까요?<br>'
            + '성공률이 높었던 유형의 퀘스트를 추천드립니다.';
        quest_rec[fk_kids].type = quest_type_array[0][0];
    }
    else {
        var text = '_name 아이의 퀘스트 성공률이 다소 낮은 편입니다.<br>'
            + '우리 _name 아이가 잘 할 수 있는 퀘스트는 어떤 퀘스트일까요?<br>'
            + '성공률이 높었던 유형의 퀘스트를 추천드립니다.';
        quest_rec[fk_kids].type  = quest_type_array[0][0];
    }

    // make quest_rec data
    for(var i in quest_data) {
        if (quest_data[i].type == quest_rec[fk_kids].type && state[quest_data[i].state] == 'finish') {
            if (quest_data[i].pk_parents_quest)
                quest_rec[fk_kids].pk_parents_quest = quest_data[i].pk_parents_quest;
            else if (quest_data[i].fk_std_que)
                quest_rec[fk_kids].fk_std_que = quest_data[i].fk_std_que;
            break;
        }
    }
    $('#insert_quest_command'+fk_kids).html(text.replace(/_name/g, findChild(fk_kids)));

    $('#addQuest' + fk_kids).click(function (e) {
        e.stopPropagation();
        quest_selected = fk_kids;

        for(var i in quest_data)
        {

            // set dataset of input tag as quest_rec
            if(quest_data[i].type == quest_rec[fk_kids].type && state[quest_data[i].state] == 'finish')
            {
                //if(quest_data[i].pk_parents_quest)
                //    quest_rec[fk_kids].pk_parents_quest = quest_data[i].pk_parents_quest;
                //else if(quest_data[i].fk_std_que)
                //    quest_rec[fk_kids].fk_std_que = quest_data[i].fk_std_que;

                $('#type').val(quest_rec[fk_kids].type);
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

function makeTable(fk_kids, tables, quest_data) {
    var columds = [
        {
            "classNae": "pk",
            "searchable": false,
            "visible": false
        },
        {
            "title": "유형",
            "render": function (data, type, row) {

                //Bootstrap label example
                //<span class="label label-default">Default</span>
                //<span class="label label-primary">Primary</span>
                //<span class="label label-success">Success</span>
                //<span class="label label-info">Info</span>
                //<span class="label label-warning">Warning</span>
                //<span class="label label-danger">Danger</span>

                if (data == "study") return '<span class="label label-primary">공부</span>';
                else if (data == "exercise") return '<span class="label label-success">운동</span>';
                else if (data == "saving") return '<span class="label label-info">저금</span>';
                else if (data == "help") return '<span class="label label-warning">도움</span>';
                else return '<span class="label label-default">기타</span>';
            }
        },
        {
            "title": "내용",
            "render": function (data, type, row) {

                if(row[0])
                {
                    data = "<img src='./images/mom_quest.png'>"+data;
                }

                if(quest_rec[fk_kids].pk_parents_quest == row[0])
                    data = data + ' <span class="badge">추천</span>';

                return data;
            }
        },
        {
            "title": "시작일",
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
            "render": function (data, type, row) {
                return "모아 에너지 5";
                return data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
            },
        },
        {
            "title": "상태",
            "render": function (data, type, row) {
                if(data == "doing")
                    return "진행중"
                if(data == "finish")
                    return "종료";


                var state = ["",
                    "<button>진행중</button>",    // doing
                    "<button>검사 기다리는중</button>",        // waiting
                    "<button>다시 진행중</button>",     // retry
                    "종료",
                    "에러"// finish
                ];

                return state[data];
            }
        }
    ];

    tables[fk_kids] = $('#table' + fk_kids).DataTable({
        "initComplete": function () {
            $('#table'+fk_kids).after("<button id='quest_add"+fk_kids+"' class='btn btn-primary btn-block btn-filled quest_add'>퀘스트 만들기</button>");
            $('#quest_add'+fk_kids).click(function(e) {
                e.stopPropagation();
                quest_selected = fk_kids;
                $('#type').val('');
                $('#content').val('');
                $('#startTime').val('');

                $('.quest_rec_dis').hide();
                $('.quest_rec_en').show();
                $('.addQuest').show();
                $('.popup').css("height", $(window).height());
                $('.panel_add').css("margin-top", ( $(window).height() - $('.panel_add').height() ) / 2);
            });

            var api = this.api();
            api.$('td button').click(function (e) {
                e.stopPropagation();
                var index = $('#table'+fk_kids+' tr').index($(this).parent().parent()) -1;
                pk_quest = tables[fk_kids].column( 0 ).data()[index];

                $('#quest_context').html(tables[fk_kids].column(2).data()[index]);
                $('#quest_exam_kids').html(findChild(fk_kids)+'의 퀘스트 검사하기');
                $('.exam').show();

                $('.popup').css("height", $(window).height());
                $('.panel_exam').css("margin-top", ( $(window).height() - $('.panel_exam').height() ) / 2);
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
        rowdata.push(data.type);
        rowdata.push(data.content);
        rowdata.push(data.startTime);
        rowdata.push(data.point);
        rowdata.push(data.state);

        tables[fk_kids].row.add(rowdata);
    }
    tables[fk_kids].draw();

}
