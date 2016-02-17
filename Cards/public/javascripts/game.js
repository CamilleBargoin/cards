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


    var socket = io('http://192.168.104.174:3000');


    socket.on('connect', function(data) {

        socket.emit("joinsGame", {playerName: playerName});

        socket.emit("startGame");

        $("#board-left button").click(function() {
            socket.emit("endsTurn", "");
        });

        $("#player-deck").click(function() {
            socket.emit("drawsCard", "");
        });

        $("#hand .card").click(function() {
            socket.emit("selectsCard", {name: $(this).attr("name")});
        });


        socket.on("newOpponent", function(data) {
            $("#board-left .player-name").first().text(data.playerName);

        });

        socket.on("startingCards", function(data) {

            console.log(data.deck);

            if (data && data.cards) {
                for (var i = 0; i < data.cards.length; i++) {
                    addCardToHand(data.cards[i]);
                    addCardToOpponent();
                }

                for (var i = 0; i < data.deck; i++) {
                    addCardToDeck($("#opponent-deck"));
                    addCardToDeck($("#player-deck"));
                }
            }
        });
    });


    var addCardToHand = function(card) {
        $card = $("<div class='card' name='" + card.name + "'>" + card.name + "</div>");
        $("#hand").append($card);
    };

    var addCardToOpponent = function() {
        $card = $("<div class='card'></div>");
        $(".top-row .hand").append($card);
    };

    var addCardToDeck = function(deck) {
        console.log("1");
        $card = $("<div class='card'></div>");
        deck.append($card);
    };


});
