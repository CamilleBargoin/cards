module.exports = function(login) {

    var database = require('./database.js');


    this.name = (login)? login : null;
    var resource = null;
    this.army = null;
    this.deck = [{
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
    this.isPlaying = false; // true if its the player's turn to play


    this.address = null;
    this.socketId = null;
    this.index = null; // index of the player in the gaming room (either 0 or 1)



    this.addResource = function(number) {
        resource += number;
    };

    this.getResource = function() {
        return resource;
    };

    this.drawCards = function(number) {

        if ( this.deck.length > 0) {
            var cards = [];

            for (var i = 0; i < number; i++) {

                var index = Math.floor(Math.random() * this.deck.length);

                cards.push(this.deck[index]);
                this.deck.splice(index, 1);
            }

            return cards;
        }
    };


    this.get = function(callback) {
        var db = database.get();
        var collection = db.collection("users");

        collection.findOne({
            login: this.name
        }, function(err, doc) {
            if (!err) {
                if (callback)
                    callback(doc);
            }
        });
    };

    this.updateAvatar = function(newAvatar, callback) {

        var db = database.get();
        var collection = db.collection('users');

        collection.findOneAndUpdate({
            login: this.name
        }, {
            $set: {
                avatar: newAvatar
            }
        }, function(e) {
            if (callback)
                callback(true);
        });
    };


    this.saveGameResult = function(winner, callback) {

        var db = database.get();
        var collection = db.collection("users");

        collection.findOneAndUpdate({
            login: this.name
        }, {
            $push: {games: {
                at: new Date().getTime(),
                victory: winner
            }
        }
        }, function(err, doc) {
            if (!err) {
                if (callback)
                    callback(doc);
            }
        });

    };


    this.getGames = function(callback) {

        var db = database.get();
        var collection = db.collection("users");

        collection.findOne({
            login: this.name
        }, {
            login: 1,
            games: 1
        }, function(err, doc) {
            if (!err) {
                if (callback)
                    callback(doc);
            }
        });

    };

};
