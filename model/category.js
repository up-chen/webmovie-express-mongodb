var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

mongoose.Promise = require('bluebird')

var CategorySchema = new Schema({
	name: {
		type: String,
		unique: true,
	},
	movies: [{
		type: ObjectId,
		ref: 'Movie'
	}],
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

CategorySchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now()
    } else {
        this.meta.updateAt = Date.now()
    }

    next()
})

CategorySchema.statics = {
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

var Category = mongoose.model('Category', CategorySchema);
module.exports = Category;