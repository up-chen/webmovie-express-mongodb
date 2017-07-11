var express = require('express')
var router = express.Router()
var bcrypt = require('bcryptjs')

var User = require('../model/user.js')
var Comment = require('../model/comment.js')

//登录用户权限中间件
function signinedOnly (req, res, next){
	if(req.session.user){
		return next()
	}

	res.redirect('/signin')
}


/* GET user information */
router.get('/info/:id', signinedOnly, function(req, res, next) {
  var id = req.params.id
  User.findOne({_id: id}, function(err, user){
  	if(err) return next(err)
  	var _user = {
  		username: user.username,
  	}
  	res.render('pages/user',{
  		user: _user
  	})
  })
});

//注册
router.post('/signup', function(req, res, next){
	var _user = req.body
	if (_user){
		var user = new User(_user)
		user.save(function(err,user){
			if(err) return next(err)
			req.session.user = user
			res.json({success: '注册成功'})
		})
	}
})

//登录
router.post('/signin', function(req, res, next){
	var _user = req.body
	console.log(_user)
	if(_user) {
		User.findOne({username: _user.username}, function(err, user){
			if(err) return next(err)
			if(user){
				user.comparePassword(_user.password, function(err, isMatch){
					if(err) return next(err)
					if(isMatch){
						req.session.user = user
						res.json({success:'登录成功'})
					}
					else{
						res.json({passwordError:'密码错误'})
					}
				})
			}
			else{
				res.json({nameError:'用户名不存在'})
			}
		})
	}
})

//登出
router.get('/signout', function(req, res, next){
	delete req.session.user
	delete res.locals.user

	res.redirect('/')

})

//用户的评论
router.post('/comment', function(req, res, next){
	var UserId = req.session.user._id
	var _cid = req.body.commentId
	var _commentFromId = req.body.commentFromId

	//由cid判断是否是回复的评论
	if(_cid){
		Comment.findOne({_id: _cid}, function(err, comment){
			if(err) return next(err)
			var _reply = {
				from: UserId,
				to: _commentFromId,
				content: req.body.content,
			}

			comment.reply.push(_reply)
			comment.save(function(err, comment){
				if(err) return next(err)
				res.redirect('/movie/' + req.body.movieId)
			})
		})
	}
	//否则就是对电影的普通评论
	else{
		if(UserId){
			console.log(UserId)
			var _comment = new Comment({
				movie: req.body.movieId,
				from: UserId,
				content: req.body.content,
			})
			_comment.save(function(err, comment){
				if(err) return next(err)
				console.log(comment)

				res.redirect('/movie/' + req.body.movieId)
			})
		}
	}
})

//表单提交前的关于用户名是否存在的查询请求
router.get('/verify/signup', function(req, res, next){
	var name = req.query.username
	User.findOne({username: name}, function(err, user){
		if (err) {return next(err)}
		if(user) {
			res.send("false")
		}
		else{
			res.send("true")
		}
	})
})


module.exports = router;
