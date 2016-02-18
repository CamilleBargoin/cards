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

    var opponent = null;


    socket.on('connect', function(data) {


        socket.on("joiningRoom", function(data) {
            console.log("connected to room: " + data.room);

            socket.emit("joinsGame", {playerName: playerName});




            socket.on("gameReady", function(data) {
                console.log("The game has started !");

                if (data.players) {
                    if (data.players[0].name == playerName)
                        opponent = data.players[1].name;
                    else
                        opponent = data.players[0].name;
                }

                $("#board-left .player-name").first().text(opponent);

                socket.emit("getStartingCards", {}, function(data) {

                   //console.log(data.deck);

                    if (data && data.startingHand && data.deck) {
                        for (var i = 0; i < data.startingHand.length; i++) {
                            addCardToHand(data.startingHand[i]);
                            addCardToOpponent();
                        }

                        for (var i = 0; i < data.deck; i++) {
                            addCardToDeck($("#opponent-deck"));
                            addCardToDeck($("#player-deck"));
                        }
                    }
                });



                $("#player-deck").click(function() {
                    socket.emit("drawsCard", {}, function(data) {
                        if (data && data.newCard && deck) {
                            addCardToHand(data.newCard);
                        }
                    });
                });


            });

            socket.on("disconnected", function() {
                //alert("disconnected :(");
                $("#disconnectionContainer").css({
                    display: "table"
                });


                socket.emit("wins");

            });


        });


        /*
        socket.emit("joinsGame", {playerName: playerName});

        socket.emit("startGame");

        $("#board-left button").click(function() {
            socket.emit("endsTurn", "");
        });



        $("#hand .card").click(function() {
            socket.emit("selectsCard", {name: $(this).attr("name")});
        });


        */
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
