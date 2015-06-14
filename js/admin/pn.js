/**
 * Created by jeon on 2015. 6. 11..
 */

var tables = {};
var pns;
var rows = [];
var popup = 1;

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
                if(!popup)
                {
                    alert('팝업이 차단되어있습니다. 차단을 해제하세요.');
                    return;
                }

                $.ajax({
                    type: 'POST',
                    url: domain + '/api/pnGenerator/',
                    headers: {"Authorization": jwt},
                    data: {
                        count: count
                    },
                    success: function (result) {
                        alert('제품 번호가 생산되었습니다. 펌웨어에 구워주세요.');
                        var cur_date = new Date(result.createTime);
                        for(var i in result.product_num)
                        {
                            result.product_num[i] = [i*1+1, result.product_num[i], cur_date, 'N', 'N'];
                        }
                        var time = new Date();
                        time = time.yyyymmdd() +' '+ time.hhmmss();
                        exportData(result.product_num, time);
                        //DownloadJSON2CSV(result.product_num);
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

function exportData(objArray, time)
{
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if(line != '') line += ',';

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    var fileName = "제품 번호_" + time;
    //this will remove the blank-spaces from the title and replace it with an underscore

    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + '순번, 제품 번호, 생성 시간, 등록 여부, 유저 등록 여부' + escape('\r\n'+str);

    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension

    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");
    link.href = uri;

    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";

    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

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
            "title": "등록 개수 (비율)",
            "render": function (data, type, row) {
                var percent = data / row[1] * 100;
                percent = Math.round(percent*100)/100 + '%';
                return data.toUnit() + '개 <span class="label label-info">' + percent +'</span>';
            }
        },
        {
            "title": "사용 개수 (비율)",
            "render": function (data, type, row) {
                var percent = data / row[1] * 100;
                percent = Math.round(percent*100)/100 + '%';
                return data.toUnit() + '개 <span class="label label-primary">' + percent +'</span>';
            }
        },
        {
            "title": "기능",
            "render": function (data, type, row) {
                data = '<a class="download" href="#;"><span class="nowrap"><img src="../images/dot.gif" title="다운로드" alt="다운로드"class="icon ic_b_save"> 다운로드</span></a>';
                data += '<a class="write" href="#;"><span class="nowrap"><img src="../images/dot.gif" title="등록 처리" alt="등록 처리"class="icon ic_b_tblops"> 등록 처리</span></a>'
                data += '<a class="drop" href="#;"><span class="nowrap"><img src="../images/dot.gif" title="미등록 삭제" alt="미등록 삭제"class="icon ic_b_drop"> 미등록 삭제</span></a>';
                return data;
            }
        }
    ];

    columds.all = [
        {
            "title": "생산 시간",
            "render": function (data, type, row) {
                return data;
            }
        },
        {
            "title": "제품 번호",
            "render": function (data, type, row) {
                data = data.insertAt(12, ' ');
                data = data.insertAt(8, ' ');
                data = data.insertAt(4, ' ');
                return data;
            }
        },
        {
            "title": "사용자",
            "render": function (data, type, row) {
                if(data == 'write')
                    return '<span class="label label-warning">판매중</span> <a href="#;"><span class="nowrap"><img src="../images/dot.gif" title="사용자 지정" alt="사용자 지정"class="icon ic_b_usrcheck"> 사용자 지정</span></a>';
                else if (data)
                    return '<span class="label label-primary">'+data+'번</span> <a href="#;"><span class="nowrap"><img src="../images/dot.gif" title="사용자 변경" alt="사용자 변경"class="icon ic_b_usrlist"> 사용자 변경</span></a>';
                else
                    return '<span class="label label-default">미등록</span> <a href="#;"><span class="nowrap"><img src="../images/dot.gif" title="사용자 지정" alt="사용자 지정"class="icon ic_b_usrcheck"> 사용자 지정</span></a>';

            }
        },
        {
            "title": "사용 날짜",
            "render": function (data, type, row) {
                if(row[2] == 'write')
                {
                    return '<span class="label label-warning">판매중</span> <a href="#;"><span class="nowrap"><img src="../images/dot.gif" title="삭제" alt="삭제"class="icon ic_b_drop"> 삭제</span></a>';;
                }
                else if(data)
                {
                    var date = new Date(data);
                    date = date.yyyymmdd() + ' ' + date.hhmmss();
                    return date;

                }
                else
                    return '<span class="label label-default">미등록</span> <a href="#;"><span class="nowrap"><img src="../images/dot.gif" title="등록 처리" alt="등록 처리"class="icon ic_b_tblops"> 등록 처리</span></a> <a href="#;"><span class="nowrap"><img src="../images/dot.gif" title="삭제" alt="삭제"class="icon ic_b_drop"> 삭제</span></a>';;
            }
        }
    ];

    tables['log'] = $('#table_log').DataTable({
        "initComplete" : function() {
            $('#table_log_length').append('<form style="display:inline-block"><input style="margin-left:10px; margin-right:4px" type="radio" name="method" value="day" checked>날짜별 보기<input style="margin-left:10px;margin-right:4px" type="radio" name="method" value="once">시간별 보기</form><br>');
            $('#table_log_length input').change(function() {
                tables['log'].clear();
                pushData(this.value);
            });
        },
        "drawCallback": function () {
            var api = this.api();
            console.log('table_log draw callback');

            api.$('td a').off();

            api.$('td a').click(function(e) {
                e.stopPropagation();
                var index = $('#table_log tr').index($(this).parent().parent()) - 1;
                var selected = tables['log'].column( 0 ).data()[index];
                selected = new Date(selected);
                var target = {};
                target.date = selected.yyyymmdd();

                if($('#table_log_length input:checked').val() == 'once')
                   target.time = selected.hhmmss();

                if($(this).className == 'download')
                    makeData(target);
                else if($(this).className == 'write')
                {

                }
                else if($(this).className == 'drop')
                {

                }
            });

            api.$('td a.write').click(function(e) {
                e.stopPropagation();
                var index = $('#table_log tr').index($(this).parent().parent()) - 1;
                var selected_time = tables['log'].column( 0 ).data()[index];
                console.log('write '+selected_time);
            });

            api.$('td a.drop').click(function(e) {
                e.stopPropagation();
                var index = $('#table_log tr').index($(this).parent().parent()) - 1;
                var selected_time = tables['log'].column( 0 ).data()[index];
                console.log('drop '+selected_time);
            });

        },

        autoWidth: false,
        paging: true,
        "data": [],
        "columns": columds['log'],
        "language": {
            "url": "../html component/datatable_kr.json"
        }
    });

    tables['all'] = $('#table_all').DataTable({
        "autoWidth": false,
        "initComplete": function () {
            var api = this.api();
            api.$('tr').click(function (e) {
                alert('what!?');
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

function makeData(target) {

    var result = [];
    var count = 1;

    for(var index_time in pns[target.date])
    {
        var temp = target.date;
        if(target.time && target.time != index_time)
            continue;

        for(var i in pns[target.date][index_time])
        {
            var pn = pns[target.date][index_time][i];
            result.push([count, pn.product_num, target.date +' '+index_time, (pn.admin_write)?'Y':'N', (pn.used)?'Y':'N']);
            count++;
        }
    }

    var time = target.date;
    if(target.time)
        time += ' ' + target.time;

    exportData(result, time);
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
                row_all.push(index_date +' '+index_time);    // 생산 시간
                row_all.push(data.product_num)  // 제품 번호
                if(data.fk_kids)               // 사용자
                    row_all.push(data.fk_kids);
                else if(data.admin_write)        // 판매중
                    row_all.push('write');
                else                                                    // 미사용
                    row_all.push(null);
                row_all.push(data.usedTime);    // 사용 시간
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

    tables['log'].draw(true);
    tables['all'].draw(true);
}