Zepto(function($){




    var socket = io('http://192.168.104.174:3000');

    var opponent = null;

    var isMyTurn = false;
    var hadDrawnCard = false;

    var resource = 2;
    var cardsInHand = [];


    var $playerSide = $("#board-right .middle-row .cards-row").last();
    var $opponentSide = $("#board-right .middle-row .cards-row").first();
    var playerCardPositions = $playerSide.find(".card-box");
    var opponentCardPositions = $opponentSide.find(".card-box");
    var $selectedCard = null;


    socket.on('connect', function(data) {


        socket.on("joiningRoom", function(data) {
            console.log("connected to room: " + data.room);


            socket.emit("joinsGame", {player: player});


            socket.on("gameReady", function(data) {
                console.log("The game has started !");
                console.log(data);

                if (data.players) {
                    if (data.players[0].name == player.login)
                        opponent = data.players[1];
                    else
                        opponent = data.players[0];
                }

                $("#board-left .player-name").first().text(opponent.name);
                $("#board-left .avatar-box img").first().attr({
                    src: opponent.avatar
                });

                socket.emit("getStartingCards", {}, function(data) {



                    if (data && data.startingHand && data.deck) {

                        cardsInHand = data.startingHand;

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





                        toggleCardSelection();



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
                                cardsInHand.push(data.newCard);

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
                        console.log("updatePlayerResource: ");
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






        */
    });




    var addCardToHand = function(card) {
        var $card = $("<div class='card' name='" + card.name + "'>" + card.name + "</div>");
        $("#hand").append($card);

        toggleCardInfo();
        toggleCardSelection();
    };

    var addCardToOpponent = function() {
        var $card = $("<div class='card'></div>");
        $(".top-row .hand").append($card);
    };

    var addCardToDeck = function(deck) {
        var $card = $("<div class='card'></div>");
        deck.append($card);
    };

    var addCardToMyBoard = function(index, card) {
        var $card = $("<div class='card'>" + card.name + "</div>");
        $(playerCardPositions[index]).append($card);
    };

    var addCardToOpponentBoard = function(index, card) {
        var $card = $("<div class='card'>" + card.name + "</div>");
        $(opponentCardPositions[index]).append($card);
    };

    var removeCardFromHand = function(card) {

        card.remove();

        for(var i=0; i < cardsInHand.length; i++) {
            if (cardsInHand[i].name == $selectedCard.attr("name"))
                cardsInHand.splice(i, 1);
        }


        console.log(cardsInHand);
    };


    var toggleCardInfo = function() {

        $("#hand .card").mouseenter(function() {
            $("#info-container").css({
                bottom: "0px"
            });

            var currentCard = getCardData($(this).attr("name"));

            $("#info-container h3").html(currentCard.name.toUpperCase());

            $("#info-container p").last().html(currentCard.description);

        }).mouseleave(function(event) {
            $("#info-container").css({
                bottom: "-300px"
            });
        });

    };

    var toggleCardSelection = function() {

        /**
         *
         *  CLICK ON CARD IN HAND IN ORDER TO PLAY IT
         *
         **/


        var onclickCard  = function() {
             if ($(this).hasClass("selected")) {
                $(this).removeClass("selected");
                $("#hand .card").on("click", onclickCard);

                $.each(playerCardPositions, function(index, item) {
                    $(item).removeClass('available');
                    $(item).off("click");
                });
            }
            else {

                $(this).addClass("selected");
                $("#hand .card").off("click");
                $(this).on("click", onclickCard);

                $selectedCard = $(this);

                socket.emit("selectsCard", {name: $(this).attr("name")}, function(data) {
                    highlightOpenPositions(data.openPositions);
                });

            }
        };


        $("#hand .card").click(onclickCard);
    };


    var getCardData = function(cardName) {
        for (var i = 0; i < cardsInHand.length; i++) {
            if (cardsInHand[i].name == cardName)
                return cardsInHand[i];
        }
    };



    var highlightOpenPositions = function(openPositions) {

        for (var i = 0; i < openPositions.length; i++) {
            var $currentPosition = $(playerCardPositions[openPositions[i]]);

            $currentPosition.addClass("available");
            $currentPosition.on("click", playCard);
        }

    };

    var playCard = function() {


        if(isMyTurn) {

            var chosenPosition = $.inArray(this, playerCardPositions);

            socket.emit("playsCard", {
                name: $selectedCard.attr("name"),
                position: chosenPosition
            }, function(data) {
                if (data.error) {

                }
                else {
                    addCardToMyBoard(chosenPosition, {name: $selectedCard.attr("name")});
                    removeCardFromHand($selectedCard);

                    $(playerCardPositions);

                    $.each(playerCardPositions, function(index, item) {
                        $(item).removeClass('available');
                        $(item).off("click");
                    });

                    toggleCardSelection();

                }
            });
        }


    };


});
