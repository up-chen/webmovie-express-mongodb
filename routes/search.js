var express = require('express')
var router = express.Router()
var _ = require('lodash')

var Movie = require('../model/movie')
var Category = require('../model/category')

router.get('/results', function (req, res, next) {
	var page = parseInt(req.query.p, 10) || 1
	var keyword = req.query.q
	var re = new RegExp(keyword, 'gmi')

	Movie
		.paginate({title: {$regex: keyword, $options: 'six'}},{limit:2, page: page})
		.then(function(result){
			var link = '/results/?q=' + keyword + '&p='
			var context = {
				title: '搜索结果',
				keyword: keyword,
				cpage: result.page,
				pages: result.pages,
				link: link,
				movies: result.docs
			}
			res.render('pages/results', context)
		})
		.catch(function(err){
			next(err)
		})

})

module.exports = router
