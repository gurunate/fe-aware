window.onload = function () {

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log(xhr.responseText);

            var data = JSON.parse(xhr.responseText);

            var chart = new CanvasJS.Chart("doughnutChart",
                {
                    title: {
                        text: data.title,
                        verticalAlign: 'top',
                        horizontalAlign: 'left'
                    },
                    theme: "theme3",
                    animationEnabled: true,
                    data: [
                        {
                            type: "doughnut",
                            startAngle: 60,
                            indexLabelFontColor: "dimgrey",
                            indexLabelLineColor: "darkgrey",
                            toolTipContent: "{legendText}: {duration} - <strong>#percent% </strong>",
                            dataPoints: data.dataPoints
                        }
                    ]
                });
            chart.render();
        }
    };

    xhr.open('GET', 'http://localhost:9200/entry-report/56ccddc4c47a582406734bbd', true);
    xhr.send();
}