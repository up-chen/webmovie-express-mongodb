var Moive = require('../../model/movie.js')

var id = $('#movieId').val()
if(id){
	Movie.findOne({_id: id}, function(err, movie){
		if(err) return next(err)
		$('input[type="checkbox"]').each(function(){
			if(movie.category.indexOf($(this).val())!== -1){
				$(this).attr('checked', 'true')
			}
		})
	})	
}
