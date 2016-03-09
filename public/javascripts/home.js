/**
 * Cleint-side JS for the home screen
 */
Zepto(function($){

    var avatarFilename = null;
    var chosenDeck = null;




    // Selection of an army
    $(".army-option").click(function() {
    	$(".army-option").removeClass("active");
    	$(this).addClass("active");
        
        var deck = $(this).attr("deckName");
       
        $.post('/users/choose-deck', {
            deck: deck
        }, function(e) {
                chosenDeck = e.deck;
        } );

    });

    // Displays the avatar picker modal
    $(".avatar").click(function() {
        $("#avatarPickerContainer").toggle();
    });


    // Selection of a new avatar
    $(".avatarContainer img").click(function() {

        setTimeout(function() {
            $("#avatarPickerContainer").toggle();
        }, 200);

        avatarFilename = $(this).attr("src");

        $("#main img").attr({
            src: avatarFilename
        });


        $.post('/users/update-avatar', {avatar: avatarFilename}, function(response) {
        });

    });


    // Starts the game
    $("#playButton").click(function(e) {
        e.preventDefault();

        if (chosenDeck) {
            window.open("/game", "_self");
        }
        else {
            alert("Vous devez d'abord choisir une armée !");
        }
    });



    // Displays the victories and defeats fo the player
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

