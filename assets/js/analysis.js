

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
        // console.log(dataSlice)

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
        var mealBreakdown = [];
        for (i = 0; i < dataSlice.length; i++) {
            mealBreakdown.push([])
            var sum = 0
            var count = 0
            for (j = 2; j < 6; j++) {
                if (dataSlice[i][j] == 'No') {
                    count = count + 1
                    mealBreakdown[i].push(0)
                } else if (dataSlice[i][j] == 'Low') {
                    sum = sum + 1
                    count = count + 1
                    mealBreakdown[i].push(1)
                } else if (dataSlice[i][j] == 'Mid') {
                    sum = sum + 2
                    count = count + 1
                    mealBreakdown[i].push(2)
                } else if (dataSlice[i][j] == 'High') {
                    sum = sum + 3
                    count = count + 1
                    mealBreakdown[i].push(3)
                } else {
                    mealBreakdown[i].push(0)
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

        // Meal Breakdown Graph
        var ctx4 = document.getElementById("mealChart").getContext("2d");
        const labels4 = dataSlice.map(x => x[0]);
        const data4 = {
            labels: labels4,
            datasets: [
                {
                    label: 'Breakfast',
                    data: mealBreakdown.map(x => x[0]),
                    fill: false,
                    borderColor: 'rgb(75, 192, 192,0.5)',
                    tension: 0.1
                }
                , {
                    label: 'Lunch',
                    data: mealBreakdown.map(x => x[1]),
                    fill: false,
                    borderColor: 'rgb(255,0,0,0.5)',
                    tension: 0.1
                }
                , {
                    label: 'Dinner',
                    data: mealBreakdown.map(x => x[2]),
                    fill: false,
                    borderColor: 'rgb(255,255,0,0.5)',
                    tension: 0.1
                }
                , {
                    label: 'Snacks',
                    data: mealBreakdown.map(x => x[3]),
                    fill: false,
                    borderColor: 'rgb(0,0,255,0.5)',
                    tension: 0.1
                }
            ]
        };
        new Chart(ctx4, {
            type: 'line',
            data: data4,
            options: {
                // plugins: {
                //     title: {
                //         display: true,
                //         text: 'Daily Carb Intake'
                //     }
                // },
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
                },
            }
        });



        // 2. Meal Graph (number of non-carb meals/day)
        // 3. Meal type breakdown
        ///////////// 4. Exercise chart
        // 5. Wtd Ave carbs/day vs. weight


    }


}(jQuery));



