var express = require('express')
var router = express.Router()

var Promise = require('bluebird')

var Category = require('../model/category.js')
var Movie = require('../model/movie.js')

router.post('/verify/add', function(req, res, next){
	var newCategory = req.body.newCategory
	if(newCategory){
		Category.find({name: newCategory}, function(err, category){
			if(err) return next(err)
			if(category && category.length>0){
				res.json({error: '类别已存在'})
			}
			else{
				res.json({success: '添加成功'})
			}
		})
	}
	

})

router.get('/:id', function(req, res, next){
	var id = req.params.id
	var page = parseInt(req.query.p, 10) || 1

	var options = {
		limit: 2,
		page: page,

	}
	Category
		.findOne({_id: id})
		.then(function (category) {
			return Movie
					.paginate({category: {$in: [id]}}, options)
					.then(function (result) {
						var link = '/category/' + id + '?p='
						var context = {
							name: category.name,
							cpage: result.page,
							pages: result.pages,
							link: link,
							movies: result.docs
						}
						res.render('pages/moviesInCategory', context)
					})
		})
		.catch(function (err) {
			next(err)
		})
	
})


module.exports = router;