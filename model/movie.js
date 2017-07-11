var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var MovieSchema = new Schema({
	title: String,
	director: String,
	country: String,
	year: Number,
	language: String,
	poster: String,
	flash: String,
	summary: String,
	category:[{
		type: ObjectId,
		ref: 'Category'
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

MovieSchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now();
    } else {
        this.meta.updateAt = Date.now();
    }
    next()

})

MovieSchema.statics = {
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

MovieSchema.plugin(mongoosePaginate)
var Movie = mongoose.model('Movie', MovieSchema);
module.exports = Movie;