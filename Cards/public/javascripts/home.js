Zepto(function($){

    var avatarFilename = null;
    var army = null;

    $(".army-option").click(function() {
    	$(".army-option").removeClass("active");
    	$(this).addClass("active");
        army = $(this).attr("army");

        console.log("selected army: " + army);
    });


    $(".avatar").click(function() {
        $("#avatarPickerContainer").toggle();
    });


    $(".avatarContainer img").click(function() {

        setTimeout(function() {
            $("#avatarPickerContainer").toggle();
        }, 200);

        avatarFilename = $(this).attr("src");

        $("#main img").attr({
            src: avatarFilename
        });


        $.post('/users/update-avatar', {avatar: avatarFilename}, function(response) {
            console.log(response);
        });

    });


});

