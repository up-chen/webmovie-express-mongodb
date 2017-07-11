var express = require('express');
var router = express.Router();

var Movie = require('../model/movie')
var Comment = require('../model/comment')

router.get('/:id', function(req, res, next) {
	var movieId = req.params.id
	Movie
		.findOne({_id: req.params.id})
		.populate('category')
		.exec(function(err, movie){
			if(err) return next(err)
			Comment
				.find({movie: movie._id})
				.populate('from')
				.populate('reply.from reply.to')
				.exec(function(err, comments){
					if(err) return next(err)
					
					var _movie = {
						id: movie._id,
						director: movie.director,
						country: movie.country,
						title: movie.title,
						year: movie.year,
						poster: movie.poster,
						language: movie.language,
						flash: movie.flash,
						summary: movie.summary,
						category: movie.category,
					}

					var _comments = comments.map(function(comment){
						return {
							username: comment.from.username,
							userId: comment.from._id,
							content: comment.content,
							reply: comment.reply,
							id: comment._id,
						}
					})
					res.render('pages/movieDetail', {
						title: 'Movie detail',
						movie: _movie,
						comments: _comments,
					})
				})	
		})
})

module.exports = router;