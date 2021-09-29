function comm_change() {
    if (document.getElementById('comm2').selected == true) {
        document.getElementById("comm_plan_div").innerHTML =
            '<br><b>Are you willing to eat prepared meals and shakes shipped to your home?</b><br><div class="select-wrapper" style="width: 300px; margin: 0 auto;"><select name="prepared" id="prepared_ass"><option value="1" selected>No</option><option value="5">Yes</option></select></div><br>'
    } else {
        document.getElementById("comm_plan_div").innerHTML = '';
    }
}


(function inputScopeWrapper($) {
    $('.rating input').change(function () {
        var $radio = $(this);
        $('.rating .selected').removeClass('selected');
        $radio.closest('label').addClass('selected');
    });

}(jQuery));



