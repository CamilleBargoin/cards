module.exports = function(playerData) {

    var database = require('./database.js');
    var Card = require('./Card.js');


    this.name = (playerData.login)? playerData.login : null;
    this.registrationDate = (playerData.at)? playerData.at : null;

    var resource = null;
    this.deckName = (playerData.deckName)? playerData.deckName : null;
    this.deck = [];
    this.avatar = (playerData.avatar)? playerData.avatar : null;
    this.isPlaying = false; // true if its the player's turn to play


    this.address = null;
    this.socketId = null;
    this.index = null; // index of the player in the gaming room (either 0 or 1)

    this.cardLayout = [null, null, null, null, null];



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

        this.avatar = newAvatar;

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


    this.generateDeck = function() {

        if (this.deckName == "humans") {

            this.deck = [
                new Card({name: "Archer"}),
                new Card({name: "Archer"}),
                new Card({name: "Archer"}),
                new Card({name: "Archer"}),
                new Card({name: "Fantassin"}),
                new Card({name: "Fantassin"}),
                new Card({name: "Fantassin"}),
                new Card({name: "Fantassin"}),
                new Card({name: "Chevalier"}),
                new Card({name: "Chevalier"}),
                new Card({name: "Chevalier"}),
                new Card({name: "Mercenaire"}),
                new Card({name: "Mercenaire"}),
                new Card({name: "Mercenaire"}),
                new Card({name: "Sorcier"}),
                new Card({name: "Sorcier"}),
                new Card({name: "Commandant"}),
                new Card({name: "Commandant"}),
                new Card({name: "Héro"}),
                new Card({name: "Héro"})
            ];
        }
        else if (this.deckName == "monsters") {


             this.deck = [
                new Card({name: "Goule"}),
                new Card({name: "Goule"}),
                new Card({name: "Goule"}),
                new Card({name: "Goule"}),
                new Card({name: "Squelette"}),
                new Card({name: "Squelette"}),
                new Card({name: "Squelette"}),
                new Card({name: "Squelette"}),
                new Card({name: "Troll"}),
                new Card({name: "Troll"}),
                new Card({name: "Troll"}),
                new Card({name: "Possédé"}),
                new Card({name: "Possédé"}),
                new Card({name: "Possédé"}),
                new Card({name: "Spectre"}),
                new Card({name: "Spectre"}),
                new Card({name: "Dragon"}),
                new Card({name: "Dragon"}),
                new Card({name: "Démon"}),
                new Card({name: "Démon"})
            ];
        }

    };


    this.getOpenCardPositions = function() {
        var result = [];
        for (var i =0; i < this.cardLayout.length; i++) {
            if ( !this.cardLayout[i]) {
                result.push(i);
            }
        }

        return result;
    };

};
