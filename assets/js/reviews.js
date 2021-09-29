

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
            success: pullAll,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error pulling data: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
            }
        });

    });

    // function to build page
    function populateInitial() {

        ///////////////////////////////////// This could all be done by Lambda function - maybe change later //////////////////////////////////

        //////////////////////////////////////// Later will add user filters //////////////////////////////////////

        // First aggregate reviews by dietID - need average rating and number
        var dietAgg = dietDB.responseJSON.values.map(x => x[13])
        dietAgg[0] = [dietAgg[0], 'sum', 'count', 'ave']
        // dietAgg = [dietAgg,[],[],[]]
        for (i = 1; i < dietAgg.length; i++) {
            dietAgg[i] = [dietAgg[i], 0, 0, 0]
        }

        // Go through every review and add review and count
        for (i = 0; i < reviewsGlobal.length; i++) {
            var id = reviewsGlobal[i].DietID
            dietAgg[id][1] = dietAgg[id][1] + parseFloat(reviewsGlobal[i].Rating)
            dietAgg[id][2] = dietAgg[id][2] + 1
        }

        // Calc average at end
        for (i = 1; i < dietAgg.length; i++) {
            if (dietAgg[i][2] > 0) {
                dietAgg[i][3] = dietAgg[i][1] / dietAgg[i][2]
            }
        }

        // Sort diets highest rating to lowest
        var dietAgg = dietAgg.sort(function (a, b) {
            return b[3] - a[3];
        });

        /////////////////////////////////////////////////////////////////////////////////////////////////

        // How many diets per page? - Show them all!
        for (aa = 1; aa < dietAgg.length; aa++) {
            var dbRow = dietAgg[aa][0];
            var a = '<li><div style="display: flex;" id="diet' + dietAgg[aa][0] + '"><div style="flex: content; margin: 5px; max-width: min(150px, 20%);"><span class="image fit"><img src="images/' + dietDB.responseJSON.values[dbRow][15] + '" alt=""></span></div>'
            var b = '<div style="margin: 5px; font-size: 10pt;"><b><a href="reviewdetails.html?diet=' + dietAgg[aa][0] + '" style="font-size: 16pt; color: darkorange; text-decoration: none;">' + dietDB.responseJSON.values[dbRow][0] + '</a></b><br>'
            // Create correct num of checked stars
            var stars = []
            for (ii = 1; ii < 6; ii++) {
                if (parseFloat(dietAgg[aa][3]) >= (ii - 0.5)) {
                    stars.push('<span class="fa fa-star checked"></span>')
                } else {
                    stars.push('<span class="fa fa-star"></span>')
                }
            }
            stars = stars.join('')
            var c = stars + '&nbsp;' + dietAgg[aa][2] + ' reviews<br>'
            var d = '<div style="margin-top: 2px; margin-bottom: 2px;"><span><b>' + dietDB.responseJSON.values[dbRow][16] + '</b></span><br></div>'
            // Add the tags

            if (dietDB.responseJSON.values[dbRow][17] != undefined) {
                var tags = dietDB.responseJSON.values[dbRow][17].split(',')
                var tagsCopy = []
                for (ii = 0; ii < tags.length; ii++) {
                    tagsCopy.push('<i class="fa fa-check" aria-hidden="true" style="color: green;">' + tags[ii] + '</i>')
                }
                tagsCopy = tagsCopy.join('')
                var e = '<div style="margin-bottom: 2px;">' + tagsCopy + '<br></div>'
            } else {
                var e = ''
            }
            var f = dietDB.responseJSON.values[dbRow][14] + '<br>'
            var g = '<a class="button special small" href="reviewdetails.html?diet=' + dietAgg[aa][0] + '" style="margin-top: 2px;">&nbsp;See Reviews / Rank This Diet&nbsp;</a><br></div></div></li>'
            var newReview = a + b + c + d + e + f + g
            $("#reviewList").append(newReview);
        }

        // After diets load add event listeners for click on any part of list item
        // for (aa = 1; aa < dietAgg.length; aa++) {
        //     var id = '#diet'.concat(aa)
        //     var location = 'reviewdetails.html?diet='.concat(aa)
        //     $(id).click(function () {
        //         window.location = location;
        //     });
        // }

    }

    function pullAll(dietID) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/review',
            headers: {},
            data: JSON.stringify({
                Actions: 'pullAll'
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

}(jQuery));



