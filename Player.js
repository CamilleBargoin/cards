module.exports = function(playerData) {

    var database = require('./database.js');
    var Card = require('./Card.js');


    this.name = (playerData.login)? playerData.login : null;
    this.registrationDate = (playerData.at)? playerData.at : null;

    var totalMoney = null;
    var currentMoney = null;
    var health = (playerData.health)? playerData.health : 0;
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
        return totalMoney;
    };

    this.getTotalMoney = function() {
        return totalMoney;
    };

    this.addCurrentMoney = function(number) {
        currentMoney += number;
        return currentMoney;
    };

    this.getCurrentMoney = function() {
        return currentMoney;
    };

    this.resetCurrentMoney = function() {
        currentMoney = totalMoney;
        return currentMoney;
    };

    this.getHealth = function() {
        return health;
    };


    this.updateHealth = function(number) {
        health += number;
        return health;
    }

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


    this.drawCardsForMoney = function(number) {

        if ( this.deck.length > 0) {
            var cards = [];

            for (var i = 0; i < number; i++) {

                if (currentMoney >= 1) {
                    var index = Math.floor(Math.random() * this.deck.length);

                    currentMoney --;
                    cards.push(this.deck[index]);
                    this.deck.splice(index, 1);
                }
                else {
                   return {error: "not enough money"};
                }
            }

            this.hand = this.hand.concat(cards);

            return cards;
        }
        else {
            return {error: "empty deck"};
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
                new Card({name: "Archer", cost: 2, health: 1, attack: 2}),
                new Card({name: "Archer", cost: 2, health: 1, attack: 2}),
                new Card({name: "Archer", cost: 2, health: 1, attack: 2}),
                new Card({name: "Archer", cost: 2, health: 1, attack: 2}),
                new Card({name: "Fantassin", cost: 2, health: 2, attack: 1}),
                new Card({name: "Fantassin", cost: 2, health: 2, attack: 1}),
                new Card({name: "Fantassin", cost: 2, health: 2, attack: 1}),
                new Card({name: "Fantassin", cost: 2, health: 2, attack: 1}),
                new Card({name: "Chevalier", cost: 3, health: 3, attack: 2}),
                new Card({name: "Chevalier", cost: 3, health: 3, attack: 2}),
                new Card({name: "Chevalier", cost: 3, health: 3, attack: 2}),
                new Card({name: "Mercenaire", cost: 4, health: 3, attack: 3}),
                new Card({name: "Mercenaire", cost: 4, health: 3, attack: 3}),
                new Card({name: "Mercenaire", cost: 4, health: 3, attack: 3}),
                new Card({name: "Sorcier", cost: 5, health: 2, attack: 5}),
                new Card({name: "Sorcier", cost: 5, health: 2, attack: 5}),
                new Card({name: "Commandant", cost: 5, health: 4, attack: 4}),
                new Card({name: "Commandant", cost: 5, health: 4, attack: 4}),
                new Card({name: "Héro", cost: 6, health: 5, attack: 6}),
                new Card({name: "Héro", cost: 6, health: 5, attack: 6})
            ];
        }
        else if (this.deckName == "monsters") {


             this.deck = [
                new Card({name: "Goule", cost: 1, health: 1, attack: 1}),
                new Card({name: "Goule", cost: 1, health: 1, attack: 1}),
                new Card({name: "Goule", cost: 1, health: 1, attack: 1}),
                new Card({name: "Goule", cost: 1, health: 1, attack: 1}),
                new Card({name: "Squelette", cost: 2, health: 1, attack: 2}),
                new Card({name: "Squelette", cost: 2, health: 1, attack: 2}),
                new Card({name: "Squelette", cost: 2, health: 1, attack: 2}),
                new Card({name: "Squelette", cost: 2, health: 1, attack: 2}),
                new Card({name: "Troll", cost: 3, health: 3, attack: 2}),
                new Card({name: "Troll", cost: 3, health: 3, attack: 2}),
                new Card({name: "Troll", cost: 3, health: 3, attack: 2}),
                new Card({name: "Possédé", cost: 4, health: 2, attack: 3}),
                new Card({name: "Possédé", cost: 4, health: 2, attack: 3}),
                new Card({name: "Possédé", cost: 4, health: 2, attack: 3}),
                new Card({name: "Spectre", cost: 5, health: 3, attack: 4}),
                new Card({name: "Spectre", cost: 5, health: 3, attack: 4}),
                new Card({name: "Dragon", cost: 6, health: 5, attack: 5}),
                new Card({name: "Dragon", cost: 6, health: 5, attack: 5}),
                new Card({name: "Démon", cost: 7, health: 5, attack: 7}),
                new Card({name: "Démon", cost: 7, health: 5, attack: 7})
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

        for (var i = 0; i < this.hand.length; i++) {


            // TODO: change check on name to ID
            if (cardId == this.hand[i].name) {

                cardToPlay = this.hand[i];

                if (currentMoney >= cardToPlay.cost) {
                    this.hand.splice(i, 1);
                    currentMoney -= cardToPlay.cost;

                    this.cardLayout[parseInt(position)] = cardToPlay;

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

    this.removeDeadCards = function() {

        for (var i = 0; i < this.cardLayout.length; i++) {
            if (this.cardLayout[i] && this.cardLayout[i].health <= 0)
                this.cardLayout[i] = null;
        }
    };

};
