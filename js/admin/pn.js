/**
 * Created by jeon on 2015. 6. 11..
 */

var tables = {};
var pns;
var rows = [];

$(document).ready( function() {

    "use strict";

    if (!jwt || !child) {
        alert('잘못된 접근입니다. 다시 로그인해 주세요.');
        $.removeCookie('jwt');
        $.removeCookie('child');
        $(location).attr('href', '../index.html');
    }

    $('.pnGen').submit(function() {
        var count = $('.signup-email-field').val();
        if(count > 0) {
            if(confirm(count+'개의 제품 번호를 생산합니다.')) {
                $.ajax({
                    type: 'POST',
                    url: domain + '/api/pnGenerator/',
                    headers: {"Authorization": jwt},
                    data: {
                        count: count
                    },
                    success: function (result) {
                        alert('제품 번호가 생산되었습니다. 펌웨어에 구워주세요.');
                    },
                    error: function (result, status, err) {
                        alert('에러가 발생하였습니다.\n'+err);
                    }
                });
            }
        }
        else
            alert('개수를 정확히 입력하세요.');
        return false;
    });


    makeTable();

    $.ajax({
        type: 'GET',
        // url is get pn gen log
        url: domain+'/api/getAllPn/',
        headers: {"Authorization": jwt},
        success: function (result) {
            pns = result;
            pushData('day');
        },
        error: function (result, status, err) {

        }
    });

});

function makeTable() {
    var columds = {};
    columds.log = [
        {
            "title": "생산 날짜(시간)",
            "render": function (data, type, row) {
                return data;
            }
        },
        {
            "title": "생산 개수",
            "render": function (data, type, row) {
                return data.toUnit() + '개';
            }
        },
        {
            "title": "제작 개수 (비율)",
            "render": function (data, type, row) {
                var percent = data / row[1] * 100;
                percent = Math.round(percent*100)/100 + '%';
                return data.toUnit() + '개 <span class="label label-info">' + percent +'</span>\n<button>전체 회수하기</button>';
            }
        },
        {
            "title": "사용 개수 (비율)",
            "render": function (data, type, row) {
                var percent = data / row[1] * 100;
                percent = Math.round(percent*100)/100 + '%';
                return data.toUnit() + '개 <span class="label label-primary">' + percent +'</span>';
            }
        }
    ];

    columds.all = [
        {
            "title": "인덱스 번호",
            "render": function (data, type, row) {
                return data;
            }
        },
        {
            "title": "생산 날짜",
            "render": function (data, type, row) {
                return data;
            }
        },
        {
            "title": "생산 시간",
            "render": function (data, type, row) {
                return data;
            }
        },
        {
            "title": "사용 날짜",
            "render": function (data, type, row) {
                return data;
            }
        },
        {
            "title": "사용자",
            "render": function (data, type, row) {
                if(data == "write")
                    return '<span class="label label-primary">판매중</span>';
                else if(data == null)
                    return '<span class="label label-default">미사용</span>' + ' <button>회수하기</button>';
                else
                    return data;
            }
        }
    ];

    tables['log'] = $('#table_log').DataTable({
        "initComplete": function () {
            $('#table_log_length').append('<form style="display:inline-block"><input style="margin-left:10px" type="radio" name="method" value="day" checked>날짜별 보기<input style="margin-left:10px" type="radio" name="method" value="once">시간별 보기</form>');
            $('#table_log_length input').change(function(e) {
                tables['log'].clear();
                pushData(this.value);
            });
            var api = this.api();
            api.$('td').click(function (e) {
                alert(this);
            });
        },

        paging: true,
        "data": [],
        "columns": columds['log'],
        "language": {
            "url": "../html component/datatable_kr.json"
        }
    });

    tables['all'] = $('#table_all').DataTable({
        "initComplete": function () {
            var api = this.api();
            api.$('tr').click(function (e) {

            });
        },

        paging: true,
        "data": [],
        "columns": columds['all'],
        "language": {
            "url": "../html component/datatable_kr.json"
        }
    });
}

function pushData(method) {
    var used;
    var admin_write;
    var row;
    var row_all;
    var day = {};
    var total = {};
    total.count = 0;
    total.admin_write = 0;
    total.used = 0;

    for(var index_date in pns) {
        day.count = 0;
        day.admin_write = 0;
        day.used = 0;

        for(var index_time in pns[index_date])
        {
            admin_write = 0;
            used = 0;

            for(var i in pns[index_date][index_time])
            {
                var data = pns[index_date][index_time][i];
                admin_write += data.admin_write;
                used += data.used;

                total.admin_write += data.admin_write;
                total.used += data.used;

                row_all = [];
                row_all.push(data.pk_pn);
                row_all.push(index_date);    // 생산 날짜
                row_all.push(index_time);    // 생산 시간
                row_all.push(data.usedTime);    // 사용 시간
                if(data.fk_kids)               // 사용자
                    row_all.push(data.fk_kids);
                else if(data.admin_write)        // 판매중
                    row_all.push('write');
                else                                                    // 미사용
                    row_all.push(null);
                tables['all'].row.add(row_all);
            }

            if(method == 'once') {
                row = [];
                row.push(index_date + ' ' + index_time);            // 생산 날짜시간
                row.push(pns[index_date][index_time].length);    // 생산 개수
                row.push(admin_write);                              // 제작 개수
                row.push(used);                                     // 사용 개수

                tables['log'].row.add(row);
            }
            else if(method == 'day') {
                day.count += pns[index_date][index_time].length;
                day.admin_write += admin_write;
                day.used += used;
            }

            total.count += pns[index_date][index_time].length;
        }

        if(method == 'day') {
            row = [];
            row.push(index_date);
            row.push(day.count);
            row.push(day.admin_write);
            row.push(day.used);

            tables['log'].row.add(row);
        }
    }

    tables['log'].draw();
    tables['all'].draw();
}