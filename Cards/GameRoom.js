module.exports = function() {

    this.name = Math.floor(Math.random() * 99999);
    this.players = [];

    this.firstPlayer = Math.floor( Math.random() * 2);
    this.isPlaying = this.firstPlayer;
    // maybe
    this.turn = 0;

    var that = this;



    this.checkForDisconnectionInterval = null;

    this.checkForDisconnection = function(currentIo) {

        var io = currentIo;
        that.checkForDisconnectionInterval = setInterval(function() {

            for (index in that.players) {

                if (!io.sockets.connected[that.players[index].socketId]) {
                    io.in(that.name).emit("disconnected");

                    //TODO -> disconnected player loses
                    //
                    that.players[index].saveGameResult(false);

                    clearInterval(that.checkForDisconnectionInterval);
                    that.players.splice(index, 1);

                    // not sure of this
                    this.checkForDisconnectionInterval = null;
                }
            }
        }, 1000);

    };

    this.changeTurn = function() {
        this.isPlaying = 1 - this.isPlaying;
        this.turn ++;

        this.players[this.isPlaying].resource ++;

    };




};
