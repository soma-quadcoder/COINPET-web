/**
 * Created by jeon on 2015. 6. 11..
 */

var tables;

$(document).ready( function() {

    "use strict";

    if (!jwt || !child) {
        alert('잘못된 접근입니다. 다시 로그인해 주세요.');
        $.removeCookie('jwt');
        $.removeCookie('child');
        $(location).attr('href', '../index.html');
    }

    //$.ajax({
    //    type: 'POST',
    //    url: domain+'/api/pnGenerator/',
    //    headers: {"Authorization": jwt},
    //    data: {
    //        count: count
    //    },
    //    success: function (result) {
    //
    //    },
    //    error: function (result, status, err) {
    //
    //    }
    //});

    makeTable(tables);

    $.ajax({
        type: 'GET',
        // url is get pn gen log
        url: domain+'/api/pnGenerator/',
        headers: {"Authorization": jwt},
        success: function (result) {

        },
        error: function (result, status, err) {

        }
    });

});

function makeTable(table) {
    var columds = [
        {
            "classNae": "pk",
            "searchable": false,
            "visible": false
        },
        {
            "title": "생산 시간",
            "render": function (data, type, row) {
                return data;
            }
        },
        {
            "title": "생산 갯수",
            "render": function (data, type, row) {
                return data.toUnit();
            }
        },
        {
            "title": "사용 비율",
            "render": function (data, type, row) {
                return data + '%';
            }
        }
    ];

    table = $('#table_log').dataTable({
        "initComplete": function () {
            var api = this.api();
            api.$('tr').click(function (e) {

            });
        },

        paging: true,
        "data": [],
        "columns": columds,
        "language": {
            "url": "../html component/datatable_kr.json"
        }
    });

    //for (var index in quest_data) {
    //    var rowdata = [];
    //
    //    rowdata.push(something data);
    //
    //    table.row.add(rowdata);
    //}
    //table.draw();

}
