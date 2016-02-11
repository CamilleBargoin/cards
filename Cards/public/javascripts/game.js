Zepto(function($){



    $("#hand .card").mouseenter(function() {

        $("#info-container").css({
            bottom: "0px"
        });

        $("#info-container h3").html($(this).attr("name").toUpperCase());

    }).mouseleave(function(event) {
             $("#info-container").css({
            bottom: "-500px"
        });
    });
});
