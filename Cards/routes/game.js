
module.exports = function(io) {

    var app = require('express');
    var colors = require('colors');
    var router = app.Router();
    var GameRoom = require('../GameRoom');


    var database = require('../database.js');


    router.get('/', function(req, res, next) {
        if (req.session && req.session.userId) {

            var db = req.db.get();
            var collection = db.collection('users');
            var mongo = require('mongodb');

            collection.findOne({_id: new mongo.ObjectId(req.session.userId)}, function(err, doc) {

                if (!err) {
                    if (doc!= null) {
                        res.render('game', {
                            title: 'Cards',
                            playerName: doc.login
                        });
                    }
                    else {
                        // member doesn't exist
                        req.session.customInfo = "Accès refusé";
                        res.redirect("/");
                    }
                }
            });
        }
        else {
            // no session
            req.session.customInfo = "Accès refusé";
            res.redirect("/");
        }
    });



    var rooms = [];


    io.on('connection', function(socket) {

        console.log("New connection do game server".cyan);



        var player = {
            name: null,
            address: socket.handshake.address,
            socketId: socket.id,
            //checkForDisconnection: null,
            index: 0,
            resource: 2
        };
        var selectedRoom = null;


        var deck = [{
            name: "carte 1"
        },{
            name: "carte 2"
        }, {
            name: "carte 3"
        }, {
            name: "carte 4"
        }, {
            name: "carte 5"
        },{
            name: "carte 6"
        }, {
            name: "carte 7"
        }, {
            name: "carte 8"
        }, {
            name: "carte 9"
        }, {
            name: "carte 10"
        }];







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

            player.name = data.playerName;
            player.index = selectedRoom.players.length;

            selectedRoom.players.push(player);




            console.log("--> ".yellow + player.name.magenta + " joins  the Game in room ".yellow + selectedRoom.name);





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
            for (var i = 0; i < 4; i++) {
                var index = Math.floor(Math.random() * deck.length);
                startingHand.push(deck[index]);
                deck.splice(index, 1);

            }
            console.log(player.name.magenta + "'s starting cards".yellow);
            console.log(startingHand);
            console.log("_________________________".yellow);

            var firstPlayer = selectedRoom.players[selectedRoom.firstPlayer];


            callback({
                startingHand: startingHand,
                deck: deck.length,
                first: (player.name == firstPlayer.name)
            });
        });



        socket.on("drawsOneCard", function(data, callback) {
            var index = Math.floor(Math.random() * deck.length);
            var card = deck[index];
            deck.splice(index, 1);

            socket.in(selectedRoom.name).broadcast.emit("oppDrewOneCard", {});

            callback({
                newCard: card
            });
        });


        socket.on("endsTurn", function(data) {
            console.log("--> ".yellow + player.name.magenta + " ends his turn".yellow);

            selectedRoom.changeTurn();

            socket.in(selectedRoom.name).broadcast.emit("newTurn", {});



            var response = {};
            response[selectedRoom.players[0].name] = selectedRoom.players[0].resource;
            response[selectedRoom.players[1].name] = selectedRoom.players[1].resource;

            io.sockets.in(selectedRoom.name).emit("updatePlayersResources", response);

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



        socket.on("wins", function() {

            var db = database.get();

            var collection = db.collection("users");

            collection.findOneAndUpdate({
                login: player.name
            }, {
                $push: {games: {
                    at: new Date().getTime(),
                    victory: true
                }
            }
            });
        });


        // If it's not already launched, we launch the GameRoom setInterval
        // that will check for a disconnected player during the game;
        if (!selectedRoom.checkForDisconnectionInterval)
            selectedRoom.checkForDisconnection(io);



    });


    return router;
};
