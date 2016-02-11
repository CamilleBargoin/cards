var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.all('/login', function(req, res, next) {

    console.log("haaaa");
    res.render('main', {
        title: "Cards"
    });
});

module.exports = router;
