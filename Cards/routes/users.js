var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});




router.post('/login', function(req, res, next) {

	if (req.body && req.body.login && req.body.password) {

		var db = req.db.get();
		var collection = db.collection('users');

		collection.findOne({login: req.body.login, password: req.body.password}, function(err, doc) {
			if (!err ) {
				if (doc == null) {
					res.redirect("/fail-authenticate");
				}
				else {

					req.session.login = doc.login;
					req.session.id = doc._id;

					res.redirect('/home/');
				}
			}
			else {
				console.log(err);
			}
		});
	}
});

router.post('/register', function(req, res, next) {
	if (req.body && req.body.login && req.body.password && req.body.email) {


		var db = req.db.get();
		var collection = db.collection('users');

		collection.findOne({login: req.body.login}, function(err, doc) {
			if (!err) {
				if (doc == null) {
					collection.insertOne({
							login: req.body.login,
							password: req.body.password,
							email: req.body.email,
							at: new Date().getTime(),
							games: 0,
							victories: 0
					}, function(err, result) {
						if (!err) {
							if (result.result.ok == 1) {

								req.session.login = result.ops[0].login;
								req.session.id = result.ops[0]._id;
								res.redirect("/home");
							}
							console.log(result);
						}
					});

				}
				else {
					// Login already exists in DB
					res.redirect('/');
				}
			}
		});



	}
});







module.exports = router;
