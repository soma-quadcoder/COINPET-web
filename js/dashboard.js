/**
 * Created by jeon on 2015. 5. 23..
 */
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
        error: function (result, statu, err) {
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
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", jwt);
                },
                success: function (result) {

                    alert('done');
                },
                error: function (result, statu, err) {
                    alert("자녀의 퀘스트 정보를 받아오는데 실패하였습니다.\n" + err);
                }
            });

            for(var i=0 ; i<child.length ; i++)
            {
                calculateQuest(child[i].fk_kids, html);
            }
        },
        error: function (result, statu, err) {
            alert("dashboard_quest.html 불러오기 실패\n" + err);
        }
    });
});

function calculateQuest(fk_kids, html)
{
    $('#insertQuest').prepend(html
        .replace(/_percent/g, '70')
        .replace('_fk_kids', fk_kids)
        .replace('_name', findChild(fk_kids)));
}

function calculateWeek(fk_kids, html){

    $.ajax({
        type: 'GET',
        url: domain + '/api/saving/' + fk_kids,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", jwt);
        },
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
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
