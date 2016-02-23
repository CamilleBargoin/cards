
module.exports = function(io) {

    var app = require('express');
    var colors = require('colors');
    var router = app.Router();
    var GameRoom = require('../GameRoom');
    var Player = require('../Player');
    var Card = require('../Card');

    var rooms = [];
    var player = null;


    router.get('/', function(req, res, next) {

        if (req.session && req.session.login) {

            player = new Player(req.session.player);

            player.generateDeck();

            player.get(function(user) {

                if (user) {
                   res.render('game', {
                        player: {
                            login: user.login,
                            deckName: user.deckName,
                            avatar: user.avatar
                        },
                        title: 'Cards'
                    });

                }
                else {
                    // member doesn't exist
                    req.session.customInfo = "Accès refusé";
                    res.redirect("/");
                }
            });
        }
        else {
            // no session
            req.session.customInfo = "Accès refusé";
            res.redirect("/");
        }
    });


    io.on('connection', function(socket) {


        console.log("New connection to game server".cyan);

        player.address = socket.handshake.address;
        player.socketId = socket.id;
        player.index = 0;
        player.addTotalMoney(2);
        player.resetCurrentMoney();

        var selectedRoom = null;


        // Looking for a room with less than 2 players
        // If on is found, we select it
        for(var i = 0; i < rooms.length; i++) {

            if (rooms[i] && rooms[i].players.length < 2) {
                selectedRoom = rooms[i];
                break;
            }
        }

        // If no room was found, we create a new one, select it and add it to the rooms array
        if (!selectedRoom) {
            selectedRoom = new GameRoom();
            rooms.push(selectedRoom);
        }


        // Finally the client joins the selected room;
        socket.join(selectedRoom.name);


        // Indicate the client which rooms he is affected to
        socket.emit("joiningRoom", {room: selectedRoom.name});

        socket.on("joinsGame", function(data) {

            //player.name = data.playerName;
            player.index = selectedRoom.players.length;
            socket.index = player.index;

            selectedRoom.players.push(player);

            console.log(data);
            console.log("_________".red);


            console.log("--> ".yellow + data.player.login.magenta + " joins  the Game in room ".yellow + selectedRoom.name);


            // If the current room is full (2 players), we can start the game


            if (selectedRoom.players.length == 2) {

                var playersAvatar = [{
                    name:  selectedRoom.players[0].name,
                    avatar: selectedRoom.players[0].avatar
                },
                {
                    name:  selectedRoom.players[1].name,
                    avatar: selectedRoom.players[1].avatar
                }];

                io.sockets.in(selectedRoom.name).emit("gameReady", {players: playersAvatar});
                displayPlayersMoney();
            }
        });


        socket.on("getStartingCards", function(data, callback) {
            var startingHand = [];

            var currentPlayer = selectedRoom.players[socket.index];
            startingHand = currentPlayer.drawCards(4);

            console.log(currentPlayer.name.magenta + "'s starting cards".yellow);
            console.log(startingHand);
            console.log("_________________________".yellow);

            var firstPlayer = selectedRoom.players[selectedRoom.firstPlayer];


            callback({
                startingHand: startingHand,
                deck: currentPlayer.deck.length,
                first: (currentPlayer.name == firstPlayer.name)
            });
        });


        socket.on("drawsOneCard", function(data, callback) {



            var currentPlayer = selectedRoom.players[socket.index];
            var result = currentPlayer.drawCardsForMoney(1);



            // callback({
            //     newCard: card
            // });

            callback(result);

            if (!result.error) {
                socket.in(selectedRoom.name).broadcast.emit("oppDrewOneCard", {});

                displayPlayersMoney();
            }
            else {
                console.log(result.error);
            }
        });


        socket.on("selectsCard", function(data, callback) {

            var currentPlayer = selectedRoom.players[socket.index];

            console.log("--> ".yellow + currentPlayer.name.magenta + " selects ".yellow + data.name.magenta);


            var openPositions = currentPlayer.getOpenCardPositions();


            callback({
                openPositions: openPositions
            });

        });



        socket.on("playsCard", function(data, callback) {

            var currentPlayer = selectedRoom.players[socket.index];
            var result = currentPlayer.playCard(data.name);

            callback(result);

            if (!result.error) {

                console.log("--> ".yellow + currentPlayer.name.magenta + " plays ".yellow + data.name.magenta);

                socket.in(selectedRoom.name).broadcast.emit("oppPlayedOneCard", {
                    name: result.name,
                    position: data.position
                });

                displayPlayersMoney();
            }
            else {
                console.log(result.error);
            }


        });


        socket.on("endsTurn", function(data) {

            var currentPlayer = selectedRoom.players[socket.index];
            console.log("--> ".yellow + currentPlayer.name.magenta + " ends his turn".yellow);

            selectedRoom.changeTurn();

            socket.in(selectedRoom.name).broadcast.emit("newTurn", {});


            displayPlayersMoney();
        });


         socket.on("wins", function() {

            var currentPlayer = selectedRoom.players[socket.index];
            currentPlayer.saveGameResult(true);
        });


         var displayPlayersMoney = function() {
            var response = {};
            response[selectedRoom.players[0].name] = {
                current: selectedRoom.players[0].getCurrentMoney() + "",
                total: selectedRoom.players[0].getTotalMoney()
            };
            response[selectedRoom.players[1].name] = {
                current: selectedRoom.players[1].getCurrentMoney() + "",
                total: selectedRoom.players[1].getTotalMoney()
            };

            io.sockets.in(selectedRoom.name).emit("updatePlayersMoney", response);
         };


        // If it's not already launched, we launch the GameRoom setInterval
        // that will check for a disconnected player during the game;
        if (!selectedRoom.checkForDisconnectionInterval)
            selectedRoom.checkForDisconnection(io);

    });



    /*
        socket.on("quitsGame", function(data) {
            console.log("--> Quit Game".magenta);
        });

        socket.on("playsCard", function(data) {
            console.log("--> ".yellow + playerName.magenta + " plays ".yellow + data.name.magenta);
        });

        socket.on("wins", function(data) {
            console.log("--> ".yellow + playerName.magenta + " wins !".yellow);
        });
    */

    return router;
};
