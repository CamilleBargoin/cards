var express = require('express');
var router = express.Router();
var colors = require('colors');
var bcrypt = require('bcryptjs');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});



router.get("/logout", function(req, res, next) {
	console.log("logging out".red);
	if(req.session) {
		req.session.destroy(function(err) {

			if(!err)
	      		res.redirect( "/");

	 	});
	}
	else
		res.redirect( "/");

});



router.post('/login', function(req, res, next) {

	if (req.body && req.body.login && req.body.password) {

		var db = req.db.get();
		var collection = db.collection('users');
		var loggedInUser = null;

		collection.find({login: req.body.login}).toArray(function(err, docs) {
			if (!err ) {

				if (docs.length === 0) {
					req.session.customInfo = "Identifiant et/ou mot de passe incorrect(s)";
					res.redirect("/");
				}
				else {

					for (var i = 0; i < docs.length; i++) {
						if (validPassword(req.body.password, docs[i].password)) {
							loggedInUser = docs[i];
							req.session.login = loggedInUser.login;
							req.session.userId = loggedInUser._id;
							req.session.avatar = loggedInUser.avatar;

							res.redirect('/home');
							break;
						}
					}

					if (!loggedInUser) {
						req.session.customInfo = "Identifiant et/ou mot de passe incorrect(s)";
						res.redirect("/");
					}

					
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
							password: generateHash(req.body.password),
							email: req.body.email,
							at: new Date().getTime(),
							games: []
					}, function(err, result) {
						if (!err) {
							if (result.result.ok == 1) {

								req.session.login = result.ops[0].login;
								req.session.userId = result.ops[0]._id;
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


router.post('/update-avatar', function(req, res, next) {

	if (req.body && req.body.avatar && req.session && req.session.userId) {

		var db = req.db.get();
		var collection = db.collection('users');
		var mongo = require('mongodb');

		collection.findOneAndUpdate({
			_id: new mongo.ObjectId(req.session.userId)
		}, {
			$set: {
				avatar: req.body.avatar
			}
		}, {
			returnNewDocument: true
		}, function(e) {
			console.log("update avatar".magenta);
			res.json({status: 1});
		});

	}
	else {
		//user not connected
		req.session.customInfo = "Accès refusé";
        res.redirect("/");
	}
});

router.post('/choose-deck', function(req, res, next) {

	if (req.session && req.session.userId) {

		if (req.body && req.body.deck) {

			var db = req.db.get();
			var collection = db.collection('users');
			var mongo = require('mongodb');

			collection.findOneAndUpdate({
				_id: new mongo.ObjectId(req.session.userId)
			}, {
				$set: {
					deckName: req.body.deck
				}
			}, {
				returnNewDocument: true
			}, function(e) {
				console.log("change deck to ".magenta + req.body.deck.magenta );
				res.json({deck: req.body.deck});
			});
		}
	}
	else {
		// user not connected
		req.session.customInfo = "Accès refusé";
        res.redirect("/");
	}
});


var generateHash = function(password) {
	var salt = bcrypt.genSaltSync(10);
	return bcrypt.hashSync(password, salt);
};

var validPassword = function(password, hash) {
	return bcrypt.compareSync(password, hash);
};



module.exports = router;
