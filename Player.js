module.exports = function(playerData) {

    var database = require('./database.js');
    var Card = require('./Card.js');


    this.name = (playerData.login)? playerData.login : null;
    this.registrationDate = (playerData.at)? playerData.at : null;

    this.totalMoney = 0;
    this.currentMoney = 0;
    this.health = 20;
    this.deckName = (playerData.deckName)? playerData.deckName : null;
    this.deck = [];
    this.hand = [];
    this.avatar = (playerData.avatar)? playerData.avatar : null;
    this.isPlaying = false; // true if its the player's turn to play


    this.address = null;
    this.socketId = null;
    this.index = null; // index of the player in the gaming room (either 0 or 1)

    this.cardLayout = [null, null, null, null, null];


    this.resetCurrentMoney = function() {
        this.currentMoney = this.totalMoney;
        return this.currentMoney;
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


    this.drawCardsForMoney = function(number) {

        if ( this.deck.length > 0) {
            var cards = [];

            for (var i = 0; i < number; i++) {

                if (this.currentMoney >= 1) {
                    var index = Math.floor(Math.random() * this.deck.length);

                    this.currentMoney --;
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
                new Card({name: "Écuyer", cost: 1, health: 1, attack: 1, src: "/armies/humans/ecuyer.jpg"}),
                new Card({name: "Écuyer", cost: 1, health: 1, attack: 1, src: "/armies/humans/ecuyer.jpg"}),
                new Card({name: "Écuyer", cost: 1, health: 1, attack: 1, src: "/armies/humans/ecuyer.jpg"}),

                new Card({name: "Archer", cost: 2, health: 1, attack: 2, src: "/armies/humans/archer.jpg"}),
                new Card({name: "Archer", cost: 2, health: 1, attack: 2, src: "/armies/humans/archer.jpg"}),
                new Card({name: "Archer", cost: 2, health: 1, attack: 2, src: "/armies/humans/archer.jpg"}),
                
                new Card({name: "Légionnaires", cost: 2, health: 2, attack: 1, src: "/armies/humans/legionnaires.jpg"}),
                new Card({name: "Légionnaires", cost: 2, health: 2, attack: 1, src: "/armies/humans/legionnaires.jpg"}),
                new Card({name: "Légionnaires", cost: 2, health: 2, attack: 1, src: "/armies/humans/legionnaires.jpg"}),

                new Card({name: "Fanatique", cost: 2, health: 1, attack: 3, src: "/armies/humans/fanatique.jpg"}),
                new Card({name: "Fanatique", cost: 2, health: 1, attack: 3, src: "/armies/humans/fanatique.jpg"}),

                new Card({name: "Vétéran", cost: 3, health: 3, attack: 2, src: "/armies/humans/veteran.jpg"}),
                new Card({name: "Vétéran", cost: 3, health: 3, attack: 2, src: "/armies/humans/veteran.jpg"}),

                new Card({name: "Chevalier", cost: 3, health: 3, attack: 2, src: "/armies/humans/chevalier.jpg"}),
                new Card({name: "Chevalier", cost: 3, health: 3, attack: 2, src: "/armies/humans/chevalier.jpg"}),
                new Card({name: "Chevalier", cost: 3, health: 3, attack: 2, src: "/armies/humans/chevalier.jpg"}),

                new Card({name: "Mercenaire", cost: 4, health: 3, attack: 3, src: "/armies/humans/mercenaire.jpg"}),
                new Card({name: "Mercenaire", cost: 4, health: 3, attack: 3, src: "/armies/humans/mercenaire.jpg"}),
                new Card({name: "Mercenaire", cost: 4, health: 3, attack: 3, src: "/armies/humans/mercenaire.jpg"}),

                new Card({name: "Mage", cost: 5, health: 2, attack: 5, src: "/armies/humans/oracle.jpg"}),
                new Card({name: "Mage", cost: 5, health: 2, attack: 5, src: "/armies/humans/oracle.jpg"}),
                new Card({name: "Mage", cost: 5, health: 2, attack: 5, src: "/armies/humans/sorcier.jpg"}),
                new Card({name: "Mage", cost: 5, health: 2, attack: 5, src: "/armies/humans/sorcier.jpg"}),

                new Card({name: "Paladin", cost: 5, health: 4, attack: 4, src: "/armies/humans/paladin.jpg"}),
                new Card({name: "Paladin", cost: 5, health: 4, attack: 4, src: "/armies/humans/paladin.jpg"}),

                new Card({name: "Champion", cost: 6, health: 5, attack: 6, src: "/armies/humans/champion.jpg"}),
                new Card({name: "Champion", cost: 6, health: 5, attack: 6, src: "/armies/humans/champion.jpg"})
            ];
        }
        else if (this.deckName == "monsters") {


             this.deck = [
                // new Card({name: "Goule", cost: 1, health: 1, attack: 1}),
                // new Card({name: "Goule", cost: 1, health: 1, attack: 1}),
                // new Card({name: "Goule", cost: 1, health: 1, attack: 1}),
                // new Card({name: "Goule", cost: 1, health: 1, attack: 1}),
                new Card({name: "Squelette", cost: 2, health: 1, attack: 2, src:"/armies/monsters/squelette.jpg"}),
                new Card({name: "Squelette", cost: 2, health: 1, attack: 2, src:"/armies/monsters/squelette.jpg"}),
                new Card({name: "Squelette", cost: 2, health: 1, attack: 2, src:"/armies/monsters/squelette.jpg"}),
                new Card({name: "Squelette", cost: 2, health: 1, attack: 2, src:"/armies/monsters/squelette.jpg"}),
/*
                new Card({name: "Squelette", cost: 2, health: 1, attack: 2, src:"/armies/monsters/squelette2.jpg"}),
                new Card({name: "Squelette", cost: 2, health: 1, attack: 2, src:"/armies/monsters/squelette2.jpg"}),
                new Card({name: "Squelette", cost: 2, health: 1, attack: 2, src:"/armies/monsters/squelette2.jpg"}),
                new Card({name: "Squelette", cost: 2, health: 1, attack: 2, src:"/armies/monsters/squelette2.jpg"}),
                */

                new Card({name: "Mort-vivant", cost: 2, health: 1, attack: 2, src:"/armies/monsters/mort-vivant.jpg"}),
                new Card({name: "Mort-vivant", cost: 2, health: 1, attack: 2, src:"/armies/monsters/mort-vivant.jpg"}),
                new Card({name: "Mort-vivant", cost: 2, health: 1, attack: 2, src:"/armies/monsters/mort-vivant.jpg"}),
                new Card({name: "Mort-vivant", cost: 2, health: 1, attack: 2, src:"/armies/monsters/mort-vivant.jpg"}),

                new Card({name: "Mommie", cost: 3, health: 3, attack: 2, src:"/armies/monsters/mommie.jpg"}),
                new Card({name: "Mommie", cost: 3, health: 3, attack: 2, src:"/armies/monsters/mommie.jpg"}),
                new Card({name: "Mommie", cost: 3, health: 3, attack: 2, src:"/armies/monsters/mommie.jpg"}),

                new Card({name: "Corrompu", cost: 3, health: 3, attack: 2, src:"/armies/monsters/corrompu.jpg"}),
                new Card({name: "Corrompu", cost: 3, health: 3, attack: 2, src:"/armies/monsters/corrompu.jpg"}),
                new Card({name: "Corrompu", cost: 3, health: 3, attack: 2, src:"/armies/monsters/corrompu.jpg"}),

                new Card({name: "Possédé", cost: 4, health: 2, attack: 3, src:"/armies/monsters/possede.jpg"}),
                new Card({name: "Possédé", cost: 4, health: 2, attack: 3, src:"/armies/monsters/possede.jpg"}),
                new Card({name: "Possédé", cost: 4, health: 2, attack: 3, src:"/armies/monsters/possede.jpg"}),

                new Card({name: "Dévoreur", cost: 5, health: 3, attack: 4, src:"/armies/monsters/devoreur.jpg"}),
                new Card({name: "Dévoreur", cost: 5, health: 3, attack: 4, src:"/armies/monsters/devoreur.jpg"}),

                new Card({name: "Éxécuteur", cost: 5, health: 3, attack: 4, src:"/armies/monsters/executeur.jpg"}),
                new Card({name: "Éxécuteur", cost: 5, health: 3, attack: 4, src:"/armies/monsters/executeur.jpg"}),

                new Card({name: "Champion", cost: 5, health: 3, attack: 4, src:"/armies/monsters/champion.jpg"}),
                new Card({name: "Champion", cost: 5, health: 3, attack: 4, src:"/armies/monsters/champion.jpg"}),

                new Card({name: "Abbobination", cost: 6, health: 5, attack: 5, src:"/armies/monsters/abbobination.jpg"}),
                new Card({name: "Abbobination", cost: 6, health: 5, attack: 5, src:"/armies/monsters/abbobination.jpg"}),

                new Card({name: "Prince Démon", cost: 7, health: 5, attack: 7, src:"/armies/monsters/prince-demon.jpg"}),
                new Card({name: "Prince Démon", cost: 7, health: 5, attack: 7, src:"/armies/monsters/prince-demon.jpg"})
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

                if (this.currentMoney >= cardToPlay.cost) {
                    this.hand.splice(i, 1);
                    this.currentMoney -= cardToPlay.cost;

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
