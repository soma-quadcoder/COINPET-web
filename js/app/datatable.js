/**
 * Created by Jeon on 2015-05-11.
 */

define(function() {
    $('#example').DataTable( {
        "scrollX": true,
        "language": {
            "emptyTable": "저장된 데이터가 없습니다.",
            "info": "검색된 데이터 : _TOTAL_개 ( _START_번 부터 _END_까지 )",
            "infoEmpty": "전체 0개 데이터",
            "infoFiltered": "(전체 _MAX_개 데이터)",
            "infoPostFix": "",
            "thousands": ",",
            "lengthMenu": "한번에 _MENU_ 개씩 보기",
            "loadingRecords": "불러오는 중...",
            "processing": "처리 중...",
            "search": "검색:",
            "zeroRecords": "일치하는 데이터가 없습니다.",
            "paginate": {
                "first": "처음",
                "last": "마지막",
                "next": "다음",
                "previous": "이전"
            },
            "aria": {
                "sortAscending": ": activate to sort column ascending",
                "sortDescending": ": activate to sort column descending"
            }
        }
    });
});
