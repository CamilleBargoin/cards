Zepto(function($){

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

});