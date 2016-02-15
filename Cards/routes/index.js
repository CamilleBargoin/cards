var express = require('express');
var router = express.Router();

var appName = 'Cards';

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("> index");
    res.render('index', {
        title: appName,
        login: null
    });
});


router.get('/fail-authenticate', function(req, res, next) {
    res.render('index', {
        title: appName,
        login: null,
        failAuth: true
    });
});

router.get('/game', function(req, res, next) {
    res.render('game', {
        title: appName
    });
});

router.get('/home', function(req, res, next) {

    if (req.session && req.session.userId) {
        var db = req.db.get();
        var collection = db.collection('users');
        var mongo = require('mongodb');

        console.log(req.session);
        console.log('___________');

        collection.findOne({_id: new mongo.ObjectId(req.session.userId)}, function(err, doc) {

            if (!err) {
                if (doc != null) {
                    console.log(doc);
                    console.log(new Date(doc.at).toLocaleDateString());
                    res.render('main', {
                        title: appName,
                        login: doc.login,
                        registrationDate: new Date(doc.at).toLocaleDateString(),
                        games: doc.games,
                        victories: (doc.victories / doc.games * 100).toFixed(2),
                        avatar: doc.avatar
                    });
                }
                else {
                    // membre n'existe pas
                }
            }

        });

    } else {
        // no session
        res.redirect("/");
    }


});



module.exports = router;
