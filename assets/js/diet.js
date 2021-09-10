

(function inputScopeWrapper($) {

    // Grab the dietDB data during page load
    $(function onDocReady() {

        var keyProd = 'AIzaSyDaqR3scLgh4Dw26glrQ2BfDHiMJKzDIz4'
        var keyTest = 'AIzaSyAGYgfzU5Lo2-OsFVMySI7UNzjxl_4EkQQ' ///////////////////////////////////////// Make sure right one active pre-commit

        dietDB = $.ajax({
            method: 'GET',
            url: 'https://sheets.googleapis.com/v4/spreadsheets/1pw9VzJoItk1Cem9gDx7Z7M-Zk1RxFl8H2BykSy1BOX8/values/DB!A1:O23?majorDimension=ROWS&key=' + keyProd,
            // contentType: 'application/json',
            success: dietInput,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error pulling data: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                // alert('An error occured when pulling the diet DB:\n' + jqXHR.responseText);
            }
        });

        $('#dietSubmit').submit(handleAddData);

    });

    // Populate diet input
    function dietInput() {
        var response = dietDB.responseJSON.values
        var select = document.getElementById('diet_ass');
        for (i = 1; i < response.length; i++) {
            var opt = document.createElement('option');
            opt.value = response[i][13];
            opt.innerHTML = response[i][0];
            if (window.location.search.slice(6, 100) == response[i][13]) {
                opt.selected = true
            }
            select.appendChild(opt);
        }
    }


    function userAdd(userInputs) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/implement',
            headers: {},
            data: JSON.stringify({
                DietID: userInputs.dietID,
                DietName: userInputs.dietName,
                Name: userInputs.name,
                Email: userInputs.email
            }),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error user add: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                // alert('An error occured when adding user:\n' + jqXHR.responseText);
            }
        });
    }

    function completeRequest(response) {
        // console.log(response)
        document.getElementById("dietComplete").innerHTML = '<h3 style="color: orange;">Congratulations ' + response.Name +
            ' on beginning your weight loss journey! You will receive an email from us shortly!</h3><b>Diet: ' +
            response.DietName + '<br>Email: ' + response.Email + '</b>';

        document.getElementById("dietSubmit").style.display = 'none'
        document.getElementById("dietComplete").style.display = 'block'

    }

    function handleAddData() {
        var dietID = $('#diet_ass').val();
        var dietName = $("#diet_ass option:selected").text();
        var name = $('#name_ass').val();
        var email = $('#email_ass').val();
        var userInputs = { 'dietID': dietID, 'dietName': dietName, 'name': name, 'email': email }
        // pausing during testing so I don't fill the database with noisy data
        // console.log("Currently pausing DB data logging for testing purposes")
        // console.log(userInputs)
        userAdd(userInputs)
        return false;
    }

}(jQuery));



