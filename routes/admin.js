var express = require('express')
var router = express.Router()

var _ = require('lodash'),
    Promise = require('bluebird'),
    path = require('path'),
    fs = require('fs'),
	formidable = require('formidable')

var Movie = require('../model/movie')
var User = require('../model/user')
var Category = require('../model/category')

//创建一个文件夹存放上传的电影海报图片
var uploadDir = path.normalize(path.join(__dirname, '..', 'public/upload'))
var moviePosterDir = path.join(uploadDir, 'movie-poster')
fs.existsSync(uploadDir) || fs.mkdirSync(uploadDir)
fs.existsSync(moviePosterDir) || fs.mkdirSync(moviePosterDir)

//上传图片的中间件
function savePoster(req, res, next){
	var form = new formidable.IncomingForm()
	form.parse(req, function(err, fields, files){
		if(err) next(err)
		console.log(fields)
		console.log(files)
		var posterData = files.localposter
		var timeStamp = new Date().toLocaleDateString()
		var dir = moviePosterDir + '\\' + timeStamp
		var savePath = dir + '\\' + posterData.name 

		//如果上传了就存放上传图片
		if(posterData.name){
			fs.existsSync(dir) || fs.mkdirSync(dir)
			var rs = fs.createReadStream(posterData.path)
			var ws = fs.createWriteStream(savePath)
			rs.pipe(ws)
			rs.on('end', function(){
				fs.unlinkSync(posterData.path)
			})
			req.fields = fields
			req.fields.poster = '/upload/movie-poster/' + timeStamp + '/' + posterData.name 
			next()

		}
		else{
			req.fields = fields
			next()
		}
	})
}

//后台权限中间件
function adminOnly(req, res, next){
	var user = req.session.user
	if(user && user.role>50){
		return next()
	}
	res.redirect(303, '/unauthorized')

}

//电影录入页
router.get('/movie/add', adminOnly, function(req, res, next){
	Category.fetch(function(err, categories){
		if(err) return next(err)
		res.render('pages/addMovie', {
			title: 'admin 后台电影录入页',
			movie: { },
			categories: categories,	
		})
	

	})
})


//删除电影
router.delete('/movie/:id', adminOnly, function(req, res, next){
	var id = req.params.id
	
	Category.update({movies: {$in: [id]}}, {$pull: {'movies': id}}, {multi: true}).then(function(res){
		console.log(res)
	})


	Movie.remove({_id: id}, function(err){
		if(err) next(err)
		res.json({success: 1})
	})
})

//电影更新页
router.get('/movie/update/:id', adminOnly, function(req, res, next){
	var id = req.params.id
	if(id){
		Movie
		.findOne( {_id: req.params.id})
		.exec(function(err, movie){
			Category.fetch(function(err, categories){
				if(err) return next(err)
				var _movie = {
					id: movie._id,
					title: movie.title,
					director: movie.director,
					language: movie.language,
					country: movie.country,
					poster: movie.poster,
					flash: movie.flash,
					year: movie.year,
					summary: movie.summary,
					category: movie.category,
				}

				res.render('pages/addMovie', {
					title: 'admin page 后台更新页',
					movie: _movie,
					categories: categories
				})
			})
		})
		
	}
})

