
(function inputScopeWrapper($) {

    function dataLog(userInputs) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/user',
            headers: {
                // Authorization: authToken
            },
            data: JSON.stringify({
                    Speed: userInputs.speed,
                    Quantity: userInputs.quantity,
                    Logging: userInputs.logging
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

    // Register click handler for #add button
    // $(function onDocReady() {
    //     $('#buttonModel').click(handleAddData);
    // });

    function handleAddData() {
        var speed = $('#speed_ass').val();
        var quantity = $('#quantity_ass').val();
        var logging = $('#logging_ass').val();
        var timing = $('#timing_ass').val();
        var vegetarian = $('#vegetarian_ass').val();
        var commercial = $('#commercial_ass').val();
        var prepared = $('#prepared_ass').val();
        var food_keep = $('#food_keep_ass').val();
        var timing = $('#timing_ass').val();


        var userInputs = {'speed' : speed, 'quantity' : quantity, 'logging' : logging}
        // event.preventDefault();
        console.log(userInputs)
        console.log("Currently pausing DB data logging for testing purposes")
        // dataLog(userInputs) - pausing during testing so I don't fill the database with noisy data
    }

}(jQuery));



// Speed: speed,
// Quantity: quantity,
// Logging: logging,
// Timing: timing,
// Vegetarian: vegetarian,
// Commercial: commerical,
// Prepared: prepared,
// Food_keep: food_keep,
// Diet_output: diet_output,