var express = require('express');
var router = express.Router();
var Movie = require('../model/movie')
var Category = require('../model/category')

/* GET home page. */
router.get('/', function(req, res, next) {
    Category
        .find({})
        .populate({path: 'movies' , options: {limit: 5}})
        .exec(function(err, categories){
            if(err) return next(err)
             res.render('pages/index', { 
                    title: 'Movie',
                    categories: categories,
            })   
        })       
})

module.exports = router;
