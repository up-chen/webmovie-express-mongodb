var mongoose = require('mongoose')
var bcrypt = require('bcryptjs')

mongoose.Promise = require('bluebird')

var UserSchema = new mongoose.Schema({
	username: {
		type: String,
		require: true
	},	
	password: {
		type: String,
		require: true
	},
	role: {
		type: Number,
		dafault: 0
	}, 
	meta: {
		createAt: {
			type: Date,
			default: Date.now()
		},
		updateAt: {
			type: Date,
			default: Date.now()
		}
	}
})

UserSchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now()
    } else {
        this.meta.updateAt = Date.now()
    }
    var user = this
    bcrypt.genSalt(10, function(err, salt){
    	if(err) return next(err)
    	bcrypt.hash(user.password, salt, function(err, hash){
    		if(err) return next(err)
    		user.password = hash
    		next()
    	})
    })
})

UserSchema.methods.comparePassword = function(pwd, cb){
	bcrypt.compare(pwd, this.password, function(err, isMatch){
		if(err) return cb(err)
		cb(null, isMatch)
	})
}

UserSchema.statics = {
	fetch: function(cb){
		return this
			.find({})
			.sort('meta.updateAt')
			.exec(cb)
	},

	findById: function(id, cb){
		return this
			.findOne({_id: id})
			.exec(cb)
	}
}

var User = mongoose.model('User', UserSchema);
module.exports = User;