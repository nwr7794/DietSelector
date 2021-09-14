

(function inputScopeWrapper($) {

    // Grab the dietDB data during page load
    $(function onDocReady() {
        $('#dietSubmit').submit(handleAddData);
    });

    // Populate diet input

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
            }
        });
    }

    function completeRequest(response) {
        document.getElementById("dietComplete").innerHTML = '<h3 style="color: orange;">Thanks ' + response.Name +
            '! I will reach out to you ASAP to setup a call (or coffee if you are in NYC)!</h3><b>' + 'Your Email: ' + response.Email + '</b>';

        document.getElementById("pitch").style.display = 'none'
        document.getElementById("dietSubmit").style.display = 'none'
        document.getElementById("dietComplete").style.display = 'block'
        // Scroll to top of page
        $('html,body').scrollTop(0);

    }

    function handleAddData() {
        var dietID = ''
        var dietName = ''
        var name = $('#name_ass').val();
        var email = $('#email_ass').val();
        var userInputs = { 'dietID': dietID, 'dietName': dietName, 'name': name, 'email': email }
        userAdd(userInputs)
        return false;
    }

}(jQuery));



