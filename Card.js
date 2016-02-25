module.exports = function(cardData) {

    this.name = (cardData.name) ? cardData.name : null;
    this.description = (cardData.description) ? cardData.description :"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod";
    this.src = (cardData.src) ? cardData.src : null;
    this.cost = (cardData.cost) ? cardData.cost : 0;
    this.health = (cardData.health) ? cardData.health : 0;
    this.attack  = (cardData.attack) ? cardData.attack : 0;


    this.image = (cardData.image) ? cardData.image : null;

    this.updateHealth = function(number) {
        this.health += number;
    };

};
