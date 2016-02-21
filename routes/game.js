
module.exports = function(io) {

    var app = require('express');
    var colors = require('colors');
    var router = app.Router();
    var GameRoom = require('../GameRoom');
    var Player = require('../Player');

    var rooms = [];
    var player = null;


    router.get('/', function(req, res, next) {
        if (req.session && req.session.login) {

            player = new Player(req.session.login);

            player.get(function(user) {

                if (user) {
                   res.render('game', {
                        title: 'Cards',
                        playerName: user.login
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
        player.resource = 2;

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




            console.log("--> ".yellow + data.playerName.magenta + " joins  the Game in room ".yellow + selectedRoom.name);





            // If the current room is full (2 players), we can start the game


            if (selectedRoom.players.length == 2) {

                var playersName = [{
                    name:  selectedRoom.players[0].name
                },
                {
                    name:  selectedRoom.players[1].name
                }];

                io.sockets.in(selectedRoom.name).emit("gameReady", {players: playersName});
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
            var card = currentPlayer.drawCards(1)[0];

            socket.in(selectedRoom.name).broadcast.emit("oppDrewOneCard", {});

            callback({
                newCard: card
            });
        });


        socket.on("endsTurn", function(data) {

            var currentPlayer = selectedRoom.players[socket.index];
            console.log("--> ".yellow + currentPlayer.name.magenta + " ends his turn".yellow);

            selectedRoom.changeTurn();

            socket.in(selectedRoom.name).broadcast.emit("newTurn", {});

            var response = {};
            response[selectedRoom.players[0].name] = selectedRoom.players[0].resource;
            response[selectedRoom.players[1].name] = selectedRoom.players[1].resource;

            io.sockets.in(selectedRoom.name).emit("updatePlayersResources", response);

        });




         socket.on("wins", function() {

            var currentPlayer = selectedRoom.players[socket.index];
            currentPlayer.saveGameResult(true);
        });


        // If it's not already launched, we launch the GameRoom setInterval
        // that will check for a disconnected player during the game;
        if (!selectedRoom.checkForDisconnectionInterval)
            selectedRoom.checkForDisconnection(io);

    });



/*


        socket.on("quitsGame", function(data) {
            console.log("--> Quit Game".magenta);
        });



        socket.on("selectsCard", function(data) {
            console.log("--> ".yellow + playerName.magenta + " selects ".yellow + data.name.magenta);
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
