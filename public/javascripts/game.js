Zepto(function($){




    var socket = io('http://192.168.104.174:3000');

    var opponent = null;

    var isMyTurn = false;
    var hadDrawnCard = false;

    var resource = 2;


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



                    if (data && data.startingHand && data.deck) {
                        for (var i = 0; i < data.startingHand.length; i++) {
                            addCardToHand(data.startingHand[i]);
                            addCardToOpponent();
                        }

                        for (var i = 0; i < data.deck; i++) {
                            addCardToDeck($("#opponent-deck"));
                            addCardToDeck($("#player-deck"));
                        }


                        isMyTurn = data.first;

                        if (isMyTurn) {
                            $(".avatarContainer:last-of-type .avatar-box").css({
                                border: "5px solid red"
                            });
                        }
                        else {
                            $(".avatarContainer:first-of-type .avatar-box").css({
                                border: "5px solid red"
                            });
                        }


                        toggleCardInfo();






                    }


                });










                /**
                 *
                 *  CLICK ON DECK TO DRAW A NEW CARD
                 *  ONCE PER TURN ONLY
                 *
                 **/


                $("#player-deck").click(function() {

                    if (isMyTurn && !hadDrawnCard) {
                        socket.emit("drawsOneCard", {}, function(data) {
                            if (data && data.newCard) {

                                hadDrawnCard = true;
                                addCardToHand(data.newCard);

                                $("#player-deck .card:last-of-type ").remove();
                            }
                        });
                    }
                });




                /**
                 *
                 *  CLICK ON END TURN BUTTON
                 *
                 ***/

                $("#board-left button").click(function() {

                    if (isMyTurn) {
                        socket.emit("endsTurn", "");
                        isMyTurn = false;
                        $(".avatarContainer:last-of-type .avatar-box").css({
                            border: "none"
                        });
                        $(".avatarContainer:first-of-type .avatar-box").css({
                            border: "5px solid red"
                        });
                    }

                });


                socket.on("newTurn", function() {
                    isMyTurn = true;
                    hadDrawnCard = false;
                    $(".avatarContainer:last-of-type .avatar-box").css({
                        border: "5px solid red"
                    });
                    $(".avatarContainer:first-of-type .avatar-box").css({
                        border: "none"
                    });




                });

                socket.on("oppDrewOneCard", function() {
                    addCardToOpponent();
                });


                socket.on("updatePlayersResources",  function(data) {

                    if (data) {
                        console.log(data);

                        if (data[playerName]) {
                            resource = data[playerName];
                            $(".avatarContainer:last-of-type .resource-box p").text(resource);
                        }
                        if (data[opponent]) {
                            $(".avatarContainer:first-of-type .resource-box p").text(data[opponent]);
                        }
                    }

                });




            });

            socket.on("disconnected", function() {

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
        $card = $("<div class='card'></div>");
        deck.append($card);
    };


    var toggleCardInfo = function() {



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

    };


});
