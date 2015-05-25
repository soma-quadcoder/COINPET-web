/**
 * Created by jeon on 2015. 5. 23..
 */
$(document).ready( function() {

    Date.prototype.yyyymmdd = function() {
        var yyyy = this.getFullYear().toString();
        var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
        var dd  = this.getDate().toString();
        return yyyy +'-'+ (mm[1]?mm:"0"+mm[0]) +'-'+ (dd[1]?dd:"0"+dd[0]); // padding
    };

    // Get context with jQuery - using jQuery's .get() method.
    var weekctx = $("#weekChart").get(0).getContext("2d");
    var dayctx = $("#dayChart").get(0).getContext("2d");

    var canvasClass = $('canvas');
    canvasClass.each(function() {
        fitToContainer(this);
    });

    function fitToContainer(canvas){
        // Make it visually fill the positioned parent
        canvas.style.width ='100%';
        canvas.style.height='100%';
        // ...then set the internal size to match
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    for(var i=0 ; i<child.length ; i++) {
        $.ajax({
            type: 'GET',
            url: domain + '/api/saving/' + child[i].fk_kids,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", jwt);
            },
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            success: function (result) {

                if(result.length == 0)
                {
                    alert('저축 데이터가 없습니다.');
                    return;
                }

                var dayMoney = 0;
                var prevDate, currentDate;
                var labels = new Array();
                var dataset = new Array();
                var dataset_acc = [0];

                var startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                var labelDate_Min = new Date(startDate);
                var labelDate_Plu = new Date();

                var weekPrevLabels = new Array();
                var weekCurrentLabels = new Array();

                var weekDataset = new Array();

                for(var i=0 ; i<7 ; i++) {
                    weekPrevLabels.unshift(labelDate_Min.yyyymmdd());
                    weekCurrentLabels.unshift(labelDate_Plu.yyyymmdd());
                    labelDate_Min.setDate(labelDate_Min.getDate() - 1);
                    labelDate_Plu.setDate(labelDate_Plu.getDate() - 1);
                }

                var i = result.length;

                while (i) {
                    i--;
                    var tmpDate = new Date(result[i].date);
                    if (tmpDate < startDate)
                        break;

                    currentDate = result[i].date.split('T')[0];
                    if(currentDate == prevDate)
                    {
                        dayMoney += result[i].now_cost;
                    }
                    else {
                        weekDataset[weekDataset.length] = dayMoney;
                        dayMoney = result[i].now_cost;
                    }
                    prevDate = currentDate;
                }

                weekDataset.shift();
                weekDataset[weekDataset.length] = dayMoney;


                prevDate = null;
                dayMoney = 0;
                for(var i=0 ; i<result.length ; i++)
                {
                    currentDate = result[i].date.split('T')[0];
                    if(currentDate == prevDate)
                    {
                        dayMoney += result[i].now_cost;
                    }
                    else {
                        labels[labels.length] = currentDate;
                        dataset[dataset.length] = dayMoney;
                        dataset_acc[dataset_acc.length] = dataset_acc[dataset_acc.length -1] + dayMoney;
                        dayMoney = result[i].now_cost;
                    }
                    prevDate = currentDate;
                }

                dataset[dataset.length] = dayMoney;
                dataset_acc[dataset_acc.length] = dataset_acc[dataset_acc.length -1] + dayMoney;
                dataset.shift();
                dataset_acc.shift();
                dataset_acc.shift();

                var data = {
                    labels: labels,
                    datasets: [
                        {
                            label: "자녀의 일일 저축 금액",
                            fillColor: "rgba(220,220,220,0.2)",
                            strokeColor: "rgba(220,220,220,1)",
                            pointColor: "rgba(220,220,220,1)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: "rgba(220,220,220,1)",
                            data: dataset
                        }
                        //},
                        //{
                        //    label: "현재 자녀의 저축 목표 금",
                        //    fillColor: "rgba(151,187,205,0.2)",
                        //    strokeColor: "rgba(151,187,205,1)",
                        //    pointColor: "rgba(151,187,205,1)",
                        //    pointStrokeColor: "#fff",
                        //    pointHighlightFill: "#fff",
                        //    pointHighlightStroke: "rgba(151,187,205,1)",
                        //    data: [10000, 10000, 10000, 10000]
                        //}
                    ]
                };

                var weekData = {
                    labels: weekCurrentLabels,
                    datasets: [
                        {
                            label: "이번주 일주일간 저축내역",
                            fillColor: "rgba(220,220,220,0.2)",
                            strokeColor: "rgba(220,220,220,1)",
                            pointColor: "rgba(220,220,220,1)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: "rgba(220,220,220,1)",
                            data: weekDataset
                        }
                        //},
                        //{
                        //    label: "현재 자녀의 저축 목표 금",
                        //    fillColor: "rgba(151,187,205,0.2)",
                        //    strokeColor: "rgba(151,187,205,1)",
                        //    pointColor: "rgba(151,187,205,1)",
                        //    pointStrokeColor: "#fff",
                        //    pointHighlightFill: "#fff",
                        //    pointHighlightStroke: "rgba(151,187,205,1)",
                        //    data: [10000, 10000, 10000, 10000]
                        //}
                    ]
                };
                var options = {

                    ///Boolean - Whether grid lines are shown across the chart
                    scaleShowGridLines : true,

                    //String - Colour of the grid lines
                    scaleGridLineColor : "rgba(0,0,0,.05)",

                    //Number - Width of the grid lines
                    scaleGridLineWidth : 1,

                    //Boolean - Whether to show horizontal lines (except X axis)
                    scaleShowHorizontalLines: true,

                    //Boolean - Whether to show vertical lines (except Y axis)
                    scaleShowVerticalLines: true,

                    //Boolean - Whether the line is curved between points
                    bezierCurve : true,

                    //Number - Tension of the bezier curve between points
                    bezierCurveTension : 0.4,

                    //Boolean - Whether to show a dot for each point
                    pointDot : true,

                    //Number - Radius of each point dot in pixels
                    pointDotRadius : 4,

                    //Number - Pixel width of point dot stroke
                    pointDotStrokeWidth : 1,

                    //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
                    pointHitDetectionRadius : 20,

                    //Boolean - Whether to show a stroke for datasets
                    datasetStroke : true,

                    //Number - Pixel width of dataset stroke
                    datasetStrokeWidth : 2,

                    //Boolean - Whether to fill the dataset with a colour
                    datasetFill : true,

                    //String - A legend template
                    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){><%=datasets[i].label%><%}%></li><%}%></ul>"

                };

                var myLineChart = new Chart(dayctx).Line(data, options);
                var weekChart = new Chart(weekctx).Line(weekData, options);
            },
            error: function () {
                alert('자녀의 저축 정보를 받아오는데 실패하였습니다.');
            }
        });
    }




});