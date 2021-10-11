

(function inputScopeWrapper($) {

    $(function onDocReady() {

        // Grab dietDB - grab aws data upon completion
        var keyProd = 'AIzaSyDaqR3scLgh4Dw26glrQ2BfDHiMJKzDIz4'
        var keyTest = 'AIzaSyAGYgfzU5Lo2-OsFVMySI7UNzjxl_4EkQQ' ///////////////////////////////////////// Make sure right one active pre-commit

        bodyDB = $.ajax({
            method: 'GET',
            async: true, //Switch back to false if also pulling AWS data we need
            url: 'https://sheets.googleapis.com/v4/spreadsheets/140rsKlUgCMD8cOksdwXJfU6XJwSAFc4H2dpahk-JudU/values/SR!A1:G180?majorDimension=ROWS&key=' + keyProd,
            success: charts,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error pulling data: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
            }
        });

    });

    function charts() {
        console.log('data pulled')

        // Ignore rows without data
        for (i = 1; i < bodyDB.responseJSON.values.length; i++) {
            if (bodyDB.responseJSON.values[i].length == 0) {
                var dataSlice = bodyDB.responseJSON.values.slice(1, i);
                break;
            }
        }
        // dataSlice is raw

        // 'Date', 'Weight', 'Bfast', 'Lunch', 'Dinner', 'Snacks', 'Exercise'
        // Weight Graph
        var ctx1 = document.getElementById("weightChart").getContext("2d");
        const labels1 = dataSlice.map(x => x[0]);
        const data1 = {
            labels: labels1,
            datasets: [{
                label: 'Weight',
                data: dataSlice.map(x => x[1]),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };
        new Chart(ctx1, {
            type: 'line',
            data: data1,
        });

        // Exercise Graph
        for (i = 0; i < dataSlice.length; i++) {
            if (dataSlice[i][6] == 'Yes') {
                dataSlice[i][6] = 1
            } else {
                dataSlice[i][6] = 0
            }
        }

        var ctx2 = document.getElementById("exerciseChart").getContext("2d");
        const labels2 = dataSlice.map(x => x[0]);
        const data2 = {
            labels: labels2,
            datasets: [{
                label: 'Exercise',
                data: dataSlice.map(x => x[6]),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };
        new Chart(ctx2, {
            type: 'line',
            data: data2,
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            min: -0.5,
                            max: 1.5,
                            stepSize: 1,
                            // Include a dollar sign in the ticks
                            callback: function (value, index, values) {
                                var tmp = ['No', 'Yes']
                                return tmp[value];
                            }
                        }
                    }]
                }
            }
        });

        // Wtd Ave Carbs Graph
        // Calc wtd ave: none - 0, low - 1, mid - 2, high - 3
        var wtdAve = dataSlice.map(x => [x[0]])
        var mealBreakdown = []; // Tracking carbs my meal type
        var dayBreakdown = [[], [], [], [], [], [], []]; // Tracking carbs by day of week
        for (i = 0; i < dataSlice.length; i++) {
            mealBreakdown.push([])
            var sum = 0
            var count = 0
            var day = new Date(dataSlice[i][0]).getDay()
            for (j = 2; j < 6; j++) {
                if (dataSlice[i][j] == 'No') {
                    count = count + 1
                    mealBreakdown[i].push(0.01)
                    dayBreakdown[day].push(0.01)
                } else if (dataSlice[i][j] == 'Low') {
                    sum = sum + 1
                    count = count + 1
                    mealBreakdown[i].push(1)
                    dayBreakdown[day].push(1)
                } else if (dataSlice[i][j] == 'Mid') {
                    sum = sum + 2
                    count = count + 1
                    mealBreakdown[i].push(2)
                    dayBreakdown[day].push(2)
                } else if (dataSlice[i][j] == 'High') {
                    sum = sum + 3
                    count = count + 1
                    mealBreakdown[i].push(3)
                    dayBreakdown[day].push(3)
                } else {
                    mealBreakdown[i].push(0.01)
                }
            }
            wtdAve[i].push(sum / count)
        }

        var ctx3 = document.getElementById("aveChart").getContext("2d");
        const labels3 = wtdAve.map(x => x[0]);
        const data3 = {
            labels: labels3,
            datasets: [{
                label: 'Daily Carb Intake',
                data: wtdAve.map(x => x[1]),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };
        new Chart(ctx3, {
            type: 'line',
            data: data3,
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            min: 0,
                            max: 3,
                            stepSize: 1,
                            // Include a dollar sign in the ticks
                            callback: function (value, index, values) {
                                var tmp = ['None', 'Low', 'Mid', 'High']
                                return tmp[value];
                            }
                        }
                    }]
                }
            }
        });

        // Carbs by meal
        function average(array){
            if (array.length > 0){
                return array.reduce((a, b) => a + b) / array.length;
            } else {
                return 0
            }

        }
        // const average = (array) => array.reduce((a, b) => a + b) / array.length;




        var array1 = mealBreakdown.map(x => x[0])
        var average1 = average(array1)
        var array2 = mealBreakdown.map(x => x[1])
        var average2 = average(array2)
        var array3 = mealBreakdown.map(x => x[2])
        var average3 = average(array3)
        var array4 = mealBreakdown.map(x => x[3])
        var average4 = average(array4)

        var ctx5 = document.getElementById("mealBChart").getContext("2d");
        const labels5 = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
        const data5 = {
            labels: labels5,
            datasets: [
                {
                    label: 'Average Carbs',
                    data: [average1, average2, average3, average4],
                    backgroundColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }
            ]
        };
        new Chart(ctx5, {
            type: 'bar',
            data: data5,
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            min: 0,
                            max: 3,
                            stepSize: 1,
                            callback: function (value, index, values) {
                                var tmp = ['None', 'Low', 'Mid', 'High']
                                return tmp[value];
                            }
                        }
                    }]
                },
            }
        });


        // Carbs by day of week
        var average1 = average(dayBreakdown[0])
        var average2 = average(dayBreakdown[1])
        var average3 = average(dayBreakdown[2])
        var average4 = average(dayBreakdown[3])
        var average5 = average(dayBreakdown[4])
        var average6 = average(dayBreakdown[5])
        var average7 = average(dayBreakdown[6])

        var ctx6 = document.getElementById("dayChart").getContext("2d");
        const labels6 = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const data6 = {
            labels: labels6,
            datasets: [
                {
                    label: 'Average Carbs',
                    data: [average1, average2, average3, average4, average5, average6, average7],
                    backgroundColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }
            ]
        };
        new Chart(ctx6, {
            type: 'bar',
            data: data6,
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            min: 0,
                            max: 3,
                            stepSize: 1,
                            callback: function (value, index, values) {
                                var tmp = ['None', 'Low', 'Mid', 'High']
                                return tmp[value];
                            }
                        }
                    }]
                },
            }
        });

    }


}(jQuery));



