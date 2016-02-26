var express = require('express');
var router = express.Router();

var appName = 'Cards';

var Player = require('../Player');


/* GET home page. */
router.get('/', function(req, res, next) {

    var info = (req.session.customInfo)? req.session.customInfo: null;
    req.session.customInfo = null;

    res.render('index', {
        title: appName,
        login: null,
        info: info
    });
});


router.get('/fail-authenticate', function(req, res, next) {
    res.render('index', {
        title: appName,
        login: null,
        failAuth: true
    });
});


router.get('/home', function(req, res, next) {

    if (req.session && req.session.userId) {

        var currentPlayer = new Player({login: req.session.login});


        currentPlayer.get(function(user) {

            if (user != null) {

                req.session.player = user;

                res.render('home', {
                    title: appName,
                    player: user,
                    registrationDate: new Date(user.at).toLocaleDateString()
                });
            }
            else {
                // membre n'existe pas
                req.session.customInfo = "Accès refusé";
                res.redirect("/");
            }
        });


    } else {
        // no session
        req.session.customInfo = "Accès refusé";
        res.redirect("/");
    }


});


module.exports = router;
