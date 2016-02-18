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

    $("#playButton").click(function() {
        if (army) {
            alert("start game with " + army);
        }

    });



    var victories = 0;
    for (var i = 0; i < games.length; i++) {

        var $gameLi = null;
        var $gameResult = null;
        var $gameDate = null;

        if (games[i].victory) {

            $gameLi = $("<li class='score'></li>");
            $gameResult = $("<p class='result'>Victoire !</p>");

            victories++;
        }
        else {
            gameLi = $("<li class='score defeat'></li>");
            $gameResult = $("<p class='result'>Défaite !</p>");
        }

        $gameDate = $("<p class='date'>" + new Date(games[i].at).toLocaleDateString() + "</p>");


        $gameLi.append($gameResult);
        $gameLi.append($gameDate);


        $(".scores ul").append($gameLi);
    }

    $("#accountVictories").text("Victoires: " + victories / games.length * 100 + "%");

});

