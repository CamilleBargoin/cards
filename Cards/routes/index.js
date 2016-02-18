var express = require('express');
var router = express.Router();

var appName = 'Cards';

/* GET home page. */
router.get('/', function(req, res, next) {

    console.log(req.session);

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
        var db = req.db.get();
        var collection = db.collection('users');
        var mongo = require('mongodb');

        console.log(req.session);

        collection.findOne({_id: new mongo.ObjectId(req.session.userId)}, function(err, doc) {

            if (!err) {
                if (doc != null) {
                    res.render('home', {
                        title: appName,
                        login: doc.login,
                        registrationDate: new Date(doc.at).toLocaleDateString(),
                        games: doc.games,
                        avatar: doc.avatar
                    });
                }
                else {
                    // membre n'existe pas
                    req.session.customInfo = "Accès refusé";
                    res.redirect("/");
                }
            }

        });

    } else {
        // no session
        req.session.customInfo = "Accès refusé";
        res.redirect("/");
    }


});



module.exports = router;
