/**
 * Created by jeon on 2015. 5. 23..
 */

var quest_selected = {};

function submitQuest() {

    var content = $('#content').val();
    var startDate = $('#startDate').val();
    var point = $('#point').val();

    if( !(content && startDate && point) )
    {
        alert('내용을 채워주세요.');
        return false;
    }


    quest_selected[145] = {};
    quest_selected[145].select = true;
    for(var fk_kids in quest_selected)
    {
        if(quest_selected[fk_kids].select) {
            $.ajax({
                type: 'POST',
                url: domain + '/api/quest/parents/' + fk_kids,
                headers : {"Authorization": jwt},
                data: {
                    content: content,
                    startDate: startDate,
                    point: point,
                    state: 'doing',
                    type: 'etc'
                },
                success: function (result) {
                    alert('done!');
                },
                error: function (result, status, err) {
                    alert('퀘스트를 만드는데 실패하였습니다.\n' + err);
                }
            });
        }
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
                    $.each(child, function(index, value)
                    {
                        calculateQuest(value.fk_kids, result[value.fk_kids], html)
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
        url: './html component/quest/add_select.html',
        dataType: 'html',
        success: function (html){
            $('body').append(html);
            $('body').click(function() {
                $('.popup').hide();
            });
            $('.panel_add').click(function (e){
                e.stopPropagation();
            });
            $(window).resize(function() {
                $('.popup').css("height", $(window).height());
                $('.panel_add').css("margin-top", ( $(window).height() - $('.panel_add').height() ) / 2);
            });

            var temp = '<div class="col-xs-6 col-sm-6"><div class="kidsimg"><img class="kidsimg kidsimgo" src="./image/kids/_fk_kids.png">_name</div></div>';

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
    $('#insertQuest').prepend(html
        .replace(/_percent/g, quest_finish_percent)
        .replace(/_fk_kids/g, fk_kids)
        .replace(/_name/g, findChild(fk_kids)));

    var type_bar = '<li><span>_type _percent%</span><div class="skill-bar-holder"><div class="skill-capacity" style="width:_percent%"></div></div></li>';
    for(var d in quest_type_array) {
        $('#insert_quest_type'+fk_kids).append(type_bar
            .replace('_type', quest_type_array[d][0])
            .replace(/_percent/g, quest_type_array[d][1]));
    }

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

    $('#addQuest'+fk_kids).click(function(e) {
        e.stopPropagation();
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
                .replace('_money', money)
                .replace('_count', savingCount)
                .replace('_stateClass', 'success')
                .replace('_state', '아주 좋음'));
        },
        error: function () {
            alert('자녀의 저축 정보를 받아오는데 실패하였습니다.');
        }
    });
}
