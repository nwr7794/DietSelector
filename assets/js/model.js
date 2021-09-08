// Left off here - now we create the javascript model to rank the best fitting diets and output the top 3, with an option to receieve the entire list over email
// Will first need to upload the txt file with diet attributes and stick in assets
// Then create/run algo

// Maybe the app can write to google sheet with API key


(function inputScopeWrapper($) {

    // Grab the dietDB data during page load
    $(function onDocReady() {

        var keyProd = 'AIzaSyDaqR3scLgh4Dw26glrQ2BfDHiMJKzDIz4'
        var keyTest = 'AIzaSyAGYgfzU5Lo2-OsFVMySI7UNzjxl_4EkQQ' ///////////////////////////////////////// Make sure right one active pre-commit

        dietDB = $.ajax({
            method: 'GET',
            url: 'https://sheets.googleapis.com/v4/spreadsheets/1pw9VzJoItk1Cem9gDx7Z7M-Zk1RxFl8H2BykSy1BOX8/values/DB!A1:O23?majorDimension=ROWS&key=' + keyProd,
            // contentType: 'application/json',
            success: console.log('success'),
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error pulling data: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                // alert('An error occured when pulling the diet DB:\n' + jqXHR.responseText);
            }
        });


        $('#buttonModel').click(dietModel);
        $('#buttonRevert').click(dietRevert);
        // Track link clicks - later will add logging for this
        $(document).delegate('a', 'click', function (e) {
            console.log(e.target.id + ' clicked');
            // alert(e.target.nodeName + ' clicked and "this" points to ' + this.nodeName);
        });

    });

    // Function that brings you back to preferences input
    function dietRevert() {
        document.getElementById("quizOutput").style.display = 'none'
        document.getElementById("quizInputs").style.display = 'block'
    }

    // Function to run when user submits diet preferences
    function dietModel() {

        // Scroll to top of page
        $('html,body').scrollTop(0);

        // Grab user assumptions
        var speed = parseFloat(document.getElementById('speed_ass').value)
        var quantity = parseFloat(document.getElementById('quantity_ass').value)
        var logging = parseFloat(document.getElementById('logging_ass').value)
        var timing = parseFloat(document.getElementById('timing_ass').value)
        var vegetarian = parseFloat(document.getElementById('vegetarian_ass').value)
        var commercial = parseFloat(document.getElementById('commercial_ass').value)
        if (commercial == 5) {
            var prepared = parseFloat(document.getElementById('prepared_ass').value)
        }

        var food_ass = ['keep_sugar', 'keep_processed', 'keep_refined', 'keep_whole', 'keep_artificial', 'keep_starch', 'keep_legumes', 'keep_dairy', 'keep_fruit', 'keep_fat', 'keep_alc']
        var food_keep = [];

        for (i = 0; i < food_ass.length; i++) {
            if (document.getElementById(food_ass[i]).checked == true) {
                food_keep.push(document.getElementById(food_ass[i]).name)
            }
        }

        // Set user output summary variables
        // document.getElementById('outSpeed').value = (speed - 1) * 20 + 3
        // document.getElementById('outQuantity').value = (quantity - 1) * 20 + 3
        // document.getElementById('outLogging').value = (logging - 1) * 20 + 3
        // document.getElementById('outTime').value = (timing - 1) * 20 + 3
        // document.getElementById('outCommercial').value = (commercial - 1) * 20 + 3

        // Say every diet starts with a perfect score (42 points)
        // Speed - Deduct: Abs(Speed diet - speed assumption)
        // Quantity - Deduct: Max(Quantity diet - quantity assumption, 0)
        // Logging - Deduct: Max(Logging diet (Yes = 5) - Logging assumption, 0)
        // timing - Deduct: Max(Timing diet - timing assumption, 0)
        // Vegetarian - Deduct: Max(Vegetarian assumption - veegtarian diet, 0)
        // Commercial - If commercial not allowed, deduct 10 from all commercial.
        // Then if prepared food not allowed, deduct 10 from all prepared.

        // Food removals: For every category that's removed but the user wants, deduct 2 points
        // 11 categories: 22 points

        // Output array to be: Name, Score, Link
        var outputDiets = [['Diet Name', 'Score', 'Link']];
        var data = dietDB.responseJSON.values
        // Change the yes/no answers to numbers
        for (i = 1; i < data.length; i++) {
            // Food logging
            if (data[i][7] == 'Yes') { data[i][7] = 5 } else { data[i][7] = 1 }
        }

        // Calculate scores
        for (i = 1; i < data.length; i++) {
            var name = data[i][0]
            var link = data[i][2]
            var dietID = data[i][13]
            var adherence = data[i][11]
            var blurb = data[i][14]
            var maxScore = 42
            var score = maxScore
            if (data[i][10] - speed < 0) {
                score = score - Math.max((data[i][10] - speed) ** 2, 3)
            } else {
                score = score - (data[i][10] - speed)
            }
            score = score - Math.max(data[i][6] - quantity, 0)
            score = score - Math.max(data[i][7] - logging, 0)
            score = score - Math.max(data[i][12] - timing, 0)
            score = score - Math.max(vegetarian - data[i][9], 0) * 2
            var commBarChart = 1
            if (commercial == 1 & data[i][4] == 'Yes') {
                score = score - 10
                commBarChart = 5
            } else if (prepared == 1 & data[i][5] == 'Yes') {
                score = score - 10
            }

            // removedTmp is array of food not allowed on diet
            removedTmp = data[i][3].split(",")

            for (j = 0; j < food_keep.length; j++) {
                if (removedTmp.includes(food_keep[j]) == true) {
                    score = score - 2
                }
            }

            var linkOutput = document.createElement('a')
            linkOutput.setAttribute('href', link)
            linkOutput.setAttribute('id', dietID)
            linkOutput.setAttribute('target', '_blank')
            linkOutput.innerHTML = name

            // Add output diet characteristics to array
            outputDiets.push([linkOutput.outerHTML, score, dietID, adherence, Math.round(score / maxScore * 100) + "%", blurb
                , data[i][10], data[i][6], data[i][7], data[i][12], commBarChart, name])
        }

        // Sort by score descending, then adherence difficulty as tie-breaker
        var sortedOutput1 = outputDiets.sort(function (a, b) {
            if (a[1] == b[1]) {
                return a[3] - b[3];
            }
            return b[1] - a[1];
        });

        // Only show top 3
        var sortedOutput = sortedOutput1.slice(0, 4)

        var outputDietIDs_tmp = sortedOutput.map(x => parseInt(x[2]))
        var outputDietIDs = outputDietIDs_tmp.slice(1, 4)



        // Diet Name, pref values and diet values. Speed, quantity, schedule
        // Create bar chart of user prefs and output diets
        var ctx = document.getElementById("prefsChart").getContext("2d");

        var chartData = {
            labels: ["Weight Loss Speed", "Eating Quantity", "Food Logging", "Eating Schedule?", "Pay For Plan?"],
            datasets: [
                {
                    label: "Your Preference",
                    backgroundColor: "blue",
                    data: [speed, quantity, logging, timing, commercial]
                }, {
                    label: sortedOutput[1][11],
                    backgroundColor: "red",
                    data: [sortedOutput[1][6], sortedOutput[1][7], sortedOutput[1][8], sortedOutput[1][9], sortedOutput[1][10]]
                }, {
                    label: sortedOutput[2][11],
                    backgroundColor: "green",
                    data: [sortedOutput[2][6], sortedOutput[2][7], sortedOutput[2][8], sortedOutput[2][9], sortedOutput[2][10]]
                }, {
                    label: sortedOutput[3][11],
                    backgroundColor: "orange",
                    data: [sortedOutput[3][6], sortedOutput[3][7], sortedOutput[3][8], sortedOutput[3][9], sortedOutput[3][10]]
                }
                // , {
                //     label: sortedOutput[4][11],
                //     backgroundColor: "yellow",
                //     data: [sortedOutput[4][6], sortedOutput[4][7], sortedOutput[4][8], sortedOutput[4][9], sortedOutput[4][10]]
                // }
                // , {
                //     label: sortedOutput[5][11],
                //     backgroundColor: "purple",
                //     data: [sortedOutput[5][6], sortedOutput[5][7], sortedOutput[5][8], sortedOutput[5][9], sortedOutput[5][10]]
                // }
            ]
        };

        var myBarChart = new Chart(ctx, {
            type: 'horizontalBar',
            data: chartData,
            options: {
                // barValueSpacing: 20,
                scales: {
                    xAxes: [{
                        ticks: {
                            min: 0,
                            max: 5
                        },
                        display: false
                    }]
                }
            }
        });
        // End of bar chart code






        // Now push results to quizOutput div, then hide quizInputs and show quizOutput
        // outputTableBody - this is the id of the table body we need to populate
        // Clear table body
        $("#outputTableBody").empty();

        // Removed score for now
        var table_cols = [0, 5]
        // var table_cols = [0, 4, 5]
        var table_body = document.getElementById('outputTableBody');
        for (i = 1; i < sortedOutput.length; i++) {
            var tr = table_body.insertRow(-1)
            for (j = 0; j < table_cols.length; j++) {
                var tc = tr.insertCell(-1)
                tc.innerHTML = sortedOutput[i][table_cols[j]]
            }
        }

        document.getElementById("quizInputs").style.display = 'none'
        document.getElementById("quizOutput").style.display = 'block'


        // Run the logging function on click
        handleAddData(food_keep, outputDietIDs);



    }


    function dataLog(userInputs) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/user',
            headers: {},
            data: JSON.stringify({
                Speed: userInputs.speed,
                Quantity: userInputs.quantity,
                Logging: userInputs.logging,
                Timing: userInputs.timing,
                Vegetarian: userInputs.vegetarian,
                Commercial: userInputs.commercial,
                Prepared: userInputs.prepared,
                Food_keep: userInputs.food_keep,
                Diet_output: userInputs.diet_output,
                Gender: userInputs.gender,
                Age: userInputs.age,
                Email: userInputs.email
            }),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error logging: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when logging data:\n' + jqXHR.responseText);
            }
        });
    }

    function completeRequest(result) {
        console.log('Successful')
    }

    function handleAddData(food_agg, diet_agg) {
        var speed = $('#speed_ass').val();
        var quantity = $('#quantity_ass').val();
        var logging = $('#logging_ass').val();
        var timing = $('#timing_ass').val();
        var vegetarian = $('#vegetarian_ass').val();
        var commercial = $('#commercial_ass').val();
        var prepared = $('#prepared_ass').val();
        var food_keep = food_agg.join();
        var diet_output = diet_agg.join();
        var gender = $('#gender_ass').val();
        var age = $('#age_ass').val();
        var email = $('#email_ass').val();
        var userInputs = { 'speed': speed, 'quantity': quantity, 'logging': logging, 'timing': timing, 'vegetarian': vegetarian, 'commercial': commercial, 'prepared': prepared, 'food_keep': food_keep, 'diet_output': diet_output, 'gender': gender, 'age': age, 'email': email }

        // pausing during testing so I don't fill the database with noisy data
        // console.log("Currently pausing DB data logging for testing purposes")
        // console.log(userInputs)
        dataLog(userInputs)
    }


}(jQuery));



