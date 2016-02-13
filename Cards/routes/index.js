var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Cards',
        username: null
    });
});

router.get('/game', function(req, res, next) {
    res.render('game', {
        title: 'Cards'
    });
});

router.get('/main', function(req, res, next) {
    res.render('main', {
        title: 'Cards'
    });
});



module.exports = router;
