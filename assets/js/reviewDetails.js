

(function inputScopeWrapper($) {

    $(function onDocReady() {

        // Grab diet reviews
        dietID = window.location.search.slice(6, 100)

        // Grab dietDB - grab aws data upon completion
        var keyProd = 'AIzaSyDaqR3scLgh4Dw26glrQ2BfDHiMJKzDIz4'
        var keyTest = 'AIzaSyAGYgfzU5Lo2-OsFVMySI7UNzjxl_4EkQQ' ///////////////////////////////////////// Make sure right one active pre-commit

        dietDB = $.ajax({
            method: 'GET',
            async: false,
            url: 'https://sheets.googleapis.com/v4/spreadsheets/1pw9VzJoItk1Cem9gDx7Z7M-Zk1RxFl8H2BykSy1BOX8/values/DB!A1:R23?majorDimension=ROWS&key=' + keyProd,
            success: pullOne(dietID),
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error pulling data: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
            }
        });

        // Add event listener for form submit

        $('#submitButton').click(function () {
            $('#showDetails').show();
        });

        $('#reviewSubmit').submit(handleAddData);

        $('#addRating').click(function () {
            $('#showDetails').show();
        });

    });

    // function to build page
    function populateInitial() {
        var dbRow = dietID;
        // Add Logo
        $("#dietLogo").attr('src', 'images/' + dietDB.responseJSON.values[dbRow][15])
        // Add Name
        $("#dietName").html(dietDB.responseJSON.values[dbRow][0])
        // Calculate average review and number of reviews
        var count = 0
        var sum = 0
        for (i = 0; i < reviewsGlobal.length; i++) {
            count = count + 1
            sum = sum + parseInt(reviewsGlobal[i].Rating)
        }
        if (count > 0) {
            var ave = Math.round(sum / count)
        } else { var ave = 0 }
        // Add rating and review count
        for (i = 1; i < 6; i++) {
            if (ave >= i) {
                $("#star" + i).attr('class', 'fa fa-star checked')
            } else {
                $("#star" + i).attr('class', 'fa fa-star')
            }
        }
        $("#reviewCount").html('&nbsp;' + count + ' reviews')
        // Add Price
        $("#dietPrice").html('<b>'+dietDB.responseJSON.values[dbRow][16]+'</b>')
        var tags = dietDB.responseJSON.values[dbRow][17].split(',')
        for (i = 0; i < tags.length; i++) {
            $("<i class='fa fa-check' aria-hidden='true' style='color: green;'>" + tags[i] + "</i>").appendTo("#dietTags");
        }
        $("#dietDescription").html(dietDB.responseJSON.values[dbRow][14])

        // Add user reviews at bottom of page
        // First sort by newest review
        var sortedArray = reviewsGlobal.sort(function (a, b) {
            return new Date(b.InputDate) - new Date(a.InputDate);
        });

        for (jj = 0; jj < sortedArray.length; jj++) {
            var stars = []
            for (ii = 1; ii < 6; ii++) {
                if (parseInt(sortedArray[jj].Rating) >= ii) {
                    stars.push('<span class="fa fa-star checked"></span>')
                } else {
                    stars.push('<span class="fa fa-star"></span>')
                }
            }
            stars = stars.join('')
            var newReview = '<li><div style="margin: 5px; font-size: 10pt;"><b style="font-size: 14pt;">' + sortedArray[jj].Username + '</b><br>' + stars + '&nbsp; - ' + sortedArray[jj].InputDate.slice(0, 10) + '<br>' + sortedArray[jj].Comment + '<br></div></li>';
            $("#reviewList").append(newReview);
        }

    }

    function pullOne(dietID) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/review',
            headers: {},
            data: JSON.stringify({
                Actions: 'pullOne',
                DietID: dietID
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
        reviewsGlobal = response
        // Upon completion build page
        populateInitial();
    }

    function addReview(userInputs) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/review',
            headers: {},
            data: JSON.stringify({
                Actions: 'add',
                Email: userInputs.email,
                Rating: userInputs.rating,
                Comment: userInputs.comment,
                Username: userInputs.username,
                DietID: userInputs.dietID,
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
        console.log('review added')

        $('#reviewSubmit').hide();
        $('#thanks').show();
    }

    function handleAddData() {
        // Identify rating
        var rating = 0
        for (ii = 0; ii < 5; ii++) {
            var xxx = $('#addRating').find("label").eq(ii)[0]
            if (xxx.className == 'selected') {
                rating = xxx.firstElementChild.value
                break;
            }
        }
        var comment = $('#userReview').val();
        var username = $('#name_ass').val();
        var email = $('#email_ass').val();
        var userInputs = { 'dietID': dietID, 'comment': comment, 'username': username, 'email': email, 'rating': rating }

        // Check to make sure email hasn't already submitted review for this diet
        if (reviewsGlobal.find(element => element.Email == email) != undefined) {

            if (confirm('You have already submitted a review for this diet - would you like to replace it?')) {
                addReview(userInputs)
            } else {
                // Do nothing!
                console.log('Thing was not saved to the database.');
            }
        } else {
            addReview(userInputs)
        }

        return false;
    }


}(jQuery));



