module.exports = function(playerData) {

    var database = require('./database.js');
    var Card = require('./Card.js');


    this.name = (playerData.login)? playerData.login : null;
    this.registrationDate = (playerData.at)? playerData.at : null;

    var totalMoney = null;
    var currentMoney = null;
    this.deckName = (playerData.deckName)? playerData.deckName : null;
    this.deck = [];
    this.hand = [];
    this.avatar = (playerData.avatar)? playerData.avatar : null;
    this.isPlaying = false; // true if its the player's turn to play


    this.address = null;
    this.socketId = null;
    this.index = null; // index of the player in the gaming room (either 0 or 1)

    this.cardLayout = [null, null, null, null, null];



    this.addTotalMoney = function(number) {
        totalMoney += number;
    };

    this.getTotalMoney = function() {
        return totalMoney;
    };

    this.addCurrentMoney = function(number) {
        currentMoney += number;
    };

    this.getCurrentMoney = function() {
        return currentMoney;
    };

    this.resetCurrentMoney = function() {
        currentMoney = totalMoney;
    };

    this.drawCards = function(number) {

        if ( this.deck.length > 0) {
            var cards = [];

            for (var i = 0; i < number; i++) {

                var index = Math.floor(Math.random() * this.deck.length);

                cards.push(this.deck[index]);
                this.deck.splice(index, 1);
            }

            this.hand = this.hand.concat(cards);

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
                new Card({name: "Archer", cost: 2}),
                new Card({name: "Archer", cost: 2}),
                new Card({name: "Archer", cost: 2}),
                new Card({name: "Archer", cost: 2}),
                new Card({name: "Fantassin", cost: 2}),
                new Card({name: "Fantassin", cost: 2}),
                new Card({name: "Fantassin", cost: 2}),
                new Card({name: "Fantassin", cost: 2}),
                new Card({name: "Chevalier", cost: 3}),
                new Card({name: "Chevalier", cost: 3}),
                new Card({name: "Chevalier", cost: 3}),
                new Card({name: "Mercenaire", cost: 4}),
                new Card({name: "Mercenaire", cost: 4}),
                new Card({name: "Mercenaire", cost: 4}),
                new Card({name: "Sorcier", cost: 5}),
                new Card({name: "Sorcier", cost: 5}),
                new Card({name: "Commandant", cost: 5}),
                new Card({name: "Commandant", cost: 5}),
                new Card({name: "Héro", cost: 6}),
                new Card({name: "Héro", cost: 6})
            ];
        }
        else if (this.deckName == "monsters") {


             this.deck = [
                new Card({name: "Goule", cost: 1}),
                new Card({name: "Goule", cost: 1}),
                new Card({name: "Goule", cost: 1}),
                new Card({name: "Goule", cost: 1}),
                new Card({name: "Squelette", cost: 2}),
                new Card({name: "Squelette", cost: 2}),
                new Card({name: "Squelette", cost: 2}),
                new Card({name: "Squelette", cost: 2}),
                new Card({name: "Troll", cost: 3}),
                new Card({name: "Troll", cost: 3}),
                new Card({name: "Troll", cost: 3}),
                new Card({name: "Possédé", cost: 4}),
                new Card({name: "Possédé", cost: 4}),
                new Card({name: "Possédé", cost: 4}),
                new Card({name: "Spectre", cost: 5}),
                new Card({name: "Spectre", cost: 5}),
                new Card({name: "Dragon", cost: 5}),
                new Card({name: "Dragon", cost: 5}),
                new Card({name: "Démon", cost: 6}),
                new Card({name: "Démon", cost: 6})
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

    this.playCard = function(cardId, position) {
        var cardToPlay = null;

        console.log(this.hand);
        for (var i = 0; i < this.hand.length; i++) {

            console.log(cardId + " : " +this.hand[i].name );

            // TODO: change check on name to ID
            if (cardId == this.hand[i].name) {

                cardToPlay = this.hand[i];

                if (currentMoney >= cardToPlay.cost) {
                    this.hand.splice(i, 1);
                    currentMoney -= cardToPlay.cost;

                    this.cardLayout[position] = cardToPlay;

                }
                else {
                    // ERROR: not enough money
                    return {error: "not enough money"};
                }

                    break;
            }



        }
        // END FOR

        if (!cardToPlay) {
            // ERROR: card is not in hand
            return {error: "card is not in hand"};
        }

        return cardToPlay;


    };

};
