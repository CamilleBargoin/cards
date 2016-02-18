module.exports = function() {

    this.name = Math.floor(Math.random() * 99999);
    this.players = [];

    // maybe
    this.turn = 0;

    var that = this;
    // Methods


    this.checkForDisconnectionInterval = null;

    this.checkForDisconnection = function(currentIo) {

        var io = currentIo;
        that.checkForDisconnectionInterval = setInterval(function() {

            console.log("check");

            for (index in that.players) {

                if (!io.sockets.connected[that.players[index].socketId]) {
                    io.in(that.name).emit("disconnected");

                    //TODO -> disconnected player loses

                    clearInterval(that.checkForDisconnectionInterval);
                    that.players.splice(index, 1);

                    // not sure of this
                    this.checkForDisconnectionInterval = null;
                }
            }
        }, 1000);

    };


};
