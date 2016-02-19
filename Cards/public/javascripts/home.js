Zepto(function($){

    var avatarFilename = null;
    var deckName = null;

    $(".army-option").click(function() {
    	$(".army-option").removeClass("active");
    	$(this).addClass("active");
        deckName = $(this).attr("deckName");

        console.log("selected deck: " + deckName);

        $.post('/users/choose-deck', {
            deckName: deckName
        } );

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

    $("#playButton").click(function(e) {
        e.preventDefault();
        if (deckName) {
            alert("start game with " + army);

            window.open("/game", "_self");
        }
    });



    var victories = 0;
    for (var i = 0; i < games.length; i++) {

        var $gameLi = null;
        var $gameResult = null;
        var $gameDate = null;

        if (games[i].victory) {

            $gameLi = $("<li class='score'></li>");
            $gameResult = $("<p class='result'>Victoire</p>");

            victories++;
        }
        else {
            $gameLi = $("<li class='score defeat'></li>");
            $gameResult = $("<p class='result'>Défaite</p>");
        }

        $gameDate = $("<p class='date'>" + new Date(games[i].at).toLocaleDateString() + "</p>");



        $gameLi.append($gameDate);
        $gameLi.append($gameResult);


        $(".scores ul").append($gameLi);
    }

    var ratio = victories / games.length * 100;

    $("#accountVictories").text("Victoires: " + Math.round(ratio*100)/100+ "%");

});