//录入电影表单的提交
router.post('/movie/new', adminOnly, savePoster, function(req, res, next){

	var movieObj = req.fields

	//将复选框内的值变为数组
	if(!Array.isArray(movieObj.category)){
		var temp = []
		temp.push(movieObj.category)
		movieObj.category = temp
	}
	if(req.poster){
		movieObj.poster = req.poster
	}
	console.log(movieObj)
	var id = movieObj.id

	//方便后面assign操作的赋值更新
	var newCategory = movieObj.newCategory.trim()
	delete movieObj.newCategory

	//如果body里面id有定义，说明是更新数据，否则是添加数据
	if(id) {

		//更新电影分类，分类中关于这部电影的外键全部删除，更新电影类别后，类别对这部的外键，电影对类别的外键重新建立
		Movie.findOne({_id: id})
			.then(function(movie){
				return Category.update({movies: {$in: [movie._id]}}, {$pull: {'movies': movie._id}}, {multi: true})
								.then(function(result){
									return movie
								})	
			})
			.then(function(movie){	
				if(newCategory){
					var c_new = new Category({name: newCategory})
					return c_new.save()
								.then(function(category){
									movieObj.category.push(category._id)
									_.assign(movie, movieObj)
									return movie.save()
								})
				}
				else{
					_.assign(movie, movieObj)
					return movie.save()
				}
			})
			.then(function(movie){
				return Category.update({_id: {$in: movie.category}}, {$push: {'movies': movie._id}}, {multi: true})
			})
			.then(function(result){
				console.log(result)
				res.redirect('/movie/' + id)
			})
			.catch(function(reason){
				return next(reason)
			})
		
	}
	else {
		delete movieObj.id
		
		var p = new Promise(function(resolve, reject){
			var movie = new Movie(movieObj)
			resolve(movie)
		})
		p.then(function(movie){
			if(newCategory){
				var c_new = new Category({name: newCategory})
				return c_new.save()
							.then(function(category){
								movie.category.push(category._id)
								return movie.save()
							})
			}
			else{
				return movie.save()
			}
		})
		.then(function(movie){
			return Category.update({_id: {$in: movie.category}}, {$push: {'movies': movie._id}}, {multi: true})
							.then(function(result){
								console.log(result)
								return movie
							})
		})
		.then(function(movie){
			res.redirect('/movie/' + movie._id)
		})
		.catch(function(reason){
			return next(reason)
		})
				
	}	
})

//获取电影列表
router.get('/movies/list', adminOnly, function(req, res, next){
	Movie.fetch(function(err, movies){
        if(err) next(err)
        var _movies = movies.map(function(movie){
            return {
            	id: movie._id,
                title: movie.title,
                director: movie.director,
                country: movie.country,
                year: movie.year,
            }
        })

        res.render('pages/movieList', { 
            title: 'admin Movie List',
            movies: _movies
        });
	})
})

//获取用户列表
router.get('/users/list', adminOnly, function(req, res, next){
	User.fetch(function(err, users){
        if(err) next(err)
        var _users = users.map(function(user){
            return {
            	id: user._id,
                name: user.username,
                meta: user.meta,
            }
        })

        res.render('pages/userList', { 
            title: 'admin User List',
            users: _users
        });
	})
})

//删除用户
router.delete('/user/:id', adminOnly, function(req, res, next){
	var id = req.params.id
	User.remove({_id: id}, function(err, movie){
		if(err) next(err)
		res.json({success: 1})
	})

})


//获取电影分类列表
router.get('/categories/list', adminOnly, function(req, res, next){
	Category.fetch(function(err, categories){
        if(err) next(err)
        var _categories = categories.map(function(category){
            return {
            	id: category._id,
                name: category.name,
                meta: category.meta,
            }
        })

        res.render('pages/categoryList', { 
            title: 'admin Category List',
            categories: _categories
        });
	})
})

//电影类别录入
router.get('/category/add', adminOnly, function(req, res, next){
	res.render('pages/addCategory', {
		title: 'admin 后台电影类别录入页',
		category: { }

	})
})

//分类录入表单提交
router.post('/category/new', function(req, res, next){
	var _category = req.body
	_category.name.trim()
	var category = new Category(_category)
	category.save(function(err, category){
		if(err) return next(err)
		console.log(category)
		res.redirect('/admin/categories/list')
	})

})

//异步电影分类的删除
router.delete('/category/:id', adminOnly, function(req, res, next){
	var id = req.params.id
	
	
	Movie.update({category: {$in: [id]}}, { $pull: { 'category': id}}, {multi: true}).then(function(res){
		console.log(res)
	})

	Category.remove({_id: id}, function(err){
		if(err) next(err)
		res.json({success: 1})

	})
})


module.exports = router;