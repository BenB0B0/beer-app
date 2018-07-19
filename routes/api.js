var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var User = mongoose.model('User');

//Used for routes that must be authenticated.
function isAuthenticated (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects

	//allow all get request methods
	if(req.method === "GET"){
		return next();
	}
	if (req.isAuthenticated()){
		return next();
	}

	// if the user is not authenticated then redirect him to the login page
	return res.redirect('/#login');
};


/* ---------- API FOR POST MODEL ------------ */
//Register the authentication middleware
router.use('/posts', isAuthenticated);

//api for all posts
router.route('/posts')
	
	//creates a new post
	.post(function(req, res){

		var post = new Post();
		post.beerNameText = req.body.beerNameText;
		post.beerTypeText = req.body.beerTypeText;
		post.beerRatingText = req.body.beerRatingText;
		post.beerCommentsText = req.body.beerCommentsText;

		post.created_by = req.body.created_by;
		post.save(function(err, post) {
			if (err){
				return res.send(500, err);
			}
			return res.json(post);
		});
	})

	.get(function(req, res){

		Post.find(function(err, data){

			if(err){
				return res.send(500, err);
			}

			return res.send(data);

		});
	})

//api for a specfic post
router.route('/posts/:id')
	
	//create
	.put(function(req, res){
		Post.findById(req.params.id, function(err, post){
			if(err)
				res.send(err);

			post.created_by = req.body.created_by;
			post.beerNameText = req.body.beerNameText;
			post.beerTypeText = req.body.beerTypeText;
			post.beerRatingText = req.body.beerRatingText;
			post.beerCommentsText = req.body.beerCommentsText;

			post.save(function(err, post){
				if(err)
					res.send(err);

				res.json(post);
			});
		});
	})

	.get(function(req, res){
		Post.findById(req.params.id, function(err, post){
			if(err)
				res.send(err);
			res.json(post);
		});
	}) 

	.delete(function(req, res) {
		Post.remove({
			_id: req.params.id
		}, function(err) {
			if (err)
				res.send(err);
			res.json("deleted");
		});
	});

/* ---------- API FOR USER MODEL ------------ */
//Register the authentication middleware
router.use('/users', isAuthenticated);
//api for all users
router.route('/users')
	
	.get(function(req, res){
		User.find(function(err, data){
			if(err){
				return res.send(500, err);
			}
			return res.send(data);
		});
	})

//api for a specfic user
router.route('/users/:id')

	.get(function(req, res){
		User.findById(req.params.id, function(err, user){
			if(err)
				res.send(err);
			res.json(user);
		});
	}) 

	.delete(function(req, res) {
		User.remove({
			_id: req.params.id
		}, function(err) {
			if (err)
				res.send(err);
			res.json("deleted");
		});
	});

module.exports = router;