

(function inputScopeWrapper($) {

    $(function onDocReady() {

        // Grab user ID
        publicID = window.location.search.slice(1, 100)
        // Grab user data
        pullOne(publicID)
        // Populate input form with current data

        // Show Input form button
        $('#showInput').click(function () {
            // if($('#userInput'))
            $('#userInput').toggle();
            // console.log($('#userInput').css('display'))
            if ($('#userInput').css('display') == 'block') {
                $('#showInput').val('Hide')
            } else {
                $('#showInput').val('Update Health Data')
            }
        });

        // On date change, repopulate
        $('#date_ass').change(populateForm);

        // Input data and refresh page on submit
        $('#userInput').submit(handleAddData);

    });

    function charts() {

        // 'Date', 'Weight', 'Bfast', 'Lunch', 'Dinner', 'Snacks', 'Exercise'
        // Weight Graph
        var ctx1 = document.getElementById("weightChart").getContext("2d");
        const labels1 = allData.map(x => x.InputDate);
        const data1 = {
            labels: labels1,
            datasets: [{
                label: 'Weight',
                data: allData.map(x => x.Weight),
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
        for (i = 0; i < allData.length; i++) {
            if (allData[i].Exercise == 'Yes') {
                allData[i].ExerciseN = 1;
            } else {
                allData[i].ExerciseN = 0;
            }
        }

        var ctx2 = document.getElementById("exerciseChart").getContext("2d");
        const labels2 = allData.map(x => x.InputDate);
        const data2 = {
            labels: labels2,
            datasets: [{
                label: 'Exercise',
                data: allData.map(x => x.ExerciseN),
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
        var wtdAve = allData.map(x => [x.InputDate])
        var mealBreakdown = []; // Tracking carbs my meal type
        var dayBreakdown = [[], [], [], [], [], [], []]; // Tracking carbs by day of week
        for (i = 0; i < allData.length; i++) {
            mealBreakdown.push([])
            var sum = 0
            var count = 0
            var day = new Date(allData[i].InputDate).getDay()
            var objects = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
            for (j = 0; j < objects.length; j++) {
                var mealtmp = eval('allData[' + i + '].' + objects[j])
                if (mealtmp == 'No') {
                    count = count + 1
                    mealBreakdown[i].push(0.01)
                    dayBreakdown[day].push(0.01)
                } else if (mealtmp == 'Low') {
                    sum = sum + 1
                    count = count + 1
                    mealBreakdown[i].push(1)
                    dayBreakdown[day].push(1)
                } else if (mealtmp == 'Mid') {
                    sum = sum + 2
                    count = count + 1
                    mealBreakdown[i].push(2)
                    dayBreakdown[day].push(2)
                } else if (mealtmp == 'High') {
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
        function average(array) {
            if (array.length > 0) {
                return array.reduce((a, b) => a + b) / array.length;
            } else {
                return 0
            }

        }

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

    // Functions to grab AWS data
    function pullOne(ID) {
        $.ajax({
            method: 'POST',
            url: 'https://beshfpo816.execute-api.us-east-2.amazonaws.com/prod/user',
            headers: {},
            data: JSON.stringify({
                Actions: 'pullOne',
                ID: ID
            }),
            contentType: 'application/json',
            success: completePull,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error user add: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
            }
        });
    }

    function completePull(response) {
        console.log('data pulled')
        // allData = response
        // Sort allData by date oldest -> newest
        allData = response.sort(function (a, b) {
            return new Date(a.InputDate) - new Date(b.InputDate);
        });
        charts();
        // Set Input Date values
        var today = new Date()
        var yest = new Date(today)
        yest.setDate(yest.getDate() - 1)
        var dateFormatted1 = today.getMonth() + 1 + '/' + today.getDate() + '/' + today.getFullYear().toString().slice(2, 4);
        var dateFormatted2 = yest.getMonth() + 1 + '/' + yest.getDate() + '/' + yest.getFullYear().toString().slice(2, 4);
        $('#date_ass option').eq(0).val(dateFormatted1);
        $('#date_ass option').eq(1).val(dateFormatted2);
        populateForm();
    }

    function handleAddData() {
        var ID = publicID;
        var breakfast = $('#breakfast_ass').val();
        var lunch = $('#lunch_ass').val();
        var dinner = $('#dinner_ass').val();
        var snacks = $('#snacks_ass').val();
        var weight = $('#weight_ass').val();
        var exercise = $('#exercise_ass').val();
        var userInputs = { 'ID': ID, 'breakfast': breakfast, 'lunch': lunch, 'dinner': dinner, 'snacks': snacks, 'weight': weight, 'exercise': exercise }
        console.log(userInputs)
        addEntry(userInputs);
        return false;
    }

    function addEntry(userInputs) {
        $.ajax({
            method: 'POST',
            url: 'https://beshfpo816.execute-api.us-east-2.amazonaws.com/prod/user',
            headers: {},
            data: JSON.stringify({
                Actions: 'add',
                ID: userInputs.ID,
                Breakfast: userInputs.breakfast,
                Lunch: userInputs.lunch,
                Dinner: userInputs.dinner,
                Snacks: userInputs.snacks,
                Weight: userInputs.weight,
                Exercise: userInputs.exercise
            }),
            contentType: 'application/json',
            success: completeAdd,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error user add: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
            }
        });
    }

    function completeAdd(response) {

        console.log(response)
        if(!alert('Data added, page will now refresh!')){window.location.reload();}
        
    }

    function populateForm() {
        const relData = (x) => x.InputDate == $('#date_ass').find(":selected").val();
        var index = allData.findIndex(relData)
        // If some data exists then populate
        if (index != -1) {
            // Left off here - set input values for whatever currently exists
            if (allData[index].Breakfast != undefined & allData[index].Breakfast != '') {
                $("#breakfast_ass").val(allData[index].Breakfast)
            } else {
                $("#breakfast_ass").val('Skip')
            }
            if (allData[index].Lunch != undefined & allData[index].Lunch != '') {
                $("#lunch_ass").val(allData[index].Lunch)
            } else {
                $("#lunch_ass").val('Skip')
            }
            if (allData[index].Dinner != undefined & allData[index].Dinner != '') {
                $("#dinner_ass").val(allData[index].Dinner)
            } else {
                $("#dinner_ass").val('Skip')
            }
            if (allData[index].Snacks != undefined & allData[index].Snacks != '') {
                $("#snacks_ass").val(allData[index].Snacks)
            } else {
                $("#snacks_ass").val('Skip')
            }
            if (allData[index].Exercise != undefined & allData[index].Exercise != '') {
                $("#exercise_ass").val(allData[index].Exercise)
            } else {
                $("#exercise_ass").val('No')
            }
            if (allData[index].Weight != undefined) {
                $("#weight_ass").val(allData[index].Weight)
            } else {
                $("#weight_ass").val('')
            }
        } else {
            // Set Defaults
            $("#breakfast_ass").val('Skip')
            $("#lunch_ass").val('Skip')
            $("#dinner_ass").val('Skip')
            $("#snacks_ass").val('Skip')
            $("#exercise_ass").val('No')
            $("#weight_ass").val('')
        }

    }


}(jQuery));



