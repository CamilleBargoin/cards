Zepto(function($){


    var socket = io('http://192.168.104.174:3000');

    var opponent = null;

    var isMyTurn = false;
    var hadDrawnCard = false;

    var currentMoney = 0;
    var totalMoney = 0;

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

                if (data.players) {
                    if (data.players[0].name == player.login) {
                        opponent = data.players[1];
                        player.health = data.players[0].health;
                    }
                    else {
                        opponent = data.players[0];
                        player.health = data.players[1].health;
                    }
                }

                $("#board-left .player-name").first().text(opponent.name);
                $("#board-left .avatar-box img").first().attr({
                    src: opponent.avatar
                });

                $("#board-left .player-health").first().text(opponent.health);
                console.log($("#board-left .player-health").last());
                $("#board-left .player-health").last().text(player.health);

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
                 *  COST 1
                 *
                 **/

                $("#player-deck").click(function() {

                    if (isMyTurn && !hadDrawnCard) {
                        socket.emit("drawsOneCard", {}, function(cards) {

                            if (cards.error) {
                                alert(cards.error);
                            }
                            else {

                                hadDrawnCard = true;
                                addCardToHand(cards[0]);
                                cardsInHand.push(cards[0]);

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

                    getFreeCards(1);
                });


                var getFreeCards = function(number) {
                    socket.emit("getFreeCards", {number: number}, function(cards) {
                        if (cards.error) {
                            alert(cards.error);
                        }
                        else {
                            for (var i = 0; i < cards.length; i++) {
                                addCardToHand(cards[i]);
                                cardsInHand.push(cards[i]);
                            }
                        }
                    });
                };


                socket.on("oppDrewOneCard", function() {
                    addCardToOpponent();
                });


                socket.on("oppPlayedOneCard", function(result) {

                    if (result) {
                        var card = result.card;

                        addCardToOpponentBoard(result.position, card);
                        removeCardToOpponent();

                    }


                });


                socket.on("updatePlayersMoney",  function(data) {

                    if (data) {

                        if (data[player.login]) {
                            currentMoney = parseInt(data[player.login].current);
                            totalMoney = data[player.login].total;

                            $(".avatarContainer:last-of-type .resource-box p").text(currentMoney + "/" + totalMoney);
                        }

                        if (data[opponent.name]) {
                            var oppCurrent = data[opponent.name].current;
                            var oppTotal = data[opponent.name].total;
                            $(".avatarContainer:first-of-type .resource-box p").text(oppCurrent + "/" + oppTotal);
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


            socket.on("attackAnimation", function(data) {
                attackAnimation(true, data.index);
            });


            socket.on("oppAttackAnimation", function(data) {
                attackAnimation(false, data.index);
            });


            var attackAnimation = function(self, index) {

                var $side = null;
                var top = null;
                if (self) {
                    $side = $(playerCardPositions[index]);
                    top = "-100px";
                }
                else {
                    $side = $(opponentCardPositions[index]);
                    top = "100px";
                }

                $side.css({
                    overflow: "visible"
                });

                var $attackingCard = $($side.children()[0]);


                $attackingCard.animate({
                    backgroundColor: "red",
                    "top": top
                }, 400, 'ease-out', function() {

                    $attackingCard.animate({
                        backgroundColor: "white",
                        "top": "0px"
                    }, 400, 'ease-out', function() {
                        $side.css({
                            overflow: "hidden"
                        });
                    });
                });

            };

            socket.on("updateHealth", function(data) {
                if (data) {

                    var $side = null;
                    var card = data.card;

                    if (data.playerName == opponent.name) {
                        $side = $(opponentCardPositions[data.index]);
                    }
                    else {
                        $side = $(playerCardPositions[data.index]);
                    }

                    var $attackedCard = $($side.children()[0]);
                    $attackedCard.find("span").text(card.health);
                }
            });


            socket.on("removeDeadCards", function(data) {

                if(data) {

                    var $side = null;

                    for (var i = 0; i < data.cardLayout.length; i++) {


                        if (data.playerName == opponent.name) {
                            $side = $(opponentCardPositions[i]);
                        }
                        else {
                            $side = $(playerCardPositions[i]);
                        }

                        if (!data.cardLayout[i] ) {

                            var $deadCard = $($side.children()[0]);
                            if ($deadCard) {
                                $deadCard.fadeOut(200, function() {
                                    $(this).remove();
                                });
                            }

                        }

                    }

                }
            });


            socket.on("attackedHero", function(data) {
                if (data) {

                    if (data.playerName == opponent.name) {
                        $("#board-left .player-health").first().text(data.health);
                        console.log("l'adversaire a " + data.health + " pv");
                    }
                    else {
                        $("#board-left .player-health").last().text(data.health);
                        console.log("il me reste " + data.health+ " pv");
                    }
                }
            });

        });

    });




    var addCardToHand = function(card) {
        var $card = $("<div class='card' name='" + card.name + "'>" +
            card.name +
            "<br/>coût: " + card.cost +
            "<br/>force: " + card.attack +
            "<br/>pv: " + card.health +
            "</div>");
        $("#hand").append($card);

        toggleCardInfo();
        toggleCardSelection();
    };

    var addCardToOpponent = function() {
        var $card = $("<div class='card'></div>");
        $(".top-row .hand").append($card);
    };

    var removeCardToOpponent = function() {
         $(".top-row .hand .card").last().remove();
    };

    var addCardToDeck = function(deck) {
        var $card = $("<div class='card'></div>");
        deck.append($card);
    };

    var addCardToMyBoard = function(index, card) {
        var $card = $("<div class='card'>" + card.name +
            "<br/>coût: " + card.cost +
            "<br/>force: " + card.attack +
            "<br/>pv: <span class='card-health'>" + card.health + "</span>" +
            "</div>");
        $(playerCardPositions[index]).append($card);
    };

    var addCardToOpponentBoard = function(index, card) {
        var $card = $("<div class='card'>" + card.name +
            "<br/>coût: " + card.cost +
            "<br/>force: " + card.attack +
            "<br/>pv:  <span class='card-health'>" + card.health + "</span>" +
            "</div>");
        $(opponentCardPositions[index]).append($card);
    };

    var removeCardFromHand = function(card) {

        card.remove();

        for(var i=0; i < cardsInHand.length; i++) {
            if (cardsInHand[i].name == $selectedCard.attr("name"))
                cardsInHand.splice(i, 1);
        }

        //console.log(cardsInHand);
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
                    alert(data.error);
                }
                else {

                    addCardToMyBoard(chosenPosition, data);
                    removeCardFromHand($selectedCard);

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
