

(function inputScopeWrapper($) {

    $(function onDocReady() {

        // Grab user ID
        publicID = window.location.search.slice(1, 100)
        // Grab user data
        pullOne(publicID, 'BodyChangeData')
        // Grab user name
        pullOne(publicID, 'BodyChangeUsers')
        // Populate input form with current data

        // Show Input form button
        $('#showInput').click(function () {
            if ($('#name_check').val().toLowerCase() == editTest.toLowerCase()) {
                $('#userInput').toggle();
                // console.log($('#userInput').css('display'))
                if ($('#userInput').css('display') == 'block') {
                    $('#showInput').val('Hide')
                } else {
                    $('#showInput').val('Update Health Data')
                }
            } else {
                alert('Wrong name')
            }

        });

        // Show Carb Details button
        $('#showCarbDetails').click(function () {
            // if($('#userInput'))
            $('#carbDetails').toggle();
            // console.log($('#userInput').css('display'))
            if ($('#carbDetails').css('display') == 'block') {
                $('#showCarbDetails').val('Hide')
            } else {
                $('#showCarbDetails').val('Show Carb Details')
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
            if (allData[i].Exercise == 'Low') {
                allData[i].ExerciseN = 1;
            } else if (allData[i].Exercise == 'Mid') {
                allData[i].ExerciseN = 2;
            } else if (allData[i].Exercise == 'High') {
                allData[i].ExerciseN = 3;
            } else if (allData[i].Exercise == 'Yes') {
                allData[i].ExerciseN = 2; // Will assume legacy yes' as mid
            } else {
                allData[i].ExerciseN = 0;
            }
        }

        // /////////////////////////// Add exercise levels to input and change chart code/axis

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

        // Wtd Ave Carbs Graph
        // Calc wtd ave: none - 0, low - 1, mid - 2, high - 3
        var wtdAve = allData.map(x => [x.InputDate])
        var rollingAve = allData.map(x => [x.InputDate])
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
            if (i > 4) {
                rollingAve[i].push((wtdAve[i - 4][1] + wtdAve[i - 3][1] + wtdAve[i - 2][1] + wtdAve[i - 1][1] + wtdAve[i][1]) / 5)
            } else {
                rollingAve[i].push(wtdAve[i][1])
            }
        }
        // console.log(wtdAve)
        // console.log(rollingAve)

        var ctx3 = document.getElementById("aveChart").getContext("2d");
        const labels3 = wtdAve.map(x => x[0]);
        const data3 = {
            labels: labels3,
            datasets: [
                {
                    label: '5 Day Ave',
                    data: rollingAve.map(x => x[1]),
                    fill: false,
                    borderColor: 'rgb(245, 147, 66)',
                    tension: 0,
                    radius: 0,
                    borderWidth: 4
                }
                , {
                    label: 'Daily Carb Intake',
                    data: wtdAve.map(x => x[1]),
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }
            ]
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

        // Alcohol Graph
        var ctx7 = document.getElementById("alcoholChart").getContext("2d");
        const labels7 = allData.map(x => x.InputDate);
        const data7 = {
            labels: labels7,
            datasets: [{
                label: 'Drinks',
                data: allData.map(x => x.Alcohol),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };
        new Chart(ctx7, {
            type: 'line',
            data: data7,
        });

        // Sleep Graph
        var ctx8 = document.getElementById("sleepChart").getContext("2d");
        const labels8 = allData.map(x => x.InputDate);
        const data8 = {
            labels: labels8,
            datasets: [{
                label: 'Sleep',
                data: allData.map(x => x.Sleep),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };
        new Chart(ctx8, {
            type: 'line',
            data: data8,
        });

        // Meditation Graph
        var ctx9 = document.getElementById("meditationChart").getContext("2d");
        const labels9 = allData.map(x => x.InputDate);
        const data9 = {
            labels: labels9,
            datasets: [{
                label: 'Meditation',
                data: allData.map(x => x.Meditation),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };
        new Chart(ctx9, {
            type: 'line',
            data: data9,
        });

        // Deep Work Graph
        var ctx10 = document.getElementById("deepworkChart").getContext("2d");
        const labels10 = allData.map(x => x.InputDate);
        const data10 = {
            labels: labels10,
            datasets: [{
                label: 'Deep Work',
                data: allData.map(x => x.Deepwork),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };
        new Chart(ctx10, {
            type: 'line',
            data: data10,
        });

        // Weight Loss Posts Graph
        var ctx11 = document.getElementById("postsChart").getContext("2d");
        const labels11 = allData.map(x => x.InputDate);
        const data11 = {
            labels: labels11,
            datasets: [{
                label: 'Posts',
                data: allData.map(x => x.Posts),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };
        new Chart(ctx11, {
            type: 'line',
            data: data11,
        });

        // Networking Graph
        var ctx12 = document.getElementById("networkingChart").getContext("2d");
        const labels12 = allData.map(x => x.InputDate);
        const data12 = {
            labels: labels12,
            datasets: [{
                label: 'Networking',
                data: allData.map(x => x.Networking),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };
        new Chart(ctx12, {
            type: 'line',
            data: data12,
        });



    }

    // Functions to grab AWS data
    function pullOne(ID, tableName) {
        $.ajax({
            method: 'POST',
            url: 'https://beshfpo816.execute-api.us-east-2.amazonaws.com/prod/user',
            headers: {},
            data: JSON.stringify({
                Actions: 'pullOne',
                ID: ID,
                TableName: tableName
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
        if (response[0].Email != undefined) {
            editTest = response[0].Email
        } else {
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
    }

    function handleAddData() {
        var ID = publicID;
        var inputDate = $('#date_ass').val();
        var breakfast = $('#breakfast_ass').val();
        var lunch = $('#lunch_ass').val();
        var dinner = $('#dinner_ass').val();
        var snacks = $('#snacks_ass').val();
        var weight = $('#weight_ass').val();
        var exercise = $('#exercise_ass').val();
        var alcohol = $('#alcohol_ass').val();
        var sleep = $('#sleep_ass').val();
        var meditation = $('#meditation_ass').val();
        var deepwork = $('#deepwork_ass').val();
        var posts = $('#posts_ass').val();
        var networking = $('#networking_ass').val();

        var userInputs = {
            'ID': ID, 'inputDate': inputDate, 'breakfast': breakfast, 'lunch': lunch, 'dinner': dinner
            , 'snacks': snacks, 'weight': weight, 'exercise': exercise, 'alcohol': alcohol, 'sleep': sleep, 'meditation': meditation,
            'deepwork': deepwork, 'posts': posts, 'networking': networking
        }
        // console.log(userInputs)
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
                InputDate: userInputs.inputDate,
                Breakfast: userInputs.breakfast,
                Lunch: userInputs.lunch,
                Dinner: userInputs.dinner,
                Snacks: userInputs.snacks,
                Weight: userInputs.weight,
                Exercise: userInputs.exercise,
                Alcohol: userInputs.alcohol,
                Sleep: userInputs.sleep,
                Meditation: userInputs.meditation,
                Deepwork: userInputs.deepwork,
                Posts: userInputs.posts,
                Networking: userInputs.networking
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
        if (!alert('Data added, page will now refresh!')) { window.location.reload(); }

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
            if (allData[index].Alcohol != undefined) {
                $("#alcohol_ass").val(allData[index].Alcohol)
            } else {
                $("#alcohol_ass").val('')
            }
            if (allData[index].Sleep != undefined) {
                $("#sleep_ass").val(allData[index].Sleep)
            } else {
                $("#sleep_ass").val('')
            }
            if (allData[index].Meditation != undefined) {
                $("#meditation_ass").val(allData[index].Meditation)
            } else {
                $("#meditation_ass").val('0')
            }
            if (allData[index].Deepwork != undefined) {
                $("#deepwork_ass").val(allData[index].Deepwork)
            } else {
                $("#deepwork_ass").val('0')
            }
            if (allData[index].Posts != undefined) {
                $("#posts_ass").val(allData[index].Posts)
            } else {
                $("#posts_ass").val('0')
            }
            if (allData[index].Networking != undefined) {
                $("#networking_ass").val(allData[index].Networking)
            } else {
                $("#networking_ass").val('0')
            }


        } else {
            // Set Defaults
            $("#breakfast_ass").val('Skip')
            $("#lunch_ass").val('Skip')
            $("#dinner_ass").val('Skip')
            $("#snacks_ass").val('Skip')
            $("#exercise_ass").val('No')
            $("#weight_ass").val('')
            $("#alcohol_ass").val('0')
            $("#sleep_ass").val('')
            $("#meditation_ass").val('0')
            $("#deepwork_ass").val('0')
            $("#posts_ass").val('0')
            $("#networking_ass").val('0')
        }
    }


}(jQuery));



