
module.exports = function(io) {

    var app = require('express');
    var colors = require('colors');
    var router = app.Router();


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


    var players = [];


    io.on('connection', function(socket) {

        console.log("connected !!!!!!");

        var playerName = null;
        //console.log(socket.handshake.address);

        socket.on("joinsGame", function(data) {
            playerName = data.playerName;
            players.push(playerName);

            socket.broadcast.emit("newOpponent", {playerName: playerName});

            console.log("--> ".yellow + playerName.magenta + " joins  the Game".yellow);
        });


        socket.on("startGame", function(data) {

            var cards = [{
                name: "carte 1"
            },{
                name: "carte 2"
            }, {
                name: "carte 3"
            }, {
                name: "carte 4"
            }];

            // 1. Deals starting cards
            socket.emit("startingCards", {
                cards: cards,
                deck: 20
            });

            // 2. Determines who goes first
            console.log(players.length);

            var firstPlayer = Math.floor(Math.random() * 2);
        });

        socket.on("quitsGame", function(data) {
            console.log("--> Quit Game".magenta);
        });

        socket.on("endsTurn", function(data) {
            console.log("--> ".yellow + playerName.magenta + " ends his turn".yellow);
        });

        socket.on("drawsCard", function(data) {
            console.log("--> ".yellow + playerName.magenta + " draws a new Card".yellow);
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

    });

    return router;
};
