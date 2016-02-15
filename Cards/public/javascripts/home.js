Zepto(function($){

    var avatarFilename = null;

    $(".army-option").click(function() {
    	$(".army-option").removeClass("active");
    	$(this).addClass("active");
    });


    $(".avatar").click(function() {
        console.log("haha");
        $("#avatarPickerContainer").toggle();
    });


    $(".avatarContainer img").click(function() {

        avatarFilename = $(this).attr("src");

        $("#main img").attr({
            src: avatarFilename
        });

        setTimeout(function() {
            $("#avatarPickerContainer").toggle();
        }, 200);
    });
});

